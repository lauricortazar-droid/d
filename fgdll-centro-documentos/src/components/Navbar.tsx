import React, { useState, useRef, useEffect } from 'react';
import { Role, CenterProfile, FGDLLZone } from '../types';
import { FGDLLMainLogo, ZoneBadge } from '../utils/assets';
import {
  FileText,
  FolderOpen,
  Palette,
  Building2,
  Shield,
  Upload,
  User,
  ChevronDown,
  Menu,
  X,
  Check,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  onChangeRole: (newRole: Role) => void;
  centers: CenterProfile[];
  activeCenter: CenterProfile;
  onSelectCenter: (center: CenterProfile) => void;
  activeView: 'library' | 'my_docs' | 'identity';
  onChangeView: (view: 'library' | 'my_docs' | 'identity') => void;
  onOpenCenterSettings: () => void;
  onOpenUploadFormat: () => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onChangeRole,
  centers,
  activeCenter,
  onSelectCenter,
  activeView,
  onChangeView,
  onOpenCenterSettings,
  onOpenUploadFormat,
  onOpenBackup,
}) => {
  const [isCenterDropdownOpen, setIsCenterDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el selector de centros al hacer clic fuera o presionar Esc
  useEffect(() => {
    if (!isCenterDropdownOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsCenterDropdownOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCenterDropdownOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [isCenterDropdownOpen]);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChangeView('library')}
              className="flex items-center gap-3 cursor-pointer group text-left"
              aria-label="Ir a Materiales y Formatos"
            >
              <FGDLLMainLogo className="w-10 h-10 group-hover:scale-105 transition" variant="gold" />
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 block font-cinzel">
                  FRATERNIDAD GUERREROS DE LA LUZ
                </span>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-100 font-cinzel leading-none">
                  Centro de Documentos y Materiales
                </h1>
              </div>
            </button>
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onChangeView('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'library'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Materiales y Formatos
            </button>

            <button
              onClick={() => onChangeView('my_docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'my_docs'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Mis Documentos
            </button>

            <button
              onClick={() => onChangeView('identity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'identity'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Identidad Visual
            </button>
          </nav>

          {/* Right: Center Switcher & Role Selector */}
          <div className="flex items-center gap-3">
            {/* Center Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsCenterDropdownOpen(!isCenterDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={isCenterDropdownOpen}
                aria-label="Seleccionar centro o grupo"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs transition max-w-[190px] sm:max-w-xs text-left"
              >
                <ZoneBadge zone={activeCenter.zone} className="w-5 h-5 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-200 truncate leading-tight">
                    {activeCenter.shortName}
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium">
                    Zona {activeCenter.zone}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {/* Dropdown Menu */}
              {isCenterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Seleccionar Centro / Grupo</span>
                    <button
                      onClick={() => {
                        setIsCenterDropdownOpen(false);
                        onOpenCenterSettings();
                      }}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      Editar
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {centers.map((c) => {
                      const isSelected = c.id === activeCenter.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            onSelectCenter(c);
                            setIsCenterDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-slate-800 transition ${
                            isSelected ? 'bg-amber-500/10 text-amber-300' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <ZoneBadge zone={c.zone} className="w-6 h-6 shrink-0" />
                            <div className="truncate">
                              <div className="text-xs font-bold truncate">{c.shortName}</div>
                              <div className="text-[10px] text-slate-500">
                                {c.city}, {c.state} · Zona {c.zone}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-3 pt-2 border-t border-slate-800 space-y-1.5">
                    <button
                      onClick={() => {
                        setIsCenterDropdownOpen(false);
                        onOpenBackup();
                      }}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded text-center transition flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Respaldo de datos
                    </button>
                    <button
                      onClick={() => {
                        setIsCenterDropdownOpen(false);
                        onOpenCenterSettings();
                      }}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded text-center transition flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      Configurar Perfil Institucional
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Pill */}
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-700 rounded-lg text-xs">
              <button
                onClick={() => onChangeRole('DIRECTOR')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                  currentRole === 'DIRECTOR'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Director: Solo campos autorizados para tu centro"
              >
                Director
              </button>
              <button
                onClick={() => onChangeRole('ADMIN')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                  currentRole === 'ADMIN'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Administrador: Control total de plantillas, bloqueos y estilos"
              >
                <Shield className="w-3 h-3" />
                Admin
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onChangeView('library');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              Materiales y Formatos
            </button>
            <button
              onClick={() => {
                onChangeView('my_docs');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              Mis Documentos Guardados
            </button>
            <button
              onClick={() => {
                onChangeView('identity');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              Identidad Visual y Logotipos
            </button>
            <button
              onClick={() => {
                onOpenBackup();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Respaldo de datos
            </button>
            {currentRole === 'ADMIN' && (
              <button
                onClick={() => {
                  onOpenUploadFormat();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-amber-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Subir Nuevo Formato
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
