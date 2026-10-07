import { useSyncExternalStore } from "react";

// A tiny browser-only store over one localStorage key. Reads and writes are
// guarded because storage can be unavailable (private windows, blocked site
// data); when it is, values live in memory for the session and `saved` is false.

export interface StoreSnapshot<T> {
  value: T;
  /** False when the last write could not reach localStorage. */
  saved: boolean;
}

export interface LocalStore<T> {
  get(): StoreSnapshot<T>;
  set(next: T): boolean;
  clear(): void;
  subscribe(listener: () => void): () => void;
}

export function createLocalStore<T>(key: string, parse: (raw: unknown) => T, empty: T): LocalStore<T> {
  let cache: StoreSnapshot<T> | undefined;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  function load(): StoreSnapshot<T> {
    try {
      const raw = window.localStorage.getItem(key);
      return { value: raw ? parse(JSON.parse(raw)) : empty, saved: true };
    } catch {
      return { value: empty, saved: false };
    }
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== key && event.key !== null) return;
    cache = load();
    notify();
  }

  return {
    get() {
      cache ??= load();
      return cache;
    },
    set(next) {
      let saved = true;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        saved = false;
      }
      cache = { value: next, saved };
      notify();
      return saved;
    },
    clear() {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Nothing stored.
      }
      cache = { value: empty, saved: true };
      notify();
    },
    subscribe(listener) {
      if (listeners.size === 0) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
  };
}

const serverSnapshot = () => null;

/** Null during prerender and hydration, then the stored value. */
export function useLocalStore<T>(store: LocalStore<T>): StoreSnapshot<T> | null {
  return useSyncExternalStore(store.subscribe, store.get, serverSnapshot);
}
