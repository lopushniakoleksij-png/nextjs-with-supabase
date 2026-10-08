// Browser-only, device-local bookmarks: IDs only, no personal information.
// Never used during server rendering.
export const SAVED_KEY = "promocode4:saved:v1";
export const SAVED_EVENT = "promocode4:saved-changed";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_IDS = 100;

export function readSavedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return Array.from(new Set(
      data.filter((id): id is string => typeof id === "string" && UUID.test(id)),
    )).slice(0, MAX_IDS);
  } catch {
    return [];
  }
}

export function changeSavedId(id: string, save: boolean): boolean {
  if (!UUID.test(id)) return false;
  try {
    const existing = readSavedIds().filter((value) => value !== id);
    const next = save ? [id, ...existing].slice(0, MAX_IDS) : existing;
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_EVENT));
    return true;
  } catch {
    return false;
  }
}
