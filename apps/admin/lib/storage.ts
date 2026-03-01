/**
 * Safe localStorage wrapper for Next.js SSR compatibility.
 * Node.js 25+ exposes a global `localStorage` object that lacks proper methods
 * when `--localstorage-file` is not configured, causing "localStorage.getItem is not a function" errors.
 */

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage?.getItem === "function";
}

export function getStorageItem(key: string): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(key);
}

export function setStorageItem(key: string, value: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, value);
}

export function removeStorageItem(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}
