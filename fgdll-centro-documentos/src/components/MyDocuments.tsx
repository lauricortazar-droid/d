import React, { useState } from 'react';
import { SavedDocument, MasterTemplate, CenterProfile, StyleTheme } from '../types';
import { FileText, Download, Copy, Trash2, Edit3, Eye, Search, Filter, Archive, CheckCircle2, Clock } from 'lucide-react';
import { STYLE_THEMES } from '../data/initialData';

interface MyDocumentsProps {
  documents: SavedDocument[];
  onOpenDocument: (doc: SavedDocument) => void;
  onDuplicateDocument: (doc: SavedDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onArchiveDocument: (docId: string) => void;
  onExportDocument: (doc: SavedDocument, format: 'pdf' | 'png') => void;
  activeCenter: CenterProfile;
}

export const MyDocuments: React.FC<MyDocumentsProps> = ({
  documents,
  onOpenDocument,
  onDuplicateDocument,
  onDeleteDocument,
  onArchiveDocument,
  onExportDocument,
  activeCenter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'borrador' | 'finalizado' | 'archivado'>('all');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.folio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar with Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, plantilla o folio..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          {(['all', 'borrador', 'finalizado', 'archivado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded capitalize font-medium transition ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">
            No se encontraron documentos
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Prueba cambiando los términos de búsqueda o filtros.'
              : 'Selecciona una plantilla en la biblioteca para personalizar y generar tu primer material institucional.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isArchived = doc.status === 'archivado';
            const isDraft = doc.status === 'borrador';

            return (
              <div
                key={doc.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition group shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-amber-400">
                      FOLIO: {doc.folio}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isDraft
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                          : isArchived
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition line-clamp-2">
                    {doc.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Plantilla: <span className="text-slate-300">{doc.templateName}</span>
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Tamaño: {doc.size}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {doc.updatedAt}
                    </span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-1">
                  <button
                    onClick={() => onOpenDocument(doc)}
                    className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar / Ver
                  </button>

                  <button
                    onClick={() => onExportDocument(doc, 'pdf')}
                    title="Descargar PDF"
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => onDuplicateDocument(doc)}
                    title="Duplicar Documento"
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onArchiveDocument(doc.id)}
                    title={isArchived ? 'Desarchivar' : 'Archivar'}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    title="Eliminar"
                    className="p-1.5 hover:bg-rose-950/40 rounded text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
