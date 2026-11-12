// ======================================================================
// VITEST SETUP
// ======================================================================

import { MockHTMLAudioElement } from './__mocks__/HTMLAudioElement';

// Replace the global HTMLAudioElement with the mock
Object.defineProperty(global, 'HTMLAudioElement', {
  writable: true,
  value: MockHTMLAudioElement,
});

// Node >= 23 enables an experimental Web Storage implementation whose global
// localStorage/sessionStorage accessors shadow jsdom's in the test environment,
// and which is non-functional without Node's --localstorage-file flag (methods
// like clear() are missing). When the storage in the environment is broken,
// replace it with a functional in-memory implementation. On Node versions
// where jsdom's storage survives (20/22), this leaves it untouched.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(String(key), String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

for (const storageKey of ['localStorage', 'sessionStorage'] as const) {
  if (typeof globalThis[storageKey]?.clear !== 'function') {
    Object.defineProperty(globalThis, storageKey, {
      configurable: true,
      value: new MemoryStorage(),
    });
  }
}
