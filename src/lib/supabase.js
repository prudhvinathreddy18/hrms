import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing Supabase credentials. Copy .env.example to .env and fill in your project URL and publishable key."
  );
}

export const supabase = createClient(url, key);
