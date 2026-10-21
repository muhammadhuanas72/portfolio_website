import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, remoteEnabled } from "../lib/remote";
import { portfolioData } from "../data/portfolioData";

export const supabase = remoteEnabled ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Only this account may edit. The check here is for the interface; the real guard is the
// row-level-security and storage policies in supabase/schema.sql.
export const OWNER_EMAIL = (import.meta.env.VITE_OWNER_EMAIL || portfolioData.personalInfo.socials.email).toLowerCase();

export const LIMITS = {
  resumeBytes: 5 * 1024 * 1024,
  imageBytes: 4 * 1024 * 1024,
  imageTypes: { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" },
};
