// Memory registry to store raw File objects for audio exercises, avoiding Zustand serialization or draft persistence issues.
const audioFileRegistry = new Map<string, File>();

export function registerAudioFile(key: string, file: File): void {
  audioFileRegistry.set(key, file);
}

export function getAudioFile(key: string): File | undefined {
  return audioFileRegistry.get(key);
}

export function removeAudioFile(key: string): void {
  audioFileRegistry.delete(key);
}

export function clearAudioRegistry(): void {
  audioFileRegistry.clear();
}
