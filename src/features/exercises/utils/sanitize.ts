/**
 * Sanitiza recursivamente strings dentro de un valor o estructura de datos.
 * Elimina espacios al inicio y final de cada línea (trim) y colapsa múltiples espacios
 * horizontales en uno solo para evitar discrepancias en respuestas.
 */
export function sanitizeData(val: any): any {
  if (typeof val === "string") {
    // Reemplaza múltiples espacios o tabulaciones horizontales con un único espacio
    let cleaned = val.replace(/[ \t]+/g, " ");
    // Quita espacios al inicio y final de cada línea (respetando los saltos de línea)
    cleaned = cleaned.split("\n").map((line) => line.trim()).join("\n");
    return cleaned.trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeData);
  }
  if (val !== null && typeof val === "object") {
    // Si estamos en entorno navegador y es un archivo/blob temporal del borrador, lo preservamos sin alterar
    if (typeof window !== "undefined" && (val instanceof File || val instanceof Blob)) {
      return val;
    }
    const obj: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        obj[key] = sanitizeData(val[key]);
      }
    }
    return obj;
  }
  return val;
}
