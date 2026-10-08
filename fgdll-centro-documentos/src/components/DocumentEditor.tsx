import React, { useState, useRef, useEffect } from 'react';
import {
  MasterTemplate,
  CenterProfile,
  StyleTheme,
  Block,
  Role,
  PaperSize,
  Orientation,
  SavedDocument,
} from '../types';
import { DocumentPreview } from './DocumentPreview';
import { NormalizerModal } from './NormalizerModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import type { ExportOptions } from '../services/exportService';
import {
  Save,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Unlock,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  Sliders,
  History,
  Check,
  Eye,
  Settings2,
  AlertTriangle,
  Smartphone,
  FileCheck2,
} from 'lucide-react';
import { STYLE_THEMES } from '../data/initialData';

interface DocumentEditorProps {
  template: MasterTemplate;
  activeCenter: CenterProfile;
  currentRole: Role;
  savedDocument?: SavedDocument;
  onBack: () => void;
  onSaveDocument: (doc: SavedDocument) => void;
  onUpdateMasterTemplate?: (updatedTemplate: MasterTemplate) => void;
  /** Si se indica, descarga el documento automáticamente al abrirse (desde Mis Documentos). */
  autoExport?: 'pdf' | 'png';
  onAutoExportDone?: () => void;
  onNotify?: (message: string, ms?: number) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  template: initialTemplate,
  activeCenter,
  currentRole,
  savedDocument,
  onBack,
  onSaveDocument,
  onUpdateMasterTemplate,
  autoExport,
  onAutoExportDone,
  onNotify,
}) => {
  // Working template (master settings if admin)
  const [template, setTemplate] = useState<MasterTemplate>(initialTemplate);
  
  // Custom field overrides for director
  const [customValues, setCustomValues] = useState<Record<string, any>>(
    savedDocument?.customValues || {}
  );

  const [documentTitle, setDocumentTitle] = useState(
    savedDocument?.title || `${initialTemplate.name} - ${activeCenter.shortName}`
  );

  const [docFolio, setDocFolio] = useState(
    savedDocument?.folio || `${activeCenter.folioPrefix}-${String(activeCenter.currentFolioNumber).padStart(4, '0')}`
  );

  // Active theme
  const [themeId, setThemeId] = useState(savedDocument?.themeId || template.themeId || 'fgdll_oficial');
  const currentTheme = STYLE_THEMES[themeId] || STYLE_THEMES.fgdll_oficial;

  // Preview & View Controls
  const [zoom, setZoom] = useState(90);
  const [previewMode, setPreviewMode] = useState<'normal' | 'print' | 'mobile'>('normal');
  const [activeTab, setActiveTab] = useState<'edit' | 'page_settings' | 'history'>('edit');
  
  // Normalization Modal
  const [isNormalizerOpen, setIsNormalizerOpen] = useState(false);
  const [normalizerTargetBlockId, setNormalizerTargetBlockId] = useState<string | null>(null);
  const [normalizerInitialText, setNormalizerInitialText] = useState('');

  // Version History Modal
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // Identificador y fecha de creación estables: guardar varias veces actualiza el mismo documento
  const [docId] = useState(() => savedDocument?.id || `doc-${Date.now()}`);
  const [createdAt] = useState(() => savedDocument?.createdAt || new Date().toISOString().split('T')[0]);

  // Estado de guardado real (antes se mostraba "Guardado automático" sin guardar nada)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setIsDirty(true);
  }, [customValues, template, documentTitle, themeId, docFolio]);

  // Avisa antes de cerrar la pestaña si hay cambios sin guardar
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty && !confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')) return;
    onBack();
  };

  // Insert dynamic variable shortcut into current focused field
  const handleInsertTag = (blockId: string, tag: string) => {
    const currentVal = customValues[blockId] !== undefined ? customValues[blockId] : (template.blocks.find(b => b.id === blockId)?.content || '');
    setCustomValues({
      ...customValues,
      [blockId]: `${currentVal} ${tag}`,
    });
  };

  // Open Normalizer for a block
  const handleOpenNormalizerForBlock = (block: Block) => {
    const text = customValues[block.id] !== undefined ? customValues[block.id] : block.content || '';
    setNormalizerTargetBlockId(block.id);
    setNormalizerInitialText(text);
    setIsNormalizerOpen(true);
  };

  const handleApplyNormalizedText = (normalizedText: string) => {
    if (normalizerTargetBlockId) {
      if (currentRole === 'ADMIN') {
        // Update template block directly
        setTemplate({
          ...template,
          blocks: template.blocks.map((b) =>
            b.id === normalizerTargetBlockId ? { ...b, content: normalizedText } : b
          ),
        });
      }
      setCustomValues({
        ...customValues,
        [normalizerTargetBlockId]: normalizedText,
      });
    }
  };

  // Save Document
  const handleSaveDoc = (status: 'borrador' | 'finalizado' = 'borrador') => {
    const docToSave: SavedDocument = {
      id: docId,
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      title: documentTitle,
      centerId: savedDocument?.centerId || activeCenter.id,
      centerName: savedDocument?.centerName || activeCenter.officialName,
      directorName: savedDocument?.directorName || activeCenter.directorName,
      createdAt,
      updatedAt: new Date().toISOString().split('T')[0],
      status,
      folio: docFolio,
      customValues,
      size: template.size,
      orientation: template.orientation,
      themeId,
    };

    onSaveDocument(docToSave);

    if (currentRole === 'ADMIN' && onUpdateMasterTemplate) {
      onUpdateMasterTemplate(template);
    }

    setIsDirty(false);
    setLastSavedTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
  };

  // Export handlers
  const handleDownload = async (format: 'pdf' | 'png' | 'jpg') => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        fileName: `${documentTitle}_${docFolio}`,
        format,
        quality: 'print',
        size: template.size,
        orientation: template.orientation,
      };
      // Carga diferida: jsPDF y html2canvas pesan ~600 KB y sólo se necesitan al descargar
      const { exportDocument } = await import('../services/exportService');
      await exportDocument(previewRef.current, options);
      onNotify?.('Descarga lista.');
    } catch (e) {
      console.error('Export error:', e);
      onNotify?.('No se pudo generar el archivo. Prueba con calidad menor, otro formato o desde una computadora.', 7000);
    } finally {
      setIsExporting(false);
    }
  };

  // Descarga automática cuando se llega desde "Mis Documentos"
  useEffect(() => {
    if (!autoExport) return;
    const timer = setTimeout(async () => {
      await handleDownload(autoExport);
      onAutoExportDone?.();
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExport]);

  // Admin block manipulation
  const handleAddBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: `blk-${Date.now()}`,
      type,
      label: `Nuevo Bloque ${type.toUpperCase()}`,
      content: type === 'table' ? '' : 'Texto del bloque institucional...',
      isEditableByDirector: true,
      alignment: 'left',
      fontSize: 'sm',
      tableHeaders: type === 'table' ? ['Columna 1', 'Columna 2', 'Observaciones'] : undefined,
      tableRows: type === 'table' ? [{ id: 'r1', cells: ['Dato 1', 'Dato 2', 'Activo'] }] : undefined,
      listItems: type === 'list' ? ['Elemento de lista 1', 'Elemento de lista 2'] : undefined,
      signatures: type === 'signature' ? [{ roleTitle: 'Responsable', personName: '{{DIRECTOR}}', personCharge: '{{CARGO}}' }] : undefined,
    };

    setTemplate({
      ...template,
      blocks: [...template.blocks, newBlock],
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setTemplate({
      ...template,
      blocks: template.blocks.filter((b) => b.id !== blockId),
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= template.blocks.length) return;
    const newBlocks = [...template.blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    setTemplate({ ...template, blocks: newBlocks });
  };

  const toggleBlockLock = (blockId: string) => {
    setTemplate({
      ...template,
      blocks: template.blocks.map((b) =>
        b.id === blockId ? { ...b, isEditableByDirector: !b.isEditableByDirector } : b
      ),
    });
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-4.5rem)] -m-4 sm:-m-6 overflow-hidden bg-slate-950 text-slate-100">
      {/* TOP CONTROL BAR */}
      <header className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Back & Doc Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition"
            title="Volver"
            aria-label="Volver"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-950 font-bold text-sm text-slate-100 px-2 py-0.5 rounded border border-transparent focus:border-amber-500 focus:outline-none transition max-w-xs sm:max-w-md"
              />
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                v{template.version}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 px-2">
              <span>{activeCenter.shortName}</span>
              <span>·</span>
              <span>Zona {activeCenter.zone}</span>
              <span>·</span>
              <span className="font-mono text-slate-500">Folio: {docFolio}</span>
              <span>·</span>
              {isDirty ? (
                <span className="text-amber-400 text-[10px] flex items-center gap-1" role="status">
                  <AlertTriangle className="w-3 h-3" />
                  Cambios sin guardar
                </span>
              ) : lastSavedTime ? (
                <span className="text-emerald-400/90 text-[10px] flex items-center gap-1" role="status">
                  <Check className="w-3 h-3" />
                  Guardado {lastSavedTime}
                </span>
              ) : (
                <span className="text-slate-500 text-[10px]">Sin cambios</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Export Actions */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={isExporting}
              className="px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Descargar PDF
            </button>
            <button
              onClick={() => handleDownload('png')}
              disabled={isExporting}
              className="px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Descargar Imagen PNG"
            >
              PNG
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {/* Save Buttons */}
          <button
            onClick={() => handleSaveDoc('borrador')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg transition"
          >
            Guardar borrador
          </button>
          <button
            onClick={() => handleSaveDoc('finalizado')}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow"
          >
            <Save className="w-4 h-4" />
            Guardar en Mis Documentos
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE SPLIT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT COLUMN: Editor Form / Block Inspector */}
        <div className="w-full md:w-[480px] lg:w-[520px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Editor Sub-header Tabs */}
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeTab === 'edit'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {currentRole === 'ADMIN' ? 'Editor de Bloques' : 'Campos Autorizados'}
              </button>
              {currentRole === 'ADMIN' && (
                <>
                  <button
                    onClick={() => setActiveTab('page_settings')}
                    className={`px-3 py-1 rounded-md font-semibold transition ${
                      activeTab === 'page_settings'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Ajustes de Página
                  </button>
                  <button
                    onClick={() => setIsVersionModalOpen(true)}
                    className="px-2.5 py-1 text-slate-400 hover:text-slate-200 flex items-center gap-1 text-xs"
                  >
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    Versiones ({template.version})
                  </button>
                </>
              )}
            </div>

            {/* Role indicator badge */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                currentRole === 'ADMIN'
                  ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                  : 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
              }`}
            >
              {currentRole === 'ADMIN' ? 'Modo Administrador' : 'Modo Director'}
            </span>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Dynamic Tags Toolbar */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Variables Dinámicas del Centro</span>
                <span className="text-slate-500 text-[9px]">Autocompletado en tiempo real</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '{{NOMBRE_CENTRO}}',
                  '{{DIRECTOR}}',
                  '{{CARGO}}',
                  '{{FECHA}}',
                  '{{FOLIO}}',
                  '{{ZONA}}',
                  '{{TELEFONO}}',
                  '{{WHATSAPP}}',
                  '{{DIRECCION}}',
                  '{{LEMA}}',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      // Copy tag to clipboard or alert
                      navigator.clipboard?.writeText(tag);
                    }}
                    title={`Copiar ${tag}`}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 hover:bg-amber-950 hover:text-amber-300 text-slate-400 border border-slate-800 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB: EDIT BLOCKS */}
            {activeTab === 'edit' && (
              <div className="space-y-4">
                {template.blocks.map((block, index) => {
                  const isLocked = !block.isEditableByDirector;
                  const canEdit = currentRole === 'ADMIN' || !isLocked;
                  const currentValue =
                    customValues[block.id] !== undefined ? customValues[block.id] : block.content || '';

                  return (
                    <div
                      key={block.id}
                      className={`p-4 rounded-xl border transition ${
                        isLocked && currentRole === 'DIRECTOR'
                          ? 'bg-slate-950/50 border-slate-800/60 opacity-80'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Block Header */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          {isLocked ? (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 flex items-center gap-1 font-mono"
                              title="Protegido por el Administrador Institucional"
                            >
                              <Lock className="w-3 h-3" />
                              Bloqueado
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1 font-mono">
                              <Unlock className="w-3 h-3" />
                              Editable
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-200">
                            {block.label}
                          </span>
                        </div>

                        {/* Admin Controls per block */}
                        {currentRole === 'ADMIN' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleBlockLock(block.id)}
                              className="p-1 text-slate-400 hover:text-amber-400 rounded"
                              title={isLocked ? 'Desbloquear para Director' : 'Bloquear para Director'}
                            >
                              {isLocked ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                            <button
                              onClick={() => handleOpenNormalizerForBlock(block)}
                              className="p-1 text-slate-400 hover:text-amber-400 rounded"
                              title="Normalizar Redacción con IA"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                            <button
                              onClick={() => handleMoveBlock(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveBlock(index, 'down')}
                              disabled={index === template.blocks.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Block Input Content */}
                      {!canEdit ? (
                        <div className="p-2.5 bg-slate-900/60 rounded-lg text-xs text-slate-400 border border-slate-800/80 whitespace-pre-line leading-relaxed">
                          {currentValue}
                          <p className="mt-1 text-[10px] italic text-slate-500">
                            Texto institucional oficial protegido. Solo modificable por la administración de FGDLL.
                          </p>
                        </div>
                      ) : (
                        <div>
                          {/* If Paragraph or Title or Subtitle or Notice Box */}
                          {(block.type === 'paragraph' ||
                            block.type === 'title' ||
                            block.type === 'subtitle' ||
                            block.type === 'notice_box') && (
                            <textarea
                              rows={block.type === 'paragraph' ? 4 : 2}
                              value={currentValue}
                              onChange={(e) =>
                                setCustomValues({
                                  ...customValues,
                                  [block.id]: e.target.value,
                                })
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                            />
                          )}

                          {/* If List */}
                          {block.type === 'list' && (
                            <div className="space-y-2">
                              {((customValues[block.id] || block.listItems || []) as string[]).map(
                                (item, itemIdx) => (
                                  <div key={itemIdx} className="flex gap-2 items-center">
                                    <span className="text-xs font-mono text-slate-500 w-4">
                                      {itemIdx + 1}.
                                    </span>
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => {
                                        const currentItems = [
                                          ...(customValues[block.id] || block.listItems || []),
                                        ];
                                        currentItems[itemIdx] = e.target.value;
                                        setCustomValues({
                                          ...customValues,
                                          [block.id]: currentItems,
                                        });
                                      }}
                                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {/* If Table */}
                          {block.type === 'table' && (
                            <div className="space-y-2">
                              <p className="text-[11px] text-slate-400">
                                Edición de celdas de la tabla institucional:
                              </p>
                              {((customValues[block.id] || block.tableRows || []) as any[]).map(
                                (row, rIdx) => (
                                  <div key={row.id || rIdx} className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1.5">
                                    <div className="text-[10px] font-bold text-amber-400">
                                      Fila {rIdx + 1}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {(row.cells || []).map((cell: string, cIdx: number) => (
                                        <input
                                          key={cIdx}
                                          type="text"
                                          value={cell}
                                          onChange={(e) => {
                                            const currentRows = [
                                              ...(customValues[block.id] || block.tableRows || []),
                                            ];
                                            const updatedCells = [...currentRows[rIdx].cells];
                                            updatedCells[cIdx] = e.target.value;
                                            currentRows[rIdx] = {
                                              ...currentRows[rIdx],
                                              cells: updatedCells,
                                            };
                                            setCustomValues({
                                              ...customValues,
                                              [block.id]: currentRows,
                                            });
                                          }}
                                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {/* If Signature */}
                          {block.type === 'signature' && (
                            <div className="space-y-3">
                              {((customValues[block.id] || block.signatures || []) as any[]).map(
                                (sig, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2 text-xs"
                                  >
                                    <div className="text-[10.5px] font-bold text-amber-400">
                                      Firmante {sIdx + 1}: {sig.roleTitle}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        placeholder="Nombre del firmante"
                                        value={sig.personName}
                                        onChange={(e) => {
                                          const currentSigs = [
                                            ...(customValues[block.id] || block.signatures || []),
                                          ];
                                          currentSigs[sIdx] = {
                                            ...currentSigs[sIdx],
                                            personName: e.target.value,
                                          };
                                          setCustomValues({
                                            ...customValues,
                                            [block.id]: currentSigs,
                                          });
                                        }}
                                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Cargo o responsabilidad"
                                        value={sig.personCharge}
                                        onChange={(e) => {
                                          const currentSigs = [
                                            ...(customValues[block.id] || block.signatures || []),
                                          ];
                                          currentSigs[sIdx] = {
                                            ...currentSigs[sIdx],
                                            personCharge: e.target.value,
                                          };
                                          setCustomValues({
                                            ...customValues,
                                            [block.id]: currentSigs,
                                          });
                                        }}
                                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Block Selector (Admin Only) */}
                {currentRole === 'ADMIN' && (
                  <div className="pt-2">
                    <div className="p-3 bg-slate-950 border border-dashed border-slate-800 rounded-xl space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        + Agregar Bloque a la Plantilla Maestra:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['title', 'paragraph', 'table', 'list', 'signature', 'notice_box'] as const).map(
                          (bType) => (
                            <button
                              key={bType}
                              type="button"
                              onClick={() => handleAddBlock(bType)}
                              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded border border-slate-800 text-xs font-medium capitalize transition"
                            >
                              + {bType}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PAGE SETTINGS (ADMIN ONLY) */}
            {activeTab === 'page_settings' && currentRole === 'ADMIN' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Formato y Dimensiones de Impresión
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Tamaño:</label>
                      <select
                        value={template.size}
                        onChange={(e) =>
                          setTemplate({ ...template, size: e.target.value as PaperSize })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Carta">Carta (215.9 × 279.4 mm)</option>
                        <option value="Oficio">Oficio (215.9 × 355.6 mm)</option>
                        <option value="A4">A4 (210 × 297 mm)</option>
                        <option value="A5">A5 (148 × 210 mm)</option>
                        <option value="Cartel_08x12">Cartel (0.80 × 1.20 m)</option>
                        <option value="Redes_1080x1080">Redes Post (1080 × 1080 px)</option>
                        <option value="Redes_1080x1920">Redes Historia (1080 × 1920 px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Orientación:</label>
                      <select
                        value={template.orientation}
                        onChange={(e) =>
                          setTemplate({ ...template, orientation: e.target.value as Orientation })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="portrait">Vertical (Retrato)</option>
                        <option value="landscape">Horizontal (Apaisado)</option>
                      </select>
                    </div>
                  </div>

                  {/* Margins */}
                  <div className="pt-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Márgenes (mm):</label>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500">Sup:</span>
                        <input
                          type="number"
                          value={template.marginTop}
                          onChange={(e) =>
                            setTemplate({ ...template, marginTop: parseInt(e.target.value) || 18 })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Inf:</span>
                        <input
                          type="number"
                          value={template.marginBottom}
                          onChange={(e) =>
                            setTemplate({ ...template, marginBottom: parseInt(e.target.value) || 18 })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Izq:</span>
                        <input
                          type="number"
                          value={template.marginLeft}
                          onChange={(e) =>
                            setTemplate({ ...template, marginLeft: parseInt(e.target.value) || 18 })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Der:</span>
                        <input
                          type="number"
                          value={template.marginRight}
                          onChange={(e) =>
                            setTemplate({ ...template, marginRight: parseInt(e.target.value) || 18 })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="pt-2 space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={template.showHeader}
                        onChange={(e) => setTemplate({ ...template, showHeader: e.target.checked })}
                        className="rounded accent-amber-500"
                      />
                      <span>Mostrar Encabezado y Hoja Membretada</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={template.showFooter}
                        onChange={(e) => setTemplate({ ...template, showFooter: e.target.checked })}
                        className="rounded accent-amber-500"
                      />
                      <span>Mostrar Pie de Página con Contacto y Portal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={template.showWatermark}
                        onChange={(e) => setTemplate({ ...template, showWatermark: e.target.checked })}
                        className="rounded accent-amber-500"
                      />
                      <span>Mostrar Sello de Agua de Seguridad</span>
                    </label>
                  </div>
                </div>

                {/* Style Theme Selector */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Estilo Gráfico de la Plantilla
                  </h4>
                  <select
                    value={themeId}
                    onChange={(e) => setThemeId(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {Object.values(STYLE_THEMES).map((th) => (
                      <option key={th.id} value={th.id}>
                        {th.name} ({th.titleFont.split(',')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Live Document Canvas & Zoom Controls */}
        <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden relative">
          {/* Zoom and Preview Toolbar */}
          <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-3 text-xs shrink-0 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Vista Previa:
              </span>
              <button
                onClick={() => setPreviewMode('normal')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  previewMode === 'normal'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Impresión / Hoja
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition ${
                  previewMode === 'mobile'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                Móvil
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(z - 15, 45))}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Reducir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono text-slate-300 w-10 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(z + 15, 150))}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
              >
                100%
              </button>
            </div>
          </div>

          {/* Interactive Document Viewport */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/90">
            <DocumentPreview
              template={template}
              center={activeCenter}
              theme={currentTheme}
              customValues={customValues}
              zoom={zoom}
              previewMode={previewMode}
              previewRef={previewRef}
              currentFolio={docFolio}
            />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isNormalizerOpen && (
        <NormalizerModal
          isOpen={isNormalizerOpen}
          onClose={() => setIsNormalizerOpen(false)}
          initialText={normalizerInitialText}
          onApply={handleApplyNormalizedText}
        />
      )}

      {isVersionModalOpen && (
        <VersionHistoryModal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          template={template}
          isAdmin={currentRole === 'ADMIN'}
          onRestoreVersion={(ver) => {
            if (ver.blocksSnapshot && ver.blocksSnapshot.length > 0) {
              setTemplate({ ...template, blocks: ver.blocksSnapshot, version: ver.version });
            }
            setIsVersionModalOpen(false);
          }}
          onCreateNewVersion={(newVer, summary) => {
            const newHistory = [
              ...(template.versionHistory || []),
              {
                version: newVer,
                date: new Date().toISOString().split('T')[0],
                adminName: 'Admin FGDLL Central',
                changeSummary: summary,
                blocksSnapshot: template.blocks,
              },
            ];
            setTemplate({ ...template, version: newVer, versionHistory: newHistory });
          }}
        />
      )}
    </div>
  );
};
