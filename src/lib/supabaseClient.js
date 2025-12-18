// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ============================================================
   PRODUCTS (UNCHANGED)
============================================================ */
export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/* ============================================================
   IMAGE COMPRESSION (ALWAYS COMPRESS TO JPEG)
============================================================ */
export async function compressToJpeg(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Resize if necessary (max 1000px)
      const maxSize = 1000;
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG (75% quality = best balance)
      canvas.toBlob(
        (blob) => {
          const jpegFile = new File([blob], "avatar.jpeg", {
            type: "image/jpeg",
          });
          resolve(jpegFile);
        },
        "image/jpeg",
        0.75
      );
    };
  });
}

/* ============================================================
   AVATAR UPLOAD (ALWAYS JPEG, FIXED PATH)
============================================================ */
export async function uploadAvatar(userId, file) {
  if (!file) return null;

  // 🔥 Convert all images to JPEG before uploading
  const jpegFile = await compressToJpeg(file);

  const path = `avatar-${userId}`; // NO EXTENSIONS, FIXED NAME

  const { error } = await supabase.storage
    .from("user-avatars")
    .upload(path, jpegFile, {
      upsert: true,
      cacheControl: "0", // disable caching issues
    });

  if (error) throw error;

  // always return cache-busted URL
  const { data } = supabase.storage
    .from("user-avatars")
    .getPublicUrl(path);

  return data?.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : null;
}

/* ============================================================
   GET AVATAR URL (ALWAYS SAME PATH)
============================================================ */
export function getAvatarUrl(userId) {
  const path = `avatar-${userId}`;

  const { data } = supabase.storage
    .from("user-avatars")
    .getPublicUrl(path);

  if (!data?.publicUrl) return null;

  return `${data.publicUrl}?t=${Date.now()}`;
}


/* ============================================================
   END OF FILE
============================================================ */

