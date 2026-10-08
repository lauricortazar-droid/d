/**
 * Acceso seguro a localStorage.
 * - Nunca lanza excepciones (modo privado, cuota llena, JSON dañado).
 * - Valida el contenido leído para que datos viejos o corruptos no rompan la app.
 */

export function loadJSON<T>(key: string, fallback: T, validate?: (value: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) {
      console.warn(`Datos inválidos en "${key}", se usan los valores iniciales.`);
      return fallback;
    }
    return parsed as T;
  } catch (e) {
    console.warn(`No se pudo leer "${key}":`, e);
    return fallback;
  }
}

export function loadString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Devuelve false si no se pudo guardar (por ejemplo, almacenamiento lleno). */
export function saveJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`No se pudo guardar "${key}":`, e);
    return false;
  }
}

export function saveString(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`No se pudo guardar "${key}":`, e);
    return false;
  }
}

export const isArrayOfObjectsWithId = (v: unknown): boolean =>
  Array.isArray(v) &&
  v.every((item) => item && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string');
