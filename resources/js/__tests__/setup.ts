import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";

// Auto-cleanup after every test
afterEach(cleanup);

// Suppress console noise from components during tests
const noop = () => {};
vi.spyOn(console, "warn").mockImplementation(noop);
vi.spyOn(console, "error").mockImplementation(noop);

// localStorage stub
const localStorageStore: Record<string, string> = {};
Object.defineProperty(window, "localStorage", {
  value: {
    getItem:    (k: string) => localStorageStore[k] ?? null,
    setItem:    (k: string, v: string) => { localStorageStore[k] = v; },
    removeItem: (k: string) => { delete localStorageStore[k]; },
    clear:      () => { for (const k in localStorageStore) delete localStorageStore[k]; },
  },
  writable: true,
});

// requestAnimationFrame stub
global.requestAnimationFrame = (cb) => { cb(0); return 0; };
global.cancelAnimationFrame  = () => {};
