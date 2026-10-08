import React, { useState } from 'react';
import { useEscape } from '../hooks/useEscape';
import { MasterTemplate, TemplateVersion, Block } from '../types';
import { History, X, RotateCcw, Plus, Check, Calendar, User, ShieldAlert } from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: MasterTemplate;
  onRestoreVersion: (version: TemplateVersion) => void;
  onCreateNewVersion: (versionNumber: string, summary: string) => void;
  isAdmin: boolean;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  template,
  onRestoreVersion,
  onCreateNewVersion,
  isAdmin,
}) => {
  const [newVersionNum, setNewVersionNum] = useState('');
  const [newVersionSummary, setNewVersionSummary] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEscape(onClose, isOpen);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionNum.trim() || !newVersionSummary.trim()) return;
    onCreateNewVersion(newVersionNum.trim(), newVersionSummary.trim());
    setNewVersionNum('');
    setNewVersionSummary('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in" role="dialog" aria-modal="true" aria-label="Historial de versiones" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Historial de Versiones y Auditoría
              </h3>
              <p className="text-xs text-slate-400">
                {template.name} · Versión actual: v{template.version}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isAdmin && (
            <div>
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-2.5 px-4 bg-slate-950 border border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-300 flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  Registrar Nueva Versión de esta Plantilla
                </button>
              ) : (
                <form
                  onSubmit={handleCreate}
                  className="p-4 bg-slate-950 border border-amber-500/40 rounded-xl space-y-3"
                >
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Crear Hito de Versión Oficial
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Versión (ej. 2.2):</label>
                      <input
                        type="text"
                        required
                        value={newVersionNum}
                        onChange={(e) => setNewVersionNum(e.target.value)}
                        placeholder="2.2"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Resumen de Cambios:
                      </label>
                      <input
                        type="text"
                        required
                        value={newVersionSummary}
                        onChange={(e) => setNewVersionSummary(e.target.value)}
                        placeholder="Ajuste de cláusulas y actualización de firmas..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition"
                    >
                      Guardar Versión
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Timeline of Versions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registro Histórico de Modificaciones:
            </h4>
            <div className="space-y-3">
              {(template.versionHistory || []).map((ver, idx) => {
                const isCurrent = ver.version === template.version;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition ${
                      isCurrent
                        ? 'bg-amber-950/20 border-amber-500/50'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100 font-mono">
                            v{ver.version}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold rounded">
                              VERSIÓN ACTIVA
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          {ver.changeSummary}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {ver.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ver.adminName}
                          </span>
                        </div>
                      </div>

                      {isAdmin && !isCurrent && ver.blocksSnapshot && ver.blocksSnapshot.length > 0 && (
                        <button
                          onClick={() => onRestoreVersion(ver)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 flex items-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          Restaurar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
