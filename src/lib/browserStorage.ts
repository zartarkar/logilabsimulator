// Preferences are optional: blocked browser storage must not prevent the app loading.
export const browserStorage = {
  getItem(key: string): string | null {
    try {
      return globalThis.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      globalThis.localStorage.setItem(key, value);
    } catch {
      /* Keep using in-memory UI state. */
    }
  },
  removeItem(key: string): void {
    try {
      globalThis.localStorage.removeItem(key);
    } catch {
      /* Storage may be disabled. */
    }
  },
};
