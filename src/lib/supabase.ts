import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// Singleton for server-side use (API routes)
declare global {
  var _supabase: ReturnType<typeof createClient> | undefined;
}

const supabase =
  global._supabase ?? createClient(supabaseUrl, supabaseKey);

if (process.env.NODE_ENV !== "production") {
  global._supabase = supabase;
}

export default supabase;
