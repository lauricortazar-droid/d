/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MasterTemplate,
  CenterProfile,
  SavedDocument,
  Role,
  StyleThemeId,
  PaperSize,
} from './types';
import { INITIAL_CENTERS, INITIAL_TEMPLATES, STYLE_THEMES } from './data/initialData';
import { Navbar } from './components/Navbar';
import { TemplateLibrary } from './components/TemplateLibrary';
import { DocumentEditor } from './components/DocumentEditor';
import { MyDocuments } from './components/MyDocuments';
import { IdentityManager } from './components/IdentityManager';
import { CenterProfileModal } from './components/CenterProfileModal';
import { UploadFormatModal } from './components/UploadFormatModal';
import { exportDocument } from './services/exportService';

const STORAGE_KEYS = {
  CENTERS: 'fgdll_centers_v1',
  TEMPLATES: 'fgdll_templates_v1',
  DOCUMENTS: 'fgdll_documents_v1',
  ACTIVE_CENTER_ID: 'fgdll_active_center_id_v1',
  ROLE: 'fgdll_user_role_v1',
  THEME_ID: 'fgdll_theme_id_v1',
};

export default function App() {
  // Load or initialize centers
  const [centers, setCenters] = useState<CenterProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CENTERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CENTERS;
  });

  const [activeCenterId, setActiveCenterId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CENTER_ID);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CENTERS[0].id;
  });

  // Current active center object
  const activeCenter = centers.find((c) => c.id === activeCenterId) || centers[0] || INITIAL_CENTERS[0];

  // Role state: 'ADMIN' | 'DIRECTOR'
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (saved === 'ADMIN' || saved === 'DIRECTOR') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'DIRECTOR';
  });

  // Active theme
  const [activeThemeId, setActiveThemeId] = useState<StyleThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME_ID);
      if (saved && STYLE_THEMES[saved]) return saved as StyleThemeId;
    } catch (e) {
      console.error(e);
    }
    return 'fgdll_oficial';
  });

  // Master templates list
  const [templates, setTemplates] = useState<MasterTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TEMPLATES;
  });

  // Saved documents list
  const [documents, setDocuments] = useState<SavedDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Initial sample document
    return [
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
  });

  // Current view navigation: 'library' | 'my_docs' | 'identity' | 'editor'
  const [activeView, setActiveView] = useState<'library' | 'my_docs' | 'identity' | 'editor'>('library');

  // Currently editing template / document in DocumentEditor
  const [editingTemplate, setEditingTemplate] = useState<MasterTemplate | null>(null);
  const [editingSavedDocument, setEditingSavedDocument] = useState<SavedDocument | undefined>(undefined);

  // Modals
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify(centers));
  }, [centers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CENTER_ID, activeCenterId);
  }, [activeCenterId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME_ID, activeThemeId);
  }, [activeThemeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

  // Save document from editor
  const handleSaveDocument = (doc: SavedDocument) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === doc.id);
      if (exists) {
        return prev.map((d) => (d.id === doc.id ? doc : d));
      }
      return [doc, ...prev];
    });

    // Advance folio count in active center
    setCenters((prev) =>
      prev.map((c) =>
        c.id === activeCenter.id
          ? { ...c, currentFolioNumber: c.currentFolioNumber + 1 }
          : c
      )
    );

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

  // Duplicate saved document
  const handleDuplicateDocument = (doc: SavedDocument) => {
    const duplicated: SavedDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      title: `${doc.title} (Copia)`,
      folio: `${activeCenter.folioPrefix}-${String(activeCenter.currentFolioNumber).padStart(4, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'borrador',
    };
    setDocuments((prev) => [duplicated, ...prev]);
    showToast(`Documento duplicado.`);
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

  // Quick export from documents list
  const handleExportDocumentFromList = (doc: SavedDocument, format: 'pdf' | 'png') => {
    const tmpl = templates.find((t) => t.id === doc.templateId) || templates[0];
    setEditingTemplate(tmpl);
    setEditingSavedDocument(doc);
    setActiveView('editor');
    showToast('Abriendo documento para exportación en alta calidad...');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-lg shadow-xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
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
            template={editingTemplate}
            activeCenter={activeCenter}
            currentRole={currentRole}
            savedDocument={editingSavedDocument}
            onBack={() => setActiveView('library')}
            onSaveDocument={handleSaveDocument}
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
