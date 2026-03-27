/**
 * Setup script — creates all tables and seeds the initial admin account.
 * Run once with: npm run migrate
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── Tables ───────────────────────────────────────────────────────────────

    await client.query(`
      CREATE TABLE IF NOT EXISTS dipendenti (
        id          TEXT PRIMARY KEY,
        nome        TEXT NOT NULL,
        cognome     TEXT NOT NULL,
        jobprofile  TEXT NOT NULL,
        sede        TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS valutatori (
        id               TEXT PRIMARY KEY,
        nome             TEXT NOT NULL,
        cognome          TEXT NOT NULL,
        email            TEXT,
        dipendenti_ids   TEXT[]  NOT NULL DEFAULT '{}',
        dipendente_id    TEXT,
        password_hash    TEXT,
        special_features BOOLEAN NOT NULL DEFAULT false
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS valutazioni (
        id            TEXT PRIMARY KEY,
        dipendente_id TEXT NOT NULL,
        form_id       INTEGER NOT NULL,
        data          TEXT NOT NULL,
        valutatore    TEXT NOT NULL,
        societa       TEXT NOT NULL,
        risposte      JSONB NOT NULL DEFAULT '[]'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schede_riassuntive (
        dipendente_id      TEXT PRIMARY KEY,
        template_id        TEXT,
        hard_skill         JSONB NOT NULL DEFAULT '[]',
        soft_skill         JSONB NOT NULL DEFAULT '[]',
        crescita_knowledge JSONB,
        performance        JSONB
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS autovalutazioni (
        dipendente_id          TEXT PRIMARY KEY,
        data_compilazione      TEXT NOT NULL,
        overview               JSONB NOT NULL DEFAULT '{}',
        progetto               JSONB NOT NULL DEFAULT '{}',
        nuovo_progetto         JSONB NOT NULL DEFAULT '{}',
        attivita_lipari        JSONB NOT NULL DEFAULT '{}',
        equilibrio             JSONB NOT NULL DEFAULT '{}',
        sviluppo_professionale JSONB NOT NULL DEFAULT '{}'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS autovalutazione_note (
        dipendente_id TEXT PRIMARY KEY,
        note          JSONB NOT NULL DEFAULT '{}'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS economics (
        dipendente_id     TEXT PRIMARY KEY,
        economics_attuale JSONB,
        proposta_aumento  JSONB,
        bonus             JSONB
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS staffing (
        dipendente_id TEXT PRIMARY KEY,
        periodi       JSONB NOT NULL DEFAULT '[]',
        presenze      JSONB NOT NULL DEFAULT '[]'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS riepilogo_note (
        dipendente_id TEXT PRIMARY KEY,
        nota          TEXT NOT NULL DEFAULT '',
        meme_idx      INTEGER
      );
    `);

    // ── Seed: Riccardo Badagliacco ────────────────────────────────────────────

    await client.query(`
      INSERT INTO valutatori (id, nome, cognome, email, dipendenti_ids, dipendente_id, password_hash, special_features)
      VALUES (
        'v-riccardo',
        'Riccardo',
        'Badagliacco',
        'riccardo.badagliacco@liparipeople.com',
        '{}',
        NULL,
        '$2b$10$I0jLGLYwR1m.oNRt4MUIoOlVsYql4uKn285Q0FlaoyoOZQZZY2XkW',
        true
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query("COMMIT");
    console.log("✅ Migration completed successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
