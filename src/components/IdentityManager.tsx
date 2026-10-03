import React, { useState } from 'react';
import { StyleTheme, StyleThemeId, CenterProfile } from '../types';
import { STYLE_THEMES } from '../data/initialData';
import { FGDLLMainLogo, ZoneBadge, LegionLogo, AmazonasLogo, GladiadoresLogo, OfficialSealStamp } from '../utils/assets';
import { Palette, Type, Shield, Download, Check, FileCheck, Layers } from 'lucide-react';

interface IdentityManagerProps {
  currentThemeId: StyleThemeId;
  onSelectTheme: (themeId: StyleThemeId) => void;
  activeCenter: CenterProfile;
  onOpenCenterSettings: () => void;
}

export const IdentityManager: React.FC<IdentityManagerProps> = ({
  currentThemeId,
  onSelectTheme,
  activeCenter,
  onOpenCenterSettings,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'themes' | 'logos' | 'typography'>('themes');

  const themesList = Object.values(STYLE_THEMES);
  const activeTheme = STYLE_THEMES[currentThemeId] || STYLE_THEMES.fgdll_oficial;

  return (
    <div className="space-y-6">
      {/* Identity Top Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <FGDLLMainLogo className="w-64 h-64" variant="gold" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Manual de Identidad Visual FGDLL 2026
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-cinzel">
            Identidad Institucional, Tipografías y Heráldica
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Estandarización gráfica de Fraternidad Guerreros de la Luz para los centros y grupos de las 5 Zonas (Águila, Tiburón, Delfín, Colibrí y Jaguar). El estilo oficial combina Azul Marino Imperial, Destellos en Oro y Blanco Puro.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenCenterSettings}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              Configurar Datos del Centro Actual
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setSelectedSubTab('themes')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
            selectedSubTab === 'themes'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          Estilos y Paletas Oficiales
        </button>
        <button
          onClick={() => setSelectedSubTab('logos')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
            selectedSubTab === 'logos'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Biblioteca de Logotipos e Insignias
        </button>
        <button
          onClick={() => setSelectedSubTab('typography')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
            selectedSubTab === 'typography'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Type className="w-4 h-4" />
          Tipografías Institucionales
        </button>
      </div>

      {/* SUBTAB: Themes */}
      {selectedSubTab === 'themes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themesList.map((th) => {
              const isCurrent = th.id === currentThemeId;
              return (
                <div
                  key={th.id}
                  onClick={() => onSelectTheme(th.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition relative overflow-hidden flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {th.name}
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-slate-950 font-bold rounded">
                            ACTIVO
                          </span>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {th.description}
                    </p>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-2 pt-1">
                      <div
                        className="w-7 h-7 rounded-md border border-white/20 shadow-sm"
                        style={{ backgroundColor: th.primaryColor }}
                        title="Primario"
                      />
                      <div
                        className="w-7 h-7 rounded-md border border-white/20 shadow-sm"
                        style={{ backgroundColor: th.secondaryColor }}
                        title="Secundario"
                      />
                      <div
                        className="w-7 h-7 rounded-md border border-white/20 shadow-sm"
                        style={{ backgroundColor: th.accentColor }}
                        title="Acento / Oro"
                      />
                      <div
                        className="w-7 h-7 rounded-md border border-slate-700 shadow-sm"
                        style={{ backgroundColor: th.cardColor }}
                        title="Fondo Hoja"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {th.titleFont.split(',')[0]}
                    </span>
                    <button
                      type="button"
                      className={`text-xs font-semibold px-2.5 py-1 rounded transition ${
                        isCurrent
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isCurrent ? 'Estilo Aplicado' : 'Seleccionar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB: Logos & Badges Library */}
      {selectedSubTab === 'logos' && (
        <div className="space-y-6">
          <div className="text-xs text-slate-400">
            Biblioteca vectorial oficial de escudos e insignias de Fraternidad Guerreros de la Luz. Listos para ser insertados o utilizados en documentos impresos y formatos digitales.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FGDLL Official Crest */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <FGDLLMainLogo className="w-24 h-24" variant="gold" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  Escudo Central FGDLL
                </h4>
                <p className="text-[11px] text-slate-500">
                  Espada de Luz, Laureles y Corona Dorada
                </p>
              </div>
            </div>

            {/* Official Seal Stamp */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <OfficialSealStamp
                centerName={activeCenter.officialName}
                zone={`Zona ${activeCenter.zone}`}
                className="w-24 h-24"
                color="#d4af37"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  Sello Notarial Institucional
                </h4>
                <p className="text-[11px] text-slate-500">
                  Validación para formatos y constancias
                </p>
              </div>
            </div>

            {/* La Legion */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <LegionLogo className="w-24 h-24" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  La Legión 01
                </h4>
                <p className="text-[11px] text-slate-500">
                  Insignia de comités y servicio avanzado
                </p>
              </div>
            </div>

            {/* Amazonas */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <AmazonasLogo className="w-24 h-24" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  Amazonas FGDLL
                </h4>
                <p className="text-[11px] text-slate-500">
                  Rama femenil y grupos de apoyo
                </p>
              </div>
            </div>

            {/* Gladiadores */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <GladiadoresLogo className="w-24 h-24" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  Gladiadores FGDLL
                </h4>
                <p className="text-[11px] text-slate-500">
                  Liderazgo juvenil y formación
                </p>
              </div>
            </div>

            {/* Zone Águila */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <ZoneBadge zone="Águila" className="w-24 h-24" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  Zona Águila
                </h4>
                <p className="text-[11px] text-slate-500">
                  Visión superior y altura espiritual
                </p>
              </div>
            </div>

            {/* Zone Tiburón */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <ZoneBadge zone="Tiburón" className="w-24 h-24" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  Zona Tiburón
                </h4>
                <p className="text-[11px] text-slate-500">
                  Fuerza constante ante aguas profundas
                </p>
              </div>
            </div>

            {/* Zone Delfín */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <ZoneBadge zone="Delfín" className="w-24 h-24" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  Zona Delfín
                </h4>
                <p className="text-[11px] text-slate-500">
                  Fraternidad, alegría y rescate mutuo
                </p>
              </div>
            </div>

            {/* Zone Colibrí */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <ZoneBadge zone="Colibrí" className="w-24 h-24" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  Zona Colibrí
                </h4>
                <p className="text-[11px] text-slate-500">
                  Diligencia, agilidad y corazón noble
                </p>
              </div>
            </div>

            {/* Zone Jaguar */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3 flex flex-col items-center">
              <ZoneBadge zone="Jaguar" className="w-24 h-24" />
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-cinzel">
                  Zona Jaguar
                </h4>
                <p className="text-[11px] text-slate-500">
                  Coraje inquebrantable y honor
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: Typography */}
      {selectedSubTab === 'typography' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Tipografía de Título Primaria
              </div>
              <h3 className="text-2xl font-bold font-ringbearer text-slate-100">
                CINZEL / RINGBEARER
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans-body">
                Inspirada en inscripciones epigráficas y el estilo épico chivalric de Fraternidad Guerreros de la Luz. Utilizada para diplomas, encabezados principales y nombres solemnes.
              </p>
              <div className="p-3 bg-slate-900 rounded font-cinzel text-xs text-amber-200">
                ABCDEFGHIJKLMNÑOPQRSTUVWXYZ 1234567890
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Tipografía de Texto Institucional
              </div>
              <h3 className="text-2xl font-bold font-cardo text-slate-100">
                CARDO (SERIF CLÁSICO)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-cardo text-sm">
                Diseñada específicamente para humanistas, documentos legales y actas solemnes. Máxima legibilidad en formato impreso y hojas membretadas oficiales.
              </p>
              <div className="p-3 bg-slate-900 rounded font-cardo text-xs text-slate-300">
                abcdefghijklmnñopqrstuvwxyz 1234567890
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Tipografía de Formatos y Listas
              </div>
              <h3 className="text-2xl font-bold font-sans-body text-slate-100">
                PLUS JAKARTA / SANS
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans-body">
                Nítida, geométrica y sumamente legible en pantallas y tablas densas de control, asistencia e inventario.
              </p>
              <div className="p-3 bg-slate-900 rounded font-sans-body text-xs text-slate-300">
                Campos editables, tablas de 12 pasos y control de folios.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
