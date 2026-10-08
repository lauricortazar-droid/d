import React, { useState } from 'react';
import { NormalizationDiff } from '../types';
import { normalizeDocumentContent } from '../services/geminiService';
import { useEscape } from '../hooks/useEscape';
import { AiSettingsPanel } from './AiSettingsPanel';
import { Sparkles, Check, X, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface NormalizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onApply: (normalizedText: string) => void;
}

export const NormalizerModal: React.FC<NormalizerModalProps> = ({
  isOpen,
  onClose,
  initialText,
  onApply,
}) => {
  const [sourceText, setSourceText] = useState(initialText);
  const [diff, setDiff] = useState<NormalizationDiff | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'comparison' | 'sidebyside'>('sidebyside');

  useEscape(onClose, isOpen);

  if (!isOpen) return null;

  const handleRunNormalization = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await normalizeDocumentContent(sourceText);
      setDiff(result);
    } catch (err) {
      console.error(err);
      setError('No se pudo completar la normalización. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptProposal = () => {
    if (diff?.normalizedText) {
      onApply(diff.normalizedText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in" role="dialog" aria-modal="true" aria-label="Normalización editorial" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Normalización Editorial Institucional
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  FGDLL Protocol
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Corrige ortografía, legibilidad y uniforma jerarquías manteniendo nombres, reglas y variables.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!diff && !isLoading && (
            <div className="space-y-3">
              <AiSettingsPanel />
              <label className="text-xs font-semibold text-slate-300 block">
                Texto a Normalizar (Pega o ajusta el fragmento):
              </label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={10}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500/80 font-mono"
                placeholder="Ingresa el texto a normalizar..."
              />
              {error && (
                <p role="alert" className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                  {error}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={handleRunNormalization}
                  disabled={!sourceText.trim()}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 transition shadow-lg shadow-amber-950/40"
                >
                  <Sparkles className="w-4 h-4" />
                  Iniciar Normalización Editorial
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Analizando estructura editorial y lingüística...
                </p>
                <p className="text-xs text-slate-400">
                  Verificando acentuación, uniformidad de siglas FGDLL y respeto a nombres propios.
                </p>
              </div>
            </div>
          )}

          {diff && !isLoading && (
            <div className="space-y-5">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Correcciones detectadas
                  </div>
                  <div className="text-xl font-bold text-amber-400 mt-1 flex items-center gap-2">
                    {diff.grammarFixesCount} ajustes
                  </div>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg md:col-span-2">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Dictamen editorial
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {diff.structureNotes}
                  </div>
                  {diff.engineNote && (
                    <p role="alert" className="mt-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1">
                      {diff.engineNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Improvements List */}
              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Mejoras aplicadas por la norma institucional:
                </h4>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  {diff.improvements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/50">
                  <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>Original</span>
                    <span className="text-[10px] text-slate-500 font-mono">Sin modificar</span>
                  </div>
                  <div className="p-3 text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                    {diff.originalText}
                  </div>
                </div>

                {/* Normalized Proposal */}
                <div className="border border-amber-500/40 rounded-lg overflow-hidden bg-slate-950/80">
                  <div className="px-3 py-2 bg-amber-950/40 border-b border-amber-500/30 text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>Propuesta Normalizada</span>
                    <span className="text-[10px] text-amber-400/80 font-mono">Revisado FGDLL</span>
                  </div>
                  <div className="p-3 text-xs text-slate-100 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                    {diff.normalizedText}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => setDiff(null)}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            {diff ? 'Reiniciar análisis' : 'Cancelar'}
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition"
            >
              Conservar Original
            </button>
            <button
              onClick={handleAcceptProposal}
              disabled={!diff}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Check className="w-4 h-4" />
              Aplicar Propuesta Normalizada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
