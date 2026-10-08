import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getAiSettings, saveAiSettings, isAiConfigured, DEFAULT_AI_MODEL } from '../services/geminiService';

/**
 * Panel opcional para activar la IA de Google con la clave propia de la persona usuaria.
 * La clave vive sólo en esta pestaña (sessionStorage) y no se incluye en el código publicado.
 */
export const AiSettingsPanel: React.FC = () => {
  const initial = getAiSettings();
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(initial.apiKey);
  const [model, setModel] = useState(initial.model);
  const [active, setActive] = useState(isAiConfigured());

  const handleSave = () => {
    saveAiSettings({ apiKey, model });
    setActive(apiKey.trim().length > 0);
  };

  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-950/50 text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-slate-300 hover:text-slate-100"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          IA de Google (opcional)
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {active ? 'Activada' : 'Motor local'}
          </span>
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-slate-800 pt-3">
          <p className="text-slate-400 leading-relaxed">
            Sin clave, todo funciona sin internet con reglas locales. Si pegas tu clave de la API de Gemini, el texto que
            normalices se enviará a Google. <strong className="text-slate-300">Evita enviar datos personales de personas atendidas.</strong>{' '}
            La clave se guarda sólo en esta pestaña y se borra al cerrarla.
          </p>
          <label className="block">
            <span className="text-slate-400 font-semibold">Clave de la API de Gemini</span>
            <input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Pega tu clave aquí"
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </label>
          <label className="block">
            <span className="text-slate-400 font-semibold">Modelo</span>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={DEFAULT_AI_MODEL}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition"
            >
              Guardar
            </button>
            {active && (
              <button
                type="button"
                onClick={() => {
                  setApiKey('');
                  saveAiSettings({ apiKey: '', model });
                  setActive(false);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded transition"
              >
                Quitar clave
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
