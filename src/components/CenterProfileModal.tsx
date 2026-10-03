import React, { useState } from 'react';
import { CenterProfile, FGDLLZone, OrganizationType } from '../types';
import { X, Save, Building2, MapPin, Phone, Mail, Globe, Shield, UserCheck, Upload, Trash2 } from 'lucide-react';
import { ZoneBadge, FGDLLMainLogo } from '../utils/assets';

interface CenterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  center: CenterProfile;
  onSave: (updatedCenter: CenterProfile) => void;
}

export const CenterProfileModal: React.FC<CenterProfileModalProps> = ({
  isOpen,
  onClose,
  center,
  onSave,
}) => {
  const [formData, setFormData] = useState<CenterProfile>({ ...center });

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        customLogoData: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomLogo = () => {
    setFormData((prev) => ({
      ...prev,
      customLogoData: undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const zones: FGDLLZone[] = ['Águila', 'Tiburón', 'Delfín', 'Colibrí', 'Jaguar'];
  const orgTypes: OrganizationType[] = [
    'Grupo Tradicional',
    'Centro de Rehabilitación',
    'Albergue y Residencia',
    'Casa de Medio Camino',
    'Comité de Distrito / Zonal',
    'Fraternidad',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Perfil Institucional del Grupo o Centro
              </h3>
              <p className="text-xs text-slate-400">
                Estos datos se incorporan automáticamente en la hoja membretada, variables y firmas de todos los documentos.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Logo & Identity Section */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {formData.customLogoData ? (
                <img
                  src={formData.customLogoData}
                  alt="Logotipo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <FGDLLMainLogo className="w-16 h-16" variant="gold" />
              )}
            </div>
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Logotipo del Grupo o Centro
              </div>
              <p className="text-xs text-slate-400">
                Puedes subir el escudo o logotipo de tu centro (PNG transparente o JPG), o mantener el escudo oficial FGDLL.
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded border border-slate-600 flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  Subir Logotipo Personalizado
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {formData.customLogoData && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomLogo}
                    className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 rounded border border-rose-800/50 flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Restaurar Escudo FGDLL
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Datos Oficiales y Jurisdicción FGDLL
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nombre Oficial Completo:
                </label>
                <input
                  type="text"
                  required
                  value={formData.officialName}
                  onChange={(e) => setFormData({ ...formData, officialName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nombre Corto / Distintivo:
                </label>
                <input
                  type="text"
                  required
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tipo de Organización:
                </label>
                <select
                  value={formData.orgType}
                  onChange={(e) => setFormData({ ...formData, orgType: e.target.value as OrganizationType })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {orgTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* FGDLL Zone */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Zona FGDLL:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {zones.map((zone) => {
                    const isSelected = formData.zone === zone;
                    return (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setFormData({ ...formData, zone })}
                        className={`p-2 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <ZoneBadge zone={zone} className="w-7 h-7" />
                        <span className="text-[10px] font-bold">{zone}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Prefijo de Folio y Consecutivo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.folioPrefix}
                    onChange={(e) => setFormData({ ...formData, folioPrefix: e.target.value.toUpperCase() })}
                    placeholder="PREFIJO"
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 uppercase font-mono"
                  />
                  <input
                    type="number"
                    value={formData.currentFolioNumber}
                    onChange={(e) => setFormData({ ...formData, currentFolioNumber: parseInt(e.target.value) || 1 })}
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Director / Responsable */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              Director o Responsable
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nombre del Director / Responsable:
                </label>
                <input
                  type="text"
                  required
                  value={formData.directorName}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Cargo Institucional:
                </label>
                <input
                  type="text"
                  required
                  value={formData.directorRole}
                  onChange={(e) => setFormData({ ...formData, directorRole: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              Ubicación y Canales de Contacto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Dirección:
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Municipio / Alcaldía:
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Estado:
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Teléfono Fijo:
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  WhatsApp Oficial:
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Sitio Web Oficial:
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Facebook:
                </label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Instagram / TikTok:
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Motto & Schedules */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Lema Institucional y Horarios
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Lema o Frase del Centro:
                </label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 italic"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Horarios de Atención / Sesiones:
                </label>
                <input
                  type="text"
                  value={formData.schedules}
                  onChange={(e) => setFormData({ ...formData, schedules: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Submit footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow"
            >
              <Save className="w-4 h-4" />
              Guardar Configuración del Centro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
