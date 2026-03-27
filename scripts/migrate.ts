/**
 * Seed script — inserts initial data after tables are created.
 *
 * STEP 1: Run scripts/schema.sql in the Supabase SQL editor first.
 *         https://supabase.com/dashboard/project/vbpdevixtmumhncelubr/sql
 *
 * STEP 2: Run this script to seed the admin account:
 *         npm run migrate
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

async function main() {
  console.log("🌱 Seeding database...");

  const { error } = await supabase.from("valutatori").upsert(
    {
      id:               "v-riccardo",
      nome:             "Riccardo",
      cognome:          "Badagliacco",
      email:            "riccardo.badagliacco@liparipeople.com",
      dipendenti_ids:   [],
      dipendente_id:    null,
      password_hash:    "$2b$10$I0jLGLYwR1m.oNRt4MUIoOlVsYql4uKn285Q0FlaoyoOZQZZY2XkW",
      special_features: true,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  if (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }

  console.log("✅ Seed completed. Riccardo Badagliacco account is ready.");
}

main();
