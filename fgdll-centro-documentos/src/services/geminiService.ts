import { Block, BlockType, NormalizationDiff } from '../types';

/**
 * Servicios de normalización editorial y de análisis de formatos.
 *
 * Por defecto todo funciona SIN internet y SIN claves, con reglas locales.
 * Opcionalmente la persona usuaria puede pegar su propia clave de la API de
 * Gemini: se guarda sólo en esta pestaña (sessionStorage), nunca se incluye
 * en el código publicado y el texto sólo se envía a Google si la activa.
 */

const AI_KEY_STORAGE = 'fgdll_ai_key_session';
const AI_MODEL_STORAGE = 'fgdll_ai_model_session';
// Modelo por defecto; puede cambiarse desde el panel de IA si Google lo renombra.
export const DEFAULT_AI_MODEL = 'gemini-3.8-flash';

export interface AiSettings {
  apiKey: string;
  model: string;
}

export function getAiSettings(): AiSettings {
  try {
    return {
      apiKey: sessionStorage.getItem(AI_KEY_STORAGE) || '',
      model: sessionStorage.getItem(AI_MODEL_STORAGE) || DEFAULT_AI_MODEL,
    };
  } catch {
    return { apiKey: '', model: DEFAULT_AI_MODEL };
  }
}

export function saveAiSettings(settings: AiSettings): void {
  try {
    if (settings.apiKey.trim()) sessionStorage.setItem(AI_KEY_STORAGE, settings.apiKey.trim());
    else sessionStorage.removeItem(AI_KEY_STORAGE);
    sessionStorage.setItem(AI_MODEL_STORAGE, settings.model.trim() || DEFAULT_AI_MODEL);
  } catch {
    /* sessionStorage no disponible: se usará el motor local */
  }
}

export function isAiConfigured(): boolean {
  return getAiSettings().apiKey.length > 0;
}

async function callGemini(prompt: string, temperature: number): Promise<unknown> {
  const { apiKey, model } = getAiSettings();
  if (!apiKey) throw new Error('Sin clave de IA');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      if (res.status === 400 || res.status === 403) throw new Error('La clave de IA no es válida o no tiene permiso.');
      if (res.status === 404) throw new Error(`El modelo "${model}" no existe. Cámbialo en el panel de IA.`);
      if (res.status === 429) throw new Error('Se alcanzó el límite de uso de la IA. Intenta más tarde.');
      throw new Error(`La IA respondió con error ${res.status}.`);
    }
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';
    if (!text.trim()) throw new Error('La IA no devolvió contenido.');
    // Algunos modelos envuelven el JSON en ```json ... ```
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return JSON.parse(cleaned);
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('La IA tardó demasiado en responder.');
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Normaliza editorialmente un documento institucional de Fraternidad Guerreros de la Luz.
 * Mantiene intactos nombres de centros, fechas, cantidades y reglamentos.
 */
export async function normalizeDocumentContent(contentToNormalize: string): Promise<NormalizationDiff> {
  let engineNote: string | undefined;

  if (isAiConfigured()) {
    try {
      const prompt = `
Actúa como un corrector de estilo, editor institucional senior y experto en redacción oficial para la "Fraternidad Guerreros de la Luz (FGDLL)".
Tu objetivo es NORMALIZAR editorialmente el siguiente texto de un formato o documento institucional.

INSTRUCCIONES CLAVE:
1. Corrige ortografía, acentuación, puntuación y concordancia gramatical.
2. Uniforma el uso adecuado de mayúsculas y minúsculas (evita mayúsculas innecesarias en palabras comunes, pero mantén las siglas institucionales como FGDLL).
3. Mejora la solemnidad, claridad y legibilidad sin alterar el sentido ni el tono fraternal y respetuoso.
4. MANTÉN ESTRICTAMENTE INTACTOS los nombres propios, fechas, cantidades, cláusulas obligatorias, artículos y folios.
5. Preserva las variables dinámicas de plantilla en formato de doble llave si existen (ej. {{NOMBRE_CENTRO}}, {{DIRECTOR}}, {{FOLIO}}, etc.).

Texto original:
"""
${contentToNormalize}
"""

Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura:
{
  "normalizedText": "Texto normalizado completo...",
  "improvements": ["Lista de 3 a 5 mejoras concretas realizadas"],
  "grammarFixesCount": 4,
  "structureNotes": "Breve explicación de las correcciones de estilo y jerarquía"
}
`;
      const parsed = (await callGemini(prompt, 0.2)) as Partial<NormalizationDiff>;
      if (typeof parsed.normalizedText === 'string' && parsed.normalizedText.trim()) {
        // Salvaguarda: las variables {{...}} del original deben seguir presentes
        const vars = contentToNormalize.match(/\{\{[A-Z0-9_]+\}\}/g) || [];
        const lost = vars.filter((v) => !parsed.normalizedText!.includes(v));
        return {
          originalText: contentToNormalize,
          normalizedText: parsed.normalizedText,
          improvements: Array.isArray(parsed.improvements) && parsed.improvements.length
            ? parsed.improvements.map(String)
            : ['Corrección ortográfica y gramatical'],
          grammarFixesCount: Number(parsed.grammarFixesCount) || 0,
          structureNotes:
            (parsed.structureNotes || 'Se normalizó la sintaxis para alinearse a la norma editorial de FGDLL.') +
            (lost.length ? ` ⚠ Revisa estas variables que la IA modificó o quitó: ${[...new Set(lost)].join(', ')}.` : ''),
          engine: 'ia',
        };
      }
    } catch (err) {
      engineNote = `${(err as Error).message} Se usó el motor local.`;
    }
  }

  const local = fallbackNormalizer(contentToNormalize);
  return { ...local, engine: 'local', engineNote };
}

/**
 * Normalizador local por reglas (sin internet).
 */
function fallbackNormalizer(text: string): NormalizationDiff {
  let normalized = text;
  const improvements: string[] = [];
  let fixesCount = 0;

  // Protege las variables {{...}} para que ninguna regla las altere
  const placeholders: string[] = [];
  normalized = normalized.replace(/\{\{[^}]*\}\}/g, (m) => {
    placeholders.push(m);
    return `\uE000${placeholders.length - 1}\uE001`;
  });

  // 1. Espacios dobles
  if (/[ \t]{2,}/.test(normalized)) {
    normalized = normalized.replace(/[ \t]{2,}/g, ' ');
    improvements.push('Corrección de espaciados dobles e irregulares.');
    fixesCount += 1;
  }

  // 2. Acentuación y siglas institucionales
  const commonReplacements: [RegExp, string, string][] = [
    [/\bfraternidad guerreros de la luz\b/gi, 'Fraternidad Guerreros de la Luz', 'Capitalización institucional de FGDLL'],
    [/\bfgdll\b/gi, 'FGDLL', 'Estandarización de siglas FGDLL'],
    [/\bnumero\b/gi, 'número', 'Acentuación ortográfica'],
    [/\btelefono\b/gi, 'teléfono', 'Acentuación ortográfica'],
    [/\bdireccion\b/gi, 'dirección', 'Acentuación ortográfica'],
    [/\bsesion\b/gi, 'sesión', 'Acentuación ortográfica'],
    [/\bproposito\b/gi, 'propósito', 'Acentuación ortográfica'],
    [/\bguia\b/gi, 'guía', 'Acentuación ortográfica'],
    [/\barticulo\b/gi, 'artículo', 'Acentuación ortográfica'],
  ];

  commonReplacements.forEach(([pattern, replacement, note]) => {
    const before = normalized;
    normalized = normalized.replace(pattern, (match) =>
      // Conserva MAYÚSCULAS si la palabra original estaba toda en mayúsculas
      match === match.toUpperCase() && match.length > 1 && replacement !== 'FGDLL'
        ? replacement.toUpperCase()
        : replacement
    );
    if (normalized !== before) {
      if (!improvements.includes(note)) improvements.push(note);
      fixesCount++;
    }
  });

  // 3. Quita espacios antes de signos de puntuación (sin cruzar saltos de línea)
  const beforePunct = normalized;
  normalized = normalized.replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\uE001])[ \t]+([,.:;])/g, '$1$2');
  if (normalized !== beforePunct) {
    improvements.push('Ajuste de espacios antes de signos de puntuación.');
    fixesCount++;
  }

  // Restaura variables
  normalized = normalized.replace(/\uE000(\d+)\uE001/g, (_, i) => placeholders[Number(i)]);

  if (improvements.length === 0) {
    improvements.push('No se detectaron correcciones automáticas necesarias en este texto.');
  }

  return {
    originalText: text,
    normalizedText: normalized,
    improvements,
    grammarFixesCount: normalized === text ? 0 : fixesCount,
    structureNotes:
      'Revisión por reglas locales: espacios, acentos frecuentes y siglas. Respeta nombres propios y variables. Para una revisión más profunda activa la IA opcional.',
  };
}

const VALID_BLOCK_TYPES: BlockType[] = [
  'header', 'title', 'subtitle', 'paragraph', 'table', 'list', 'signature', 'separator', 'official_seal', 'notice_box', 'footer',
];
const VALID_ALIGN = ['left', 'center', 'right', 'justify'];

/** Valida los bloques devueltos por la IA para que un dato inesperado no rompa el editor. */
function sanitizeBlocks(raw: unknown[]): Block[] {
  const out: Block[] = [];
  raw.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    const b = item as Record<string, any>;
    if (!VALID_BLOCK_TYPES.includes(b.type)) return;
    const block: Block = {
      id: `blk-${idx + 1}`,
      type: b.type,
      label: typeof b.label === 'string' && b.label ? b.label : `Bloque ${idx + 1}`,
      content: typeof b.content === 'string' ? b.content : undefined,
      isEditableByDirector: b.isEditableByDirector !== false,
      alignment: VALID_ALIGN.includes(b.alignment) ? b.alignment : undefined,
    };
    if (b.type === 'table') {
      block.tableHeaders = Array.isArray(b.tableHeaders) ? b.tableHeaders.map(String) : ['Columna 1', 'Columna 2'];
      block.tableRows = Array.isArray(b.tableRows)
        ? b.tableRows.map((r: any, i: number) => ({
            id: `r${i + 1}`,
            cells: Array.isArray(r?.cells) ? r.cells.map(String) : [],
          }))
        : [];
    }
    if (b.type === 'list') {
      block.listItems = Array.isArray(b.listItems) ? b.listItems.map(String) : [];
      block.isNumberedList = !!b.isNumberedList;
    }
    if (b.type === 'signature') {
      block.signatures = Array.isArray(b.signatures) && b.signatures.length
        ? b.signatures.map((s: any) => ({
            roleTitle: String(s?.roleTitle || 'Responsable'),
            personName: String(s?.personName || '{{DIRECTOR}}'),
            personCharge: String(s?.personCharge || '{{CARGO}}'),
          }))
        : [{ roleTitle: 'Responsable', personName: '{{DIRECTOR}}', personCharge: '{{CARGO}}' }];
    }
    out.push(block);
  });
  return out;
}

/**
 * Analiza un documento subido/pegado y lo convierte en una estructura de bloques de plantilla
 */
export async function parseUploadedDocumentToBlocks(rawText: string, docTitle?: string): Promise<{
  name: string;
  category: string;
  description: string;
  blocks: Block[];
  engine?: 'ia' | 'local';
  engineNote?: string;
}> {
  let engineNote: string | undefined;

  if (isAiConfigured()) {
    try {
      const prompt = `
Analiza el siguiente texto de un formato o documento institucional para "Fraternidad Guerreros de la Luz (FGDLL)".
Desglosa el contenido en bloques tipificados para un editor estructurado.
Tipos de bloques disponibles: "title", "subtitle", "paragraph", "table", "list", "signature", "notice_box", "separator".

Texto a procesar:
"""
${rawText}
"""

Responde EXCLUSIVAMENTE en JSON con este esquema:
{
  "name": "Nombre sugerido para la plantilla",
  "category": "Una de: Documentos institucionales, Formatos de grupo, Formatos para centros, Juntas, Liderazgo, Servicio, Hacienda, Experiencias, Universidad FGDLL, Ética, Comunicados, Reconocimientos, Carteles, Redes sociales, Materiales para familias",
  "description": "Breve descripción del propósito de este formato",
  "blocks": [
    {
      "id": "blk-1",
      "type": "title | subtitle | paragraph | table | list | signature | notice_box",
      "label": "Etiqueta descriptiva",
      "content": "Contenido de texto (si aplica, usando {{NOMBRE_CENTRO}}, {{DIRECTOR}}, {{FECHA}}, etc. donde detectes que es dinámico)",
      "isEditableByDirector": true,
      "alignment": "left | center | right | justify",
      "tableHeaders": ["Col 1", "Col 2"],
      "tableRows": [{"id": "r1", "cells": ["Dato 1", "Dato 2"]}],
      "listItems": ["Item 1", "Item 2"],
      "signatures": [{"roleTitle": "Responsable", "personName": "{{DIRECTOR}}", "personCharge": "{{CARGO}}"}]
    }
  ]
}
Usa isEditableByDirector=false sólo para normativa fija o avisos legales. Los campos tableHeaders/tableRows/listItems/signatures aplican únicamente a su tipo de bloque.
`;
      const parsed = (await callGemini(prompt, 0.1)) as Record<string, any>;
      if (parsed && Array.isArray(parsed.blocks)) {
        const blocks = sanitizeBlocks(parsed.blocks);
        if (blocks.length > 0) {
          return {
            name: parsed.name || docTitle || 'Nuevo Formato FGDLL Normalizado',
            category: parsed.category || 'Formatos de grupo',
            description: parsed.description || 'Formato transformado automáticamente a plantilla editable institucional.',
            blocks,
            engine: 'ia',
          };
        }
      }
      engineNote = 'La IA no devolvió bloques utilizables. Se usó el motor local.';
    } catch (e) {
      engineNote = `${(e as Error).message} Se usó el motor local.`;
    }
  }

  return { ...localDocumentParser(rawText, docTitle), engine: 'local', engineNote };
}

function localDocumentParser(rawText: string, docTitle?: string): {
  name: string;
  category: string;
  description: string;
  blocks: Block[];
} {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const blocks: Block[] = [];
  let blockIndex = 1;

  // Title from first line or docTitle
  const title = docTitle || (lines.length > 0 ? lines[0] : 'Nuevo Formato Institucional');
  blocks.push({
    id: `blk-${blockIndex++}`,
    type: 'title',
    label: 'Título del Formato',
    content: title.toUpperCase(),
    isEditableByDirector: false,
    alignment: 'center',
    isBold: true,
    fontSize: 'xl',
  });

  // Second line as subtitle or meta
  if (lines.length > 1) {
    blocks.push({
      id: `blk-${blockIndex++}`,
      type: 'paragraph',
      label: 'Datos de Control y Fecha',
      content: 'Grupo / Centro: {{NOMBRE_CENTRO}} | Folio: {{FOLIO}} | Fecha: {{FECHA}} | Zona: {{ZONA}}',
      isEditableByDirector: true,
      alignment: 'right',
      fontSize: 'xs',
    });
  }

  // Parse remaining lines
  let currentParagraphLines: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check if line looks like signature
    if (/firma|director|responsable|secretario|tesorero/i.test(line)) {
      if (currentParagraphLines.length > 0) {
        blocks.push({
          id: `blk-${blockIndex++}`,
          type: 'paragraph',
          label: `Sección de Texto ${blockIndex - 1}`,
          content: currentParagraphLines.join('\n\n'),
          isEditableByDirector: true,
          alignment: 'justify',
          fontSize: 'sm',
        });
        currentParagraphLines = [];
      }

      blocks.push({
        id: `blk-${blockIndex++}`,
        type: 'signature',
        label: 'Bloque de Validación y Firmas',
        isEditableByDirector: true,
        signatures: [
          { roleTitle: 'Responsable de Turno', personName: '{{DIRECTOR}}', personCharge: '{{CARGO}}' },
          { roleTitle: 'Visto Bueno Zonal', personName: 'Delegación {{ZONA}}', personCharge: 'FGDLL Oficial' },
        ],
      });
      continue;
    }

    // Check if list item
    if (/^[0-9]+[.-]\s|^[-*•]\s/.test(line)) {
      if (currentParagraphLines.length > 0) {
        blocks.push({
          id: `blk-${blockIndex++}`,
          type: 'paragraph',
          label: `Párrafo ${blockIndex - 1}`,
          content: currentParagraphLines.join('\n\n'),
          isEditableByDirector: true,
          alignment: 'justify',
          fontSize: 'sm',
        });
        currentParagraphLines = [];
      }

      // Collect contiguous list items
      const listItems: string[] = [line.replace(/^[0-9]+[.-]\s*|^[-*•]\s*/, '')];
      while (i + 1 < lines.length && /^[0-9]+[.-]\s|^[-*•]\s/.test(lines[i + 1])) {
        i++;
        listItems.push(lines[i].replace(/^[0-9]+[.-]\s*|^[-*•]\s*/, ''));
      }

      blocks.push({
        id: `blk-${blockIndex++}`,
        type: 'list',
        label: 'Lista de Puntos o Normas',
        isEditableByDirector: true,
        isNumberedList: true,
        listItems,
      });
      continue;
    }

    currentParagraphLines.push(line);
  }

  if (currentParagraphLines.length > 0) {
    blocks.push({
      id: `blk-${blockIndex++}`,
      type: 'paragraph',
      label: 'Cuerpo Principal del Formato',
      content: currentParagraphLines.join('\n\n'),
      isEditableByDirector: true,
      alignment: 'justify',
      fontSize: 'sm',
    });
  }

  return {
    name: title,
    category: 'Formatos de grupo',
    description: 'Plantilla normalizada con campos institucionales FGDLL listos para personalización.',
    blocks,
  };
}
