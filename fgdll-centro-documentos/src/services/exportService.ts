import { jsPDF } from 'jspdf';
import { toPng, toJpeg } from 'html-to-image';
import { PaperSize, Orientation } from '../types';

export interface ExportOptions {
  fileName: string;
  format: 'pdf' | 'png' | 'jpg' | 'webp';
  quality: 'standard' | 'high' | 'print';
  size: PaperSize;
  orientation: Orientation;
}

// Dimensiones en mm [ancho, alto] en vertical
export const PAPER_DIMENSIONS_MM: Record<PaperSize, [number, number]> = {
  Carta: [215.9, 279.4],
  Oficio: [215.9, 355.6],
  A4: [210, 297],
  A5: [148, 210],
  Cartel_08x12: [800, 1200],
  Cartel_12x18: [1200, 1800],
  Redes_1080x1080: [270, 270],
  Redes_1080x1350: [270, 337.5],
  Redes_1080x1920: [270, 480],
  Personalizado: [215.9, 279.4],
};

// Safari en iPhone limita el lienzo a ~16.7 millones de píxeles; con más, la
// exportación falla en silencio o genera una imagen en blanco.
const MAX_CANVAS_PIXELS = 16_000_000;

function safePixelRatio(element: HTMLElement, wanted: number): number {
  const w = element.offsetWidth || 1;
  const h = element.offsetHeight || 1;
  const maxRatio = Math.sqrt(MAX_CANVAS_PIXELS / (w * h));
  return Math.max(0.5, Math.min(wanted, maxRatio));
}

export function sanitizeFileName(name: string): string {
  const cleaned = (name || 'FGDLL_Documento')
    .replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚñÑüÜ ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return cleaned || 'FGDLL_Documento';
}

export async function exportDocument(element: HTMLElement, options: ExportOptions): Promise<void> {
  // Asegura que las tipografías estén cargadas antes de capturar
  if (document.fonts?.ready) await document.fonts.ready;

  const wantedRatio = options.quality === 'print' ? 3 : options.quality === 'high' ? 2 : 1.5;
  const pixelRatio = safePixelRatio(element, wantedRatio);
  const fileName = sanitizeFileName(options.fileName);

  if (options.format === 'pdf') {
    const [baseW, baseH] = PAPER_DIMENSIONS_MM[options.size] || [215.9, 279.4];
    const width = options.orientation === 'landscape' ? Math.max(baseW, baseH) : Math.min(baseW, baseH);
    const height = options.orientation === 'landscape' ? Math.min(baseW, baseH) : Math.max(baseW, baseH);

    const dataUrl = await toPng(element, { pixelRatio, cacheBust: true, backgroundColor: '#ffffff' });

    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: [width, height],
    });
    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST');
    pdf.save(`${fileName}.pdf`);
    return;
  }

  const dataUrl =
    options.format === 'jpg'
      ? await toJpeg(element, { quality: 0.95, pixelRatio, cacheBust: true, backgroundColor: '#ffffff' })
      : await toPng(element, { pixelRatio, cacheBust: true, backgroundColor: '#ffffff' });

  const link = document.createElement('a');
  link.download = `${fileName}.${options.format === 'webp' ? 'png' : options.format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerBrowserPrint(): void {
  window.print();
}
