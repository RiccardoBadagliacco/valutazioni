-- Aggiunge FK, UNIQUE e indici alle tabelle già create con la versione precedente di schema.sql
-- Esegui nel Supabase SQL editor: https://supabase.com/dashboard/project/vbpdevixtmumhncelubr/sql

-- ── valutatori ────────────────────────────────────────────────────────────────

ALTER TABLE valutatori
  ADD CONSTRAINT IF NOT EXISTS fk_valutatori_dipendente
    FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id) ON DELETE SET NULL;

ALTER TABLE valutatori
  ADD CONSTRAINT IF NOT EXISTS uq_valutatori_email UNIQUE (email);

-- ── tabelle figlie (CASCADE DELETE) ──────────────────────────────────────────

ALTER TABLE valutazioni
  ADD CONSTRAINT IF NOT EXISTS fk_valutazioni_dipendente
    FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id) ON DELETE CASCADE;

ALTER TABLE schede_riassuntive
  ADD CONSTRAINT IF NOT EXISTS fk_schede_dipendente
    FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id) ON DELETE CASCADE;

ALTER TABLE autovalutazioni
  ADD CONSTRAINT IF NOT EXISTS fk_autovalutazioni_dipendente
    FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id) ON DELETE CASCADE;

ALTER TABLE autovalutazione_note
  ADD CONSTRAINT IF NOT EXISTS fk_autovalutazione_note_dipendente
    FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id) ON DELETE CASCADE;

ALTER TABLE economics
  ADD CONSTRAINT IF NOT EXISTS fk_economics_dipendente
    FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id) ON DELETE CASCADE;

ALTER TABLE staffing
  ADD CONSTRAINT IF NOT EXISTS fk_staffing_dipendente
    FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id) ON DELETE CASCADE;

ALTER TABLE riepilogo_note
  ADD CONSTRAINT IF NOT EXISTS fk_riepilogo_note_dipendente
    FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id) ON DELETE CASCADE;

-- ── Indici ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_valutazioni_dipendente ON valutazioni(dipendente_id);
CREATE INDEX IF NOT EXISTS idx_valutatori_dipendente  ON valutatori(dipendente_id);
CREATE INDEX IF NOT EXISTS idx_valutatori_email       ON valutatori(LOWER(email));
