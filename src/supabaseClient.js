import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zeapmoifqtbwfughdzim.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplYXBtb2lmcXRid2Z1Z2hkemltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzI1MzAsImV4cCI6MjA5NzYwODUzMH0.GUh7fQNElustLkHOFEy4LOb_ItJr-ZZArL9S67jnXRE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Installs a window.storage implementation backed by Supabase Postgres
 * (a simple key/value table called "kv_store"), matching the same
 * interface the app expects from Claude.ai's artifact storage.
 */
export function installSupabaseStorage() {
  window.storage = {
    async get(key) {
      const { data, error } = await supabase
        .from("kv_store")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error(`No value found for key: ${key}`);
      return { key, value: data.value, shared: false };
    },
    async set(key, value) {
      const { error } = await supabase
        .from("kv_store")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      return { key, value, shared: false };
    },
    async delete(key) {
      const { error } = await supabase.from("kv_store").delete().eq("key", key);
      if (error) throw error;
      return { key, deleted: true, shared: false };
    },
    async list(prefix) {
      let query = supabase.from("kv_store").select("key");
      if (prefix) query = query.like("key", `${prefix}%`);
      const { data, error } = await query;
      if (error) throw error;
      return { keys: (data || []).map((r) => r.key), prefix, shared: false };
    },
  };
}

/**
 * Uploads a compressed image Blob to the "images" Storage bucket and
 * returns its public URL. Installed as window.uploadImage so the shared
 * App.jsx code can use it automatically when available.
 */
export async function uploadImage(blob) {
  const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from("images").upload(filename, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("images").getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * Best-effort delete of an uploaded image given its public URL.
 * Installed as window.deleteImage.
 */
export async function deleteImage(url) {
  try {
    const marker = "/images/";
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);
    await supabase.storage.from("images").remove([path]);
  } catch (e) {
    // best-effort cleanup only — failures here shouldn't break the UI
  }
}
