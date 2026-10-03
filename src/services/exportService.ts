import { jsPDF } from 'jspdf';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import { PaperSize, Orientation } from '../types';

export interface ExportOptions {
  fileName: string;
  format: 'pdf' | 'png' | 'jpg' | 'webp';
  quality: 'standard' | 'high' | 'print';
  size: PaperSize;
  orientation: Orientation;
}

// Convert paper sizes to mm dimensions [width, height] in portrait
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

export async function exportDocument(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const pixelRatio = options.quality === 'print' ? 3 : options.quality === 'high' ? 2 : 1.5;

  const sanitizedFileName = (options.fileName || 'FGDLL_Documento')
    .replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚñÑ ]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  if (options.format === 'pdf') {
    // Determine mm dimensions
    const [baseW, baseH] = PAPER_DIMENSIONS_MM[options.size] || [215.9, 279.4];
    const width = options.orientation === 'landscape' ? Math.max(baseW, baseH) : Math.min(baseW, baseH);
    const height = options.orientation === 'landscape' ? Math.min(baseW, baseH) : Math.max(baseW, baseH);

    // Capture element image at high quality
    const dataUrl = await toPng(element, {
      pixelRatio,
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    // Create jsPDF document
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: [width, height],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST');
    pdf.save(`${sanitizedFileName}.pdf`);
  } else {
    // Image export: PNG, JPG, or WebP
    let dataUrl = '';
    if (options.format === 'jpg') {
      dataUrl = await toJpeg(element, {
        quality: 0.95,
        pixelRatio,
        backgroundColor: '#ffffff',
      });
    } else {
      dataUrl = await toPng(element, {
        pixelRatio,
        backgroundColor: '#ffffff',
      });
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = `${sanitizedFileName}.${options.format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function triggerBrowserPrint(): void {
  window.print();
}
