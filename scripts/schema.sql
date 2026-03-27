-- Lipari Portal — PostgreSQL schema + seed
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/vbpdevixtmumhncelubr/sql

-- ── Core tables ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dipendenti (
  id         TEXT PRIMARY KEY,
  nome       TEXT NOT NULL,
  cognome    TEXT NOT NULL,
  jobprofile TEXT NOT NULL,
  sede       TEXT NOT NULL
);

-- dipendente_id: FK to dipendenti (NULL allowed — un valutatore potrebbe non avere un profilo dipendente)
-- dipendenti_ids: TEXT[] perché è una relazione many-to-many gestita applicativamente;
--   non ha FK diretta (PostgreSQL non supporta FK su array).
CREATE TABLE IF NOT EXISTS valutatori (
  id               TEXT    PRIMARY KEY,
  nome             TEXT    NOT NULL,
  cognome          TEXT    NOT NULL,
  email            TEXT    UNIQUE,
  dipendenti_ids   TEXT[]  NOT NULL DEFAULT '{}',
  dipendente_id    TEXT    REFERENCES dipendenti(id) ON DELETE SET NULL,
  password_hash    TEXT,
  special_features BOOLEAN NOT NULL DEFAULT false
);

-- ── Tabelle collegate a dipendenti (CASCADE DELETE) ───────────────────────────

CREATE TABLE IF NOT EXISTS valutazioni (
  id            TEXT    PRIMARY KEY,
  dipendente_id TEXT    NOT NULL REFERENCES dipendenti(id) ON DELETE CASCADE,
  form_id       INTEGER NOT NULL,
  data          TEXT    NOT NULL,
  valutatore    TEXT    NOT NULL,
  societa       TEXT    NOT NULL,
  risposte      JSONB   NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS schede_riassuntive (
  dipendente_id      TEXT  PRIMARY KEY REFERENCES dipendenti(id) ON DELETE CASCADE,
  template_id        TEXT,
  hard_skill         JSONB NOT NULL DEFAULT '[]',
  soft_skill         JSONB NOT NULL DEFAULT '[]',
  crescita_knowledge JSONB,
  performance        JSONB
);

CREATE TABLE IF NOT EXISTS autovalutazioni (
  dipendente_id          TEXT  PRIMARY KEY REFERENCES dipendenti(id) ON DELETE CASCADE,
  data_compilazione      TEXT  NOT NULL,
  overview               JSONB NOT NULL DEFAULT '{}',
  progetto               JSONB NOT NULL DEFAULT '{}',
  nuovo_progetto         JSONB NOT NULL DEFAULT '{}',
  attivita_lipari        JSONB NOT NULL DEFAULT '{}',
  equilibrio             JSONB NOT NULL DEFAULT '{}',
  sviluppo_professionale JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS autovalutazione_note (
  dipendente_id TEXT  PRIMARY KEY REFERENCES dipendenti(id) ON DELETE CASCADE,
  note          JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS economics (
  dipendente_id     TEXT PRIMARY KEY REFERENCES dipendenti(id) ON DELETE CASCADE,
  economics_attuale JSONB,
  proposta_aumento  JSONB,
  bonus             JSONB
);

CREATE TABLE IF NOT EXISTS staffing (
  dipendente_id TEXT  PRIMARY KEY REFERENCES dipendenti(id) ON DELETE CASCADE,
  periodi       JSONB NOT NULL DEFAULT '[]',
  presenze      JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS riepilogo_note (
  dipendente_id TEXT    PRIMARY KEY REFERENCES dipendenti(id) ON DELETE CASCADE,
  nota          TEXT    NOT NULL DEFAULT '',
  meme_idx      INTEGER
);

-- ── Indici ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_valutazioni_dipendente ON valutazioni(dipendente_id);
CREATE INDEX IF NOT EXISTS idx_valutatori_dipendente  ON valutatori(dipendente_id);
CREATE INDEX IF NOT EXISTS idx_valutatori_email       ON valutatori(LOWER(email));

-- ── Seed: Riccardo Badagliacco (password: lipari) ────────────────────────────

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
