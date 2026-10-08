import React, { useState } from 'react';
import { MasterTemplate, FGDLLZone, Role } from '../types';
import { OFFICIAL_CATEGORIES } from '../data/initialData';
import { Search, Star, FileText, ArrowRight, Shield, Sparkles, Plus, Copy, Edit2, SlidersHorizontal, Check } from 'lucide-react';
import { FGDLLMainLogo, ZoneBadge } from '../utils/assets';

interface TemplateLibraryProps {
  templates: MasterTemplate[];
  onSelectTemplateToUse: (template: MasterTemplate) => void;
  onEditMasterTemplate: (template: MasterTemplate) => void;
  onDuplicateTemplate: (template: MasterTemplate) => void;
  onToggleFavorite: (templateId: string) => void;
  onOpenUploadFormat: () => void;
  currentRole: Role;
  activeZone: FGDLLZone;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  templates,
  onSelectTemplateToUse,
  onEditMasterTemplate,
  onDuplicateTemplate,
  onToggleFavorite,
  onOpenUploadFormat,
  currentRole,
  activeZone,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [zoneFilter, setZoneFilter] = useState<string>('TODAS');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'Todos' || t.category === selectedCategory;
    const matchesZone = zoneFilter === 'TODAS' || t.zoneScope === 'TODAS' || t.zoneScope === zoneFilter;
    const matchesFav = !onlyFavorites || t.isFavorite;

    return matchesSearch && matchesCategory && matchesZone && matchesFav;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-cinzel">
            <Shield className="w-4 h-4 text-amber-400" />
            Centro de Documentos y Materiales Institucionales
          </h2>
          <p className="text-xs text-slate-400">
            Plantillas maestras protegidas y verificadas por Fraternidad Guerreros de la Luz.
          </p>
        </div>

        {currentRole === 'ADMIN' && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUploadFormat}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              Subir Nuevo Formato
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar formato, reglamento, ficha de ingreso, cartel, diploma..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {/* Favorites Toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
                onlyFavorites
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              Favoritos Frecuentes
            </button>

            {/* Zone Selector */}
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 shrink-0"
            >
              <option value="TODAS">Todas las Zonas</option>
              <option value="Águila">Zona Águila</option>
              <option value="Tiburón">Zona Tiburón</option>
              <option value="Delfín">Zona Delfín</option>
              <option value="Colibrí">Zona Colibrí</option>
              <option value="Jaguar">Zona Jaguar</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {OFFICIAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">
            No se encontraron plantillas
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No hay formatos que coincidan con la búsqueda. Puedes limpiar los filtros o subir un nuevo formato institucional.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            return (
              <div
                key={template.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition group shadow-md relative overflow-hidden"
              >
                {/* Subtle top indicator bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20 opacity-0 group-hover:opacity-100 transition" />

                <div className="space-y-3">
                  {/* Category & Favorite Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 font-mono">
                      {template.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(template.id);
                      }}
                      className="text-slate-500 hover:text-amber-400 transition p-1"
                      title={template.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          template.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* Badges / Meta */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                      {template.size}
                    </span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                      {template.orientation === 'portrait' ? 'Vertical' : 'Horizontal'}
                    </span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 font-mono">
                      v{template.version}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {template.blocks.length} bloques
                    </span>
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectTemplateToUse(template)}
                    className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow"
                  >
                    Usar Plantilla
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {currentRole === 'ADMIN' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditMasterTemplate(template)}
                        title="Editar Plantilla Maestra (Admin)"
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
                      >
                        <Edit2 className="w-4 h-4 text-amber-400" />
                      </button>
                      <button
                        onClick={() => onDuplicateTemplate(template)}
                        title="Duplicar Plantilla"
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
