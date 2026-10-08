import React, { useRef, useState } from 'react';
import { Download, Upload, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useEscape } from '../hooks/useEscape';

export interface BackupPayload {
  app: 'fgdll-centro-documentos';
  version: 1;
  exportedAt: string;
  data: {
    centers: unknown[];
    templates: unknown[];
    documents: unknown[];
    activeCenterId: string;
    themeId: string;
  };
}

interface BackupModalProps {
  onClose: () => void;
  onExport: () => void;
  onImport: (payload: BackupPayload) => void;
}

const MAX_BACKUP_BYTES = 25 * 1024 * 1024;

export const BackupModal: React.FC<BackupModalProps> = ({ onClose, onExport, onImport }) => {
  useEscape(onClose);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    if (file.size > MAX_BACKUP_BYTES) {
      setError('El archivo es demasiado grande para ser un respaldo válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const d = parsed?.data;
        const ok =
          parsed?.app === 'fgdll-centro-documentos' &&
          d &&
          Array.isArray(d.centers) &&
          Array.isArray(d.templates) &&
          Array.isArray(d.documents) &&
          d.centers.length > 0;
        if (!ok) {
          setError('Este archivo no es un respaldo del Centro de Documentos FGDLL.');
          return;
        }
        onImport(parsed as BackupPayload);
      } catch {
        setError('No se pudo leer el archivo. Verifica que sea un respaldo .json sin modificar.');
      }
    };
    reader.onerror = () => setError('No se pudo leer el archivo.');
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-lg text-slate-100">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 id="backup-title" className="text-base font-bold">Respaldo de datos</h3>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <p className="text-slate-300 leading-relaxed">
            Tus centros, plantillas y documentos se guardan <strong>sólo en este navegador y dispositivo</strong>. Si borras
            los datos del navegador o cambias de equipo, se pierden. Descarga un respaldo con frecuencia y guárdalo en un
            lugar seguro.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={onExport}
              className="flex flex-col items-start gap-1 p-3 rounded-lg border border-slate-700 hover:border-amber-500/50 bg-slate-950/50 text-left transition"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-100">Descargar respaldo</span>
              <span className="text-xs text-slate-400">Archivo .json con todo tu trabajo.</span>
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-start gap-1 p-3 rounded-lg border border-slate-700 hover:border-amber-500/50 bg-slate-950/50 text-left transition"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-100">Restaurar respaldo</span>
              <span className="text-xs text-slate-400">Reemplaza los datos actuales.</span>
            </button>
          </div>
          <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFile} />

          {error && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <p className="text-[11px] text-slate-500 leading-relaxed">
            El respaldo puede contener datos de personas (por ejemplo fichas de ingreso). Trátalo como información
            confidencial y no lo subas a repositorios públicos.
          </p>
        </div>
      </div>
    </div>
  );
};
