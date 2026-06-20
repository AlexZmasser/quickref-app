import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

/**
 * The app was originally built for Claude.ai's artifact runtime, which provides
 * a built-in `window.storage` API (account-linked, persists across devices).
 * Outside that environment there's no such API, so this shim re-implements the
 * same interface using the browser's own localStorage instead.
 *
 * Behaviour differences to know about once self-hosted:
 *  - Data is now stored per-browser/per-device, not tied to an account.
 *  - It persists across refreshes and reopening the site, same as before.
 *  - Clearing browser site data (or using a different browser/device) starts fresh.
 *  - The "shared" parameter is ignored here since there's no multi-user backend —
 *    everything is effectively personal/local.
 */
if (!window.storage) {
  window.storage = {
    async get(key) {
      const raw = window.localStorage.getItem(key);
      if (raw === null) throw new Error(`No value found for key: ${key}`);
      return { key, value: raw, shared: false };
    },
    async set(key, value) {
      window.localStorage.setItem(key, value);
      return { key, value, shared: false };
    },
    async delete(key) {
      window.localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    },
    async list(prefix) {
      const keys = Object.keys(window.localStorage).filter((k) => !prefix || k.startsWith(prefix));
      return { keys, prefix, shared: false };
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
