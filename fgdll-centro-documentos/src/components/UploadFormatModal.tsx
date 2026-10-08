import React, { useState } from 'react';
import { useEscape } from '../hooks/useEscape';
import { AiSettingsPanel } from './AiSettingsPanel';
import { MasterTemplate, Block, StyleThemeId, PaperSize, FGDLLZone } from '../types';
import { parseUploadedDocumentToBlocks } from '../services/geminiService';
import { Upload, FileText, Check, X, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { OFFICIAL_CATEGORIES } from '../data/initialData';

interface UploadFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (newTemplate: MasterTemplate) => void;
  activeZone: FGDLLZone;
}

export const UploadFormatModal: React.FC<UploadFormatModalProps> = ({
  isOpen,
  onClose,
  onSaveTemplate,
  activeZone,
}) => {
  const [docTitle, setDocTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Formatos de grupo');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    name: string;
    category: string;
    description: string;
    blocks: Block[];
    engine?: 'ia' | 'local';
    engineNote?: string;
  } | null>(null);

  useEscape(onClose, isOpen);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo es muy grande (máximo 2 MB de texto). Divide el documento en partes.');
      e.target.value = '';
      return;
    }

    setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text || '');
    };
    reader.readAsText(file);
  };

  const handleProcessDocument = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    try {
      const result = await parseUploadedDocumentToBlocks(rawText, docTitle);
      setParsedResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTemplate = () => {
    if (!parsedResult) return;

    const newTemplate: MasterTemplate = {
      id: `temp-${Date.now()}`,
      name: parsedResult.name || docTitle || 'Nuevo Formato Subido',
      description: parsedResult.description || 'Formato institucional importado y normalizado para Fraternidad Guerreros de la Luz.',
      category: parsedResult.category || selectedCategory || 'Formatos de grupo',
      version: '1.0',
      updatedAt: new Date().toISOString().split('T')[0],
      size: 'Carta',
      orientation: 'portrait',
      themeId: 'fgdll_oficial',
      status: 'publicado',
      isFavorite: false,
      zoneScope: 'TODAS',
      marginTop: 18,
      marginBottom: 18,
      marginLeft: 18,
      marginRight: 18,
      showHeader: true,
      showFooter: true,
      showWatermark: true,
      watermarkType: 'crest',
      blocks: parsedResult.blocks,
      versionHistory: [
        {
          version: '1.0',
          date: new Date().toISOString().split('T')[0],
          adminName: 'Administrador FGDLL',
          changeSummary: 'Importación y conversión de formato a plantilla maestra editable',
          blocksSnapshot: parsedResult.blocks,
        },
      ],
    };

    onSaveTemplate(newTemplate);
    onClose();
  };

  const loadSampleFormat = () => {
    setDocTitle('Control Semanal de Guardias y Servicios de Limpieza');
    setSelectedCategory('Servicio');
    setRawText(`CONTROL SEMANAL DE GUARDIAS Y SERVICIOS - FGDLL

Grupo / Centro: {{NOMBRE_CENTRO}}
Semana del: {{FECHA}}
Zona Operativa: {{ZONA}}

AVISO: El servicio es la piedra angular de nuestra recuperación. Los servidores asignados deben presentarse 30 minutos antes del inicio de la sesión.

TABLA DE SERVICIOS
Día | Área de Servicio | Servidor Responsable | Suplente
Lunes | Cafetería y Literatura | Hermano Jorge R. | Roberto E.
Martes | Salón Principal y Sonido | Hermano Felipe M. | Carlos S.
Miércoles | Sanitarios e Higiene | Hermano Víctor H. | Armando R.
Jueves | Puerta y Bienvenida | Hermano Gabriel T. | Ignacio M.
Viernes | Montaje de Junta de Oración | Hermano Juan C. | Manuel B.
Sábado | Aseo General Comunitario | Cuadrilla de Jóvenes | Mesa de Servicio
Domingo | Apoyo a Reunión Familiar | Comité de Familias | Servidor de Guardia

RESPONSABILIDADES DEL SERVIDOR:
1. Mantener actitud humilde, atenta y fraterna con todos los asistentes.
2. Cuidar escrupulosamente los insumos de la 7ª tradición.
3. Notificar con 24 horas de anticipación cualquier imposibilidad de asistir para activar al suplente.

VALIDACIÓN DEL SERVICIO
Coordinador de Servicios: {{DIRECTOR}}
Custodio de Grupo: Servidor Asignado`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in" role="dialog" aria-modal="true" aria-label="Subir nuevo formato" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Subir y Transformar Nuevo Formato Institucional
              </h3>
              <p className="text-xs text-slate-400">
                Carga documentos compatibles y transfórmalos automáticamente en plantillas editables con la identidad oficial FGDLL.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!parsedResult ? (
            <div className="space-y-4">
              <AiSettingsPanel />
              {/* Doc Meta Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Título o Nombre del Formato:
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Ej. Registro de Aportaciones de la 7ª Tradición"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Categoría Institucional:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {OFFICIAL_CATEGORIES.filter((c) => c !== 'Todos').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Drop Zone / Paste Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Contenido del Documento (Pega texto o sube archivo):
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={loadSampleFormat}
                      className="text-xs text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Cargar Ejemplo de Prueba
                    </button>
                    <label className="cursor-pointer text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded border border-slate-700 flex items-center gap-1.5 transition">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Subir archivo (.txt, .md)
                      <input
                        type="file"
                        accept=".txt,.md,.text"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={10}
                  placeholder="Pega aquí el contenido del documento, reglamento, formato de junta o ficha que deseas convertir a plantilla oficial..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-lg text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">
                  ¿Qué sucederá al transformar el formato?
                </p>
                <p>
                  1. Se extraerán automáticamente títulos, subtítulos, párrafos, listas, tablas y bloques de firmas.
                </p>
                <p>
                  2. Se integrará la hoja membretada de FGDLL con el escudo heráldico y la zona seleccionada.
                </p>
                <p>
                  3. Se aplicará la normalización editorial y se preparará para la personalización de los directores.
                </p>
              </div>
            </div>
          ) : (
            /* Parsed Preview */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Formato Transformado Exitosamente
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Se estructuraron {parsedResult.blocks.length} bloques institucionales listos para editar y publicar.
                  </p>
                  {parsedResult.engineNote && (
                    <p role="alert" className="text-[11px] text-amber-300 mt-1">{parsedResult.engineNote}</p>
                  )}
                </div>
                <button
                  onClick={() => setParsedResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Volver a editar texto original
                </button>
              </div>

              {/* Block Structure Review */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Bloques Estructurados Generados:
                </h5>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {parsedResult.blocks.map((blk, idx) => (
                    <div
                      key={blk.id || idx}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 uppercase tracking-wide">
                            [{blk.type}]
                          </span>
                          <span className="text-slate-300 font-semibold">{blk.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              blk.isEditableByDirector
                                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40'
                                : 'bg-rose-900/40 text-rose-300 border border-rose-700/40'
                            }`}
                          >
                            {blk.isEditableByDirector ? 'Editable por Director' : 'Bloqueado Admin'}
                          </span>
                        </div>
                        {blk.content && (
                          <p className="text-slate-400 line-clamp-2">{blk.content}</p>
                        )}
                        {blk.listItems && (
                          <p className="text-slate-400">
                            Lista con {blk.listItems.length} elementos estructurados.
                          </p>
                        )}
                        {blk.tableRows && (
                          <p className="text-slate-400">
                            Tabla con {blk.tableHeaders?.length || 0} columnas y {blk.tableRows.length} filas.
                          </p>
                        )}
                        {blk.signatures && (
                          <p className="text-slate-400">
                            Firmas: {blk.signatures.map((s) => s.roleTitle).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition"
          >
            Cancelar
          </button>

          {!parsedResult ? (
            <button
              onClick={handleProcessDocument}
              disabled={isProcessing || !rawText.trim()}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow"
            >
              {isProcessing ? (
                <>Procesando Estructura...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Transformar a Plantilla FGDLL
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleCreateTemplate}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow"
            >
              <Check className="w-4 h-4" />
              Guardar y Publicar en Biblioteca
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
