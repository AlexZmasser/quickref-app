import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { installSupabaseStorage, uploadImage, deleteImage } from "./supabaseClient.js";

/**
 * Wires the app up to Supabase (Postgres for data, Storage for images) so
 * data persists in the cloud instead of just in this browser. This replaces
 * the earlier localStorage-only approach, which only ever lived on one
 * device/browser and could be cleared by browser settings.
 */
installSupabaseStorage();
window.uploadImage = uploadImage;
window.deleteImage = deleteImage;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
