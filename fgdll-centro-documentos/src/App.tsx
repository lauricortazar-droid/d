/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MasterTemplate,
  CenterProfile,
  SavedDocument,
  Role,
  StyleThemeId,
} from './types';
import { INITIAL_CENTERS, INITIAL_TEMPLATES, STYLE_THEMES } from './data/initialData';
import { Navbar } from './components/Navbar';
import { TemplateLibrary } from './components/TemplateLibrary';
import { DocumentEditor } from './components/DocumentEditor';
import { MyDocuments } from './components/MyDocuments';
import { IdentityManager } from './components/IdentityManager';
import { CenterProfileModal } from './components/CenterProfileModal';
import { UploadFormatModal } from './components/UploadFormatModal';
import { BackupModal, BackupPayload } from './components/BackupModal';
import { loadJSON, loadString, saveJSON, saveString, isArrayOfObjectsWithId } from './utils/storage';

const formatFolio = (center: CenterProfile) =>
  `${center.folioPrefix}-${String(center.currentFolioNumber).padStart(4, '0')}`;

const STORAGE_KEYS = {
  CENTERS: 'fgdll_centers_v1',
  TEMPLATES: 'fgdll_templates_v1',
  DOCUMENTS: 'fgdll_documents_v1',
  ACTIVE_CENTER_ID: 'fgdll_active_center_id_v1',
  ROLE: 'fgdll_user_role_v1',
  THEME_ID: 'fgdll_theme_id_v1',
};

const INITIAL_DOCUMENTS: SavedDocument[] = [
  {
    id: 'doc-sample-1',
    templateId: 'temp-ingreso-centro',
    templateName: 'Ficha de Ingreso y Carta de Consentimiento Informado',
    category: 'Formatos para centros',
    title: 'Ficha de Ingreso - Juan Carlos Valenzuela',
    centerId: INITIAL_CENTERS[0].id,
    centerName: INITIAL_CENTERS[0].officialName,
    directorName: INITIAL_CENTERS[0].directorName,
    createdAt: '2026-09-20',
    updatedAt: '2026-09-22',
    status: 'finalizado',
    folio: 'RN-AGU-0104',
    size: 'Carta',
    orientation: 'portrait',
    themeId: 'fgdll_oficial',
    customValues: {
      'blk-folio-date': 'Folio Oficial: RN-AGU-0104 | Fecha y Hora de Ingreso: 22 de Septiembre de 2026 | Zona Operativa: Águila',
    },
  },
  {
    id: 'doc-sample-2',
    templateId: 'temp-diploma-sobriedad',
    templateName: 'Reconocimiento / Diploma de Aniversario de Sobriedad',
    category: 'Reconocimientos',
    title: 'Diploma 3 Años - Roberto Ramírez E.',
    centerId: INITIAL_CENTERS[0].id,
    centerName: INITIAL_CENTERS[0].officialName,
    directorName: INITIAL_CENTERS[0].directorName,
    createdAt: '2026-09-15',
    updatedAt: '2026-09-18',
    status: 'finalizado',
    folio: 'RN-AGU-0103',
    size: 'Carta',
    orientation: 'landscape',
    themeId: 'fgdll_oficial',
    customValues: {},
  },
];

const folioSequence = (folio: string, prefix: string): number => {
  if (!folio || !folio.startsWith(`${prefix}-`)) return NaN;
  return parseInt(folio.slice(prefix.length + 1), 10);
};

/**
 * Garantiza que el siguiente folio de cada centro nunca coincida con uno ya usado
 * (corrige datos guardados con el consecutivo desfasado).
 */
const reconcileFolios = (centers: CenterProfile[], documents: SavedDocument[]): CenterProfile[] =>
  centers.map((c) => {
    let highest = c.currentFolioNumber - 1;
    documents.forEach((d) => {
      if (d.centerId !== c.id) return;
      const n = folioSequence(d.folio, c.folioPrefix);
      if (!Number.isNaN(n) && n > highest) highest = n;
    });
    return highest + 1 > c.currentFolioNumber ? { ...c, currentFolioNumber: highest + 1 } : c;
  });

type PendingExport = { docId: string; format: 'pdf' | 'png' } | null;

export default function App() {
  const [documents, setDocuments] = useState<SavedDocument[]>(() =>
    loadJSON(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS, isArrayOfObjectsWithId)
  );

  const [centers, setCenters] = useState<CenterProfile[]>(() =>
    reconcileFolios(
      loadJSON(STORAGE_KEYS.CENTERS, INITIAL_CENTERS, (v) => isArrayOfObjectsWithId(v) && (v as unknown[]).length > 0),
      documents
    )
  );

  const [activeCenterId, setActiveCenterId] = useState<string>(
    () => loadString(STORAGE_KEYS.ACTIVE_CENTER_ID) || INITIAL_CENTERS[0].id
  );

  // Centro activo (si el guardado ya no existe, se usa el primero)
  const activeCenter = centers.find((c) => c.id === activeCenterId) || centers[0] || INITIAL_CENTERS[0];

  // Rol: 'ADMIN' | 'DIRECTOR'
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const saved = loadString(STORAGE_KEYS.ROLE);
    return saved === 'ADMIN' || saved === 'DIRECTOR' ? saved : 'DIRECTOR';
  });

  const [activeThemeId, setActiveThemeId] = useState<StyleThemeId>(() => {
    const saved = loadString(STORAGE_KEYS.THEME_ID);
    return saved && STYLE_THEMES[saved] ? (saved as StyleThemeId) : 'fgdll_oficial';
  });

  const [templates, setTemplates] = useState<MasterTemplate[]>(() =>
    loadJSON(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES, (v) => isArrayOfObjectsWithId(v) && (v as unknown[]).length > 0)
  );

  // Current view navigation: 'library' | 'my_docs' | 'identity' | 'editor'
  const [activeView, setActiveView] = useState<'library' | 'my_docs' | 'identity' | 'editor'>('library');

  // Currently editing template / document in DocumentEditor
  const [editingTemplate, setEditingTemplate] = useState<MasterTemplate | null>(null);
  const [editingSavedDocument, setEditingSavedDocument] = useState<SavedDocument | undefined>(undefined);

  // Modals
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [pendingExport, setPendingExport] = useState<PendingExport>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const storageWarned = useRef(false);

  // Persistencia en el navegador (con aviso si el almacenamiento está lleno)
  const persist = (ok: boolean) => {
    if (!ok && !storageWarned.current) {
      storageWarned.current = true;
      showToast('No se pudo guardar en este dispositivo (almacenamiento lleno). Descarga un respaldo.', 8000);
    }
    if (ok) storageWarned.current = false;
  };

  useEffect(() => persist(saveJSON(STORAGE_KEYS.CENTERS, centers)), [centers]);
  useEffect(() => persist(saveString(STORAGE_KEYS.ACTIVE_CENTER_ID, activeCenterId)), [activeCenterId]);
  useEffect(() => persist(saveString(STORAGE_KEYS.ROLE, currentRole)), [currentRole]);
  useEffect(() => persist(saveString(STORAGE_KEYS.THEME_ID, activeThemeId)), [activeThemeId]);
  useEffect(() => persist(saveJSON(STORAGE_KEYS.TEMPLATES, templates)), [templates]);
  useEffect(() => persist(saveJSON(STORAGE_KEYS.DOCUMENTS, documents)), [documents]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string, ms = 3500) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), ms);
  };

  // Center update
  const handleSaveCenter = (updatedCenter: CenterProfile) => {
    setCenters((prev) =>
      prev.map((c) => (c.id === updatedCenter.id ? updatedCenter : c))
    );
    showToast(`Perfil de "${updatedCenter.shortName}" actualizado.`);
  };

  // Template select to customize
  const handleSelectTemplateToUse = (template: MasterTemplate) => {
    setEditingTemplate(template);
    setEditingSavedDocument(undefined);
    setActiveView('editor');
  };

  // Template select to edit master (admin)
  const handleEditMasterTemplate = (template: MasterTemplate) => {
    setEditingTemplate(template);
    setEditingSavedDocument(undefined);
    setActiveView('editor');
  };

  // Duplicate template
  const handleDuplicateTemplate = (template: MasterTemplate) => {
    const duplicated: MasterTemplate = {
      ...template,
      id: `temp-${Date.now()}`,
      name: `${template.name} (Copia)`,
      version: '1.0',
      updatedAt: new Date().toISOString().split('T')[0],
      isFavorite: false,
    };
    setTemplates((prev) => [duplicated, ...prev]);
    showToast(`Plantilla "${template.name}" duplicada.`);
  };

  // Toggle favorite
  const handleToggleFavorite = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  // New template created from upload
  const handleSaveUploadedTemplate = (newTemplate: MasterTemplate) => {
    setTemplates((prev) => [newTemplate, ...prev]);
    showToast(`Nuevo formato "${newTemplate.name}" agregado a la biblioteca.`);
  };

  // Guardar documento desde el editor
  const handleSaveDocument = (doc: SavedDocument) => {
    const isNew = !documents.some((d) => d.id === doc.id);

    setDocuments((prev) =>
      prev.some((d) => d.id === doc.id) ? prev.map((d) => (d.id === doc.id ? doc : d)) : [doc, ...prev]
    );

    // El consecutivo de folio avanza sólo al crear un documento nuevo
    if (isNew) {
      setCenters((prev) =>
        prev.map((c) => (c.id === doc.centerId ? { ...c, currentFolioNumber: c.currentFolioNumber + 1 } : c))
      );
    }

    showToast(`Documento "${doc.title}" guardado en Mis Documentos.`);
  };

  // Master template update from editor
  const handleUpdateMasterTemplate = (updated: MasterTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  // Open existing document from Mis Documentos
  const handleOpenDocument = (doc: SavedDocument) => {
    const tmpl = templates.find((t) => t.id === doc.templateId) || templates[0];
    setEditingTemplate(tmpl);
    setEditingSavedDocument(doc);
    setActiveView('editor');
  };

  // Duplicar documento guardado (con folio nuevo y único)
  const handleDuplicateDocument = (doc: SavedDocument) => {
    const owner = centers.find((c) => c.id === doc.centerId) || activeCenter;
    const today = new Date().toISOString().split('T')[0];
    const duplicated: SavedDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      title: `${doc.title} (Copia)`,
      folio: formatFolio(owner),
      createdAt: today,
      updatedAt: today,
      status: 'borrador',
    };
    setDocuments((prev) => [duplicated, ...prev]);
    setCenters((prev) =>
      prev.map((c) => (c.id === owner.id ? { ...c, currentFolioNumber: c.currentFolioNumber + 1 } : c))
    );
    showToast('Documento duplicado.');
  };

  // Delete saved document
  const handleDeleteDocument = (docId: string) => {
    if (confirm('¿Deseas eliminar este documento?')) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      showToast('Documento eliminado.');
    }
  };

  // Archive saved document
  const handleArchiveDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, status: d.status === 'archivado' ? 'finalizado' : 'archivado' }
          : d
      )
    );
    showToast('Estado del documento actualizado.');
  };

  // Exportar desde la lista: abre el documento y descarga automáticamente
  const handleExportDocumentFromList = (doc: SavedDocument, format: 'pdf' | 'png') => {
    const tmpl = templates.find((t) => t.id === doc.templateId) || templates[0];
    setEditingTemplate(tmpl);
    setEditingSavedDocument(doc);
    setPendingExport({ docId: doc.id, format });
    setActiveView('editor');
    showToast('Preparando la descarga...');
  };

  // Respaldo y restauración
  const handleExportBackup = () => {
    const payload: BackupPayload = {
      app: 'fgdll-centro-documentos',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { centers, templates, documents, activeCenterId, themeId: activeThemeId },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FGDLL_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Respaldo descargado.');
  };

  const handleImportBackup = (payload: BackupPayload) => {
    if (!confirm('Esto reemplazará los centros, plantillas y documentos actuales por los del respaldo. ¿Continuar?')) return;
    const d = payload.data;
    setCenters(reconcileFolios(d.centers as CenterProfile[], d.documents as SavedDocument[]));
    setTemplates(d.templates as MasterTemplate[]);
    setDocuments(d.documents as SavedDocument[]);
    if (typeof d.activeCenterId === 'string') setActiveCenterId(d.activeCenterId);
    if (typeof d.themeId === 'string' && STYLE_THEMES[d.themeId]) setActiveThemeId(d.themeId as StyleThemeId);
    setActiveView('library');
    setEditingTemplate(null);
    setEditingSavedDocument(undefined);
    setIsBackupOpen(false);
    showToast('Respaldo restaurado correctamente.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 max-w-sm bg-amber-500 text-slate-950 px-4 py-2.5 rounded-lg shadow-xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onChangeRole={(newRole) => {
          setCurrentRole(newRole);
          showToast(`Modo cambiado a: ${newRole === 'ADMIN' ? 'Administrador' : 'Director'}`);
        }}
        centers={centers}
        activeCenter={activeCenter}
        onSelectCenter={(c) => {
          setActiveCenterId(c.id);
          showToast(`Centro activo: ${c.shortName}`);
        }}
        activeView={activeView === 'editor' ? 'library' : activeView}
        onChangeView={(view) => {
          setActiveView(view);
          setEditingTemplate(null);
          setEditingSavedDocument(undefined);
        }}
        onOpenCenterSettings={() => setIsCenterModalOpen(true)}
        onOpenUploadFormat={() => setIsUploadModalOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {activeView === 'library' && (
          <TemplateLibrary
            templates={templates}
            onSelectTemplateToUse={handleSelectTemplateToUse}
            onEditMasterTemplate={handleEditMasterTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onToggleFavorite={handleToggleFavorite}
            onOpenUploadFormat={() => setIsUploadModalOpen(true)}
            currentRole={currentRole}
            activeZone={activeCenter.zone}
          />
        )}

        {activeView === 'my_docs' && (
          <MyDocuments
            documents={documents.filter((d) => d.centerId === activeCenter.id || currentRole === 'ADMIN')}
            onOpenDocument={handleOpenDocument}
            onDuplicateDocument={handleDuplicateDocument}
            onDeleteDocument={handleDeleteDocument}
            onArchiveDocument={handleArchiveDocument}
            onExportDocument={handleExportDocumentFromList}
            activeCenter={activeCenter}
          />
        )}

        {activeView === 'identity' && (
          <IdentityManager
            currentThemeId={activeThemeId}
            onSelectTheme={(tId) => {
              setActiveThemeId(tId);
              showToast(`Estilo oficial aplicado: ${STYLE_THEMES[tId]?.name}`);
            }}
            activeCenter={activeCenter}
            onOpenCenterSettings={() => setIsCenterModalOpen(true)}
          />
        )}

        {activeView === 'editor' && editingTemplate && (
          <DocumentEditor
            key={editingSavedDocument?.id || editingTemplate.id}
            template={editingTemplate}
            activeCenter={activeCenter}
            currentRole={currentRole}
            savedDocument={editingSavedDocument}
            onBack={() => setActiveView(editingSavedDocument ? 'my_docs' : 'library')}
            onSaveDocument={handleSaveDocument}
            autoExport={pendingExport && pendingExport.docId === editingSavedDocument?.id ? pendingExport.format : undefined}
            onAutoExportDone={() => setPendingExport(null)}
            onNotify={showToast}
            onUpdateMasterTemplate={handleUpdateMasterTemplate}
          />
        )}
      </main>

      {/* Center Settings Modal */}
      {isCenterModalOpen && (
        <CenterProfileModal
          isOpen={isCenterModalOpen}
          onClose={() => setIsCenterModalOpen(false)}
          center={activeCenter}
          onSave={handleSaveCenter}
        />
      )}

      {/* Backup Modal */}
      {isBackupOpen && (
        <BackupModal
          onClose={() => setIsBackupOpen(false)}
          onExport={handleExportBackup}
          onImport={handleImportBackup}
        />
      )}

      {/* Upload Format Modal */}
      {isUploadModalOpen && (
        <UploadFormatModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSaveTemplate={handleSaveUploadedTemplate}
          activeZone={activeCenter.zone}
        />
      )}
    </div>
  );
}
