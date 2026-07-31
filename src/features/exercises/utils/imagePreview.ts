const previewCache = new WeakMap<File | Blob, string>();

/**
 * Gets a cached Object URL for a given File or Blob to prevent creating multiple URLs for the same object.
 */
export const getPreviewUrl = (file: File | Blob): string => {
  let url = previewCache.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    previewCache.set(file, url);
  }
  return url;
};

/**
 * Checks if a given object is a serialized draft placeholder.
 */
export const isDraftPlaceholder = (url: any): boolean => {
  return url !== null && typeof url === "object" && url.__isDraftPlaceholder === true;
};

/**
 * Safely resolves a preview source URL, handling strings, File/Blob instances, and placeholders.
 */
export const previewSrc = (url: any): string => {
  if (typeof url === "string") return url;
  if (url instanceof File || url instanceof Blob) {
    return getPreviewUrl(url);
  }
  return "/600x600.png";
};
