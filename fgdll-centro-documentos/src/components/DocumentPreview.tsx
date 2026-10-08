import React, { useMemo } from 'react';
import { MasterTemplate, CenterProfile, StyleTheme, PaperSize, Orientation } from '../types';
import { FGDLLMainLogo, ZoneBadge, OfficialSealStamp, LegionLogo, AmazonasLogo, GladiadoresLogo } from '../utils/assets';

interface DocumentPreviewProps {
  template: MasterTemplate;
  center: CenterProfile;
  theme: StyleTheme;
  customValues: Record<string, any>;
  zoom?: number;
  previewMode?: 'normal' | 'print' | 'mobile';
  previewRef?: React.RefObject<HTMLDivElement | null>;
  currentFolio?: string;
  currentDate?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  template,
  center,
  theme,
  customValues,
  zoom = 100,
  previewMode = 'normal',
  previewRef,
  currentFolio,
  currentDate,
}) => {
  const effectiveDate = currentDate || new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const effectiveFolio = currentFolio || `${center.folioPrefix}-${String(center.currentFolioNumber).padStart(4, '0')}`;

  // Variable replacer for strings
  const replaceVariables = (text?: string): string => {
    if (!text) return '';
    return text
      .replace(/{{NOMBRE_CENTRO}}/g, center.officialName)
      .replace(/{{NOMBRE_CORTO}}/g, center.shortName)
      .replace(/{{DIRECTOR}}/g, center.directorName)
      .replace(/{{CARGO}}/g, center.directorRole)
      .replace(/{{DIRECCION}}/g, center.address)
      .replace(/{{CIUDAD}}/g, center.city)
      .replace(/{{MUNICIPIO}}/g, center.city)
      .replace(/{{ESTADO}}/g, center.state)
      .replace(/{{TELEFONO}}/g, center.phone)
      .replace(/{{WHATSAPP}}/g, center.whatsapp)
      .replace(/{{CORREO}}/g, center.email)
      .replace(/{{FACEBOOK}}/g, center.facebook)
      .replace(/{{INSTAGRAM}}/g, center.instagram)
      .replace(/{{SITIO_WEB}}/g, center.website)
      .replace(/{{ZONA}}/g, center.zone)
      .replace(/{{LEMA}}/g, center.motto)
      .replace(/{{FECHA}}/g, effectiveDate)
      .replace(/{{FOLIO}}/g, effectiveFolio);
  };

  // Dimensions based on paper size
  const paperAspectClass = useMemo(() => {
    if (previewMode === 'mobile') return 'w-[360px] min-h-[640px]';
    if (template.size === 'Redes_1080x1080') return 'w-[750px] h-[750px]';
    if (template.size === 'Redes_1080x1350') return 'w-[720px] h-[900px]';
    if (template.size === 'Redes_1080x1920') return 'w-[600px] h-[1066px]';
    if (template.size === 'Cartel_08x12') return 'w-[720px] min-h-[1080px]';
    if (template.size === 'Oficio') {
      return template.orientation === 'landscape' ? 'w-[1080px] min-h-[680px]' : 'w-[760px] min-h-[1100px]';
    }
    // Default Carta / A4
    return template.orientation === 'landscape' ? 'w-[1020px] min-h-[720px]' : 'w-[780px] min-h-[1010px]';
  }, [template.size, template.orientation, previewMode]);

  return (
    <div
      style={{
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center',
        transition: 'transform 0.15s ease-out',
      }}
      className="inline-block"
    >
      <div
        ref={previewRef}
        id="fgdll-printable-sheet"
        className={`bg-white text-slate-900 shadow-2xl relative select-text transition-all ${paperAspectClass}`}
        style={{
          fontFamily: theme.bodyFont,
          color: theme.textColor,
          padding: `${Math.max(template.marginTop || 18, 12)}mm ${Math.max(template.marginRight || 18, 12)}mm ${Math.max(template.marginBottom || 18, 12)}mm ${Math.max(template.marginLeft || 18, 12)}mm`,
        }}
      >
        {/* Subtle Watermark */}
        {template.showWatermark && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
            style={{ opacity: theme.watermarkOpacity || 0.04 }}
          >
            {template.watermarkType === 'zone' ? (
              <ZoneBadge zone={center.zone} className="w-[450px] h-[450px]" />
            ) : (
              <FGDLLMainLogo className="w-[500px] h-[500px]" variant="monochrome" />
            )}
          </div>
        )}

        {/* Outer Elegant Golden / Fine Border for Formal & Official Themes */}
        {theme.headerBorder && (
          <div
            className="absolute inset-3 pointer-events-none border"
            style={{
              borderColor: `${theme.accentColor}33`,
              borderWidth: '1px',
            }}
          />
        )}

        <div className="relative z-10 flex flex-col justify-between h-full min-h-full">
          {/* HEADER: Hoja Membretada Institucional */}
          {template.showHeader && (
            <header className="pb-4 mb-4 border-b" style={{ borderColor: theme.borderColor }}>
              <div className="flex items-center justify-between gap-4">
                {/* Left: FGDLL Main Emblem or Custom Logo */}
                <div className="flex items-center gap-3">
                  {center.customLogoData ? (
                    <img
                      src={center.customLogoData}
                      alt={center.officialName}
                      className="w-14 h-14 object-contain"
                    />
                  ) : (
                    <FGDLLMainLogo className="w-14 h-14 shrink-0" variant="gold" />
                  )}
                  <div>
                    <span
                      className="text-xs tracking-wider block font-bold"
                      style={{
                        fontFamily: theme.titleFont,
                        color: theme.accentColor,
                        letterSpacing: '0.12em',
                      }}
                    >
                      FRATERNIDAD GUERREROS DE LA LUZ
                    </span>
                    <h2
                      className="text-sm md:text-base font-extrabold leading-tight"
                      style={{ color: theme.primaryColor, fontFamily: theme.titleFont }}
                    >
                      {center.officialName}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {center.orgType} · Región {center.state}
                    </p>
                  </div>
                </div>

                {/* Right: Zone Emblem & Motto */}
                <div className="flex items-center gap-2 text-right">
                  <div className="hidden sm:block">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                      JURISDICCIÓN
                    </span>
                    <span
                      className="text-xs font-bold uppercase"
                      style={{ color: theme.primaryColor, fontFamily: theme.titleFont }}
                    >
                      ZONA {center.zone}
                    </span>
                    <p className="text-[9.5px] italic text-slate-500 max-w-[160px] leading-tight">
                      «{center.motto}»
                    </p>
                  </div>
                  <ZoneBadge zone={center.zone} className="w-11 h-11 shrink-0" />
                </div>
              </div>
            </header>
          )}

          {/* DOCUMENT BODY BLOCKS */}
          <main className="flex-1 space-y-4">
            {template.blocks.map((block) => {
              // Custom value override if user modified this block
              const customVal = customValues[block.id];
              const textContent = replaceVariables(
                customVal !== undefined && typeof customVal === 'string' ? customVal : block.content
              );

              switch (block.type) {
                case 'title':
                  return (
                    <div key={block.id} className={`text-${block.alignment || 'center'} my-3`}>
                      <h1
                        className="text-lg md:text-xl font-extrabold tracking-wide uppercase"
                        style={{
                          fontFamily: theme.titleFont,
                          color: block.textColor || theme.primaryColor,
                        }}
                      >
                        {textContent}
                      </h1>
                      <div
                        className="w-16 h-0.5 mx-auto mt-1"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                  );

                case 'subtitle':
                  return (
                    <div key={block.id} className={`text-${block.alignment || 'center'} mb-2`}>
                      <h3
                        className="text-sm md:text-base font-bold tracking-wider"
                        style={{
                          fontFamily: theme.titleFont,
                          color: block.textColor || theme.secondaryColor,
                        }}
                      >
                        {textContent}
                      </h3>
                    </div>
                  );

                case 'paragraph':
                  return (
                    <div
                      key={block.id}
                      className={`text-${block.alignment || 'justify'} text-xs md:text-sm leading-relaxed whitespace-pre-line`}
                      style={{
                        color: block.textColor || theme.textColor,
                        fontWeight: block.isBold ? 700 : 400,
                        fontStyle: block.isItalic ? 'italic' : 'normal',
                      }}
                    >
                      {textContent}
                    </div>
                  );

                case 'notice_box':
                  return (
                    <div
                      key={block.id}
                      className="p-3 rounded border text-xs leading-relaxed"
                      style={{
                        backgroundColor: `${theme.accentColor}10`,
                        borderColor: `${theme.accentColor}55`,
                        color: theme.textColor,
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className="font-bold text-[10px] uppercase tracking-wider px-1 py-0.5 rounded shrink-0"
                          style={{ backgroundColor: theme.accentColor, color: '#fff' }}
                        >
                          AVISO INSTITUCIONAL
                        </span>
                        <p className="whitespace-pre-line font-medium">{textContent}</p>
                      </div>
                    </div>
                  );

                case 'list': {
                  const items: string[] =
                    customVal && Array.isArray(customVal)
                      ? customVal
                      : block.listItems || [];

                  return (
                    <div key={block.id} className="my-2">
                      <ol
                        className={`text-xs md:text-sm space-y-1.5 ${
                          block.isNumberedList ? 'list-decimal' : 'list-disc'
                        } pl-5 text-slate-800`}
                      >
                        {items.map((item, idx) => (
                          <li key={idx} className="leading-snug">
                            {replaceVariables(item)}
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                }

                case 'table': {
                  const headers = block.tableHeaders || ['Concepto', 'Descripción'];
                  const rows = customVal && Array.isArray(customVal) ? customVal : block.tableRows || [];

                  return (
                    <div key={block.id} className="overflow-x-auto my-3">
                      <table
                        className="w-full text-xs text-left border-collapse border"
                        style={{ borderColor: theme.borderColor }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: `${theme.primaryColor}12`,
                              color: theme.primaryColor,
                            }}
                          >
                            {headers.map((h, hIdx) => (
                              <th
                                key={hIdx}
                                className="border p-2 font-bold uppercase tracking-wider text-[11px]"
                                style={{ borderColor: theme.borderColor }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row: any, rIdx: number) => (
                            <tr
                              key={row.id || rIdx}
                              className={rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                            >
                              {(row.cells || []).map((cell: string, cIdx: number) => (
                                <td
                                  key={cIdx}
                                  className="border p-2 leading-relaxed"
                                  style={{ borderColor: theme.borderColor }}
                                >
                                  {replaceVariables(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                case 'signature': {
                  const sigs = customVal && Array.isArray(customVal) ? customVal : block.signatures || [];

                  return (
                    <div key={block.id} className="mt-8 pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-end">
                        {sigs.map((sig: any, sIdx: number) => (
                          <div key={sIdx} className="text-center">
                            {/* Signature Line */}
                            <div className="h-10 flex items-center justify-center">
                              {sIdx === 0 && (
                                <div className="text-[10px] text-slate-400 font-mono italic">
                                  [Firma Autorizada]
                                </div>
                              )}
                            </div>
                            <div
                              className="border-t mx-4 pt-1.5"
                              style={{ borderColor: theme.primaryColor }}
                            >
                              <div
                                className="text-xs font-bold uppercase"
                                style={{ fontFamily: theme.titleFont, color: theme.primaryColor }}
                              >
                                {replaceVariables(sig.personName || 'Nombre')}
                              </div>
                              <div className="text-[10.5px] font-semibold text-slate-700">
                                {replaceVariables(sig.roleTitle || 'Cargo')}
                              </div>
                              <div className="text-[9px] text-slate-500">
                                {replaceVariables(sig.personCharge || '')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Official Seal Watermark Stamp on Right */}
                      <div className="flex justify-end mt-3 pr-4">
                        <OfficialSealStamp
                          centerName={center.officialName}
                          zone={`Zona ${center.zone}`}
                          className="w-24 h-24 opacity-80"
                          color={theme.accentColor}
                        />
                      </div>
                    </div>
                  );
                }

                case 'separator':
                  return (
                    <div key={block.id} className="py-2 flex items-center justify-center gap-2">
                      <div
                        className="h-px flex-1"
                        style={{ backgroundColor: `${theme.accentColor}44` }}
                      />
                      <div
                        className="w-2 h-2 rotate-45"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <div
                        className="h-px flex-1"
                        style={{ backgroundColor: `${theme.accentColor}44` }}
                      />
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </main>

          {/* FOOTER: Datos de Contacto y Validación */}
          {template.showFooter && (
            <footer
              className="mt-6 pt-3 border-t text-[9.5px] text-slate-500 leading-tight space-y-1"
              style={{ borderColor: theme.borderColor }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-slate-700">
                  {center.address} · {center.city}, {center.state}
                </div>
                <div className="flex items-center gap-3">
                  <span>Tel: {center.phone}</span>
                  <span>WhatsApp: {center.whatsapp}</span>
                  <span>{center.email}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between text-[8.5px] text-slate-400">
                <div>
                  Portal Oficial: {center.website || 'www.fraternidadguerrerosdelaluz.org'} · Redes: {center.facebook}
                </div>
                <div>
                  Documento Institucional FGDLL · {center.shortName} · Folio: {effectiveFolio}
                </div>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};
