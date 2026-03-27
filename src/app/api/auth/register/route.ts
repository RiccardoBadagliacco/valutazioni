import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

function safeRow(row: Record<string, unknown>) {
  return {
    id:              row.id,
    nome:            row.nome,
    cognome:         row.cognome,
    email:           row.email,
    dipendentiIds:   row.dipendenti_ids,
    dipendenteId:    row.dipendente_id,
    specialFeatures: row.special_features,
  };
}

export async function POST(req: NextRequest) {
  const { nome, cognome, email, password }: {
    nome: string; cognome: string; email: string; password: string;
  } = await req.json();

  if (!nome?.trim() || !cognome?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();
  const hash = await bcrypt.hash(password, 10);

  // Check if email already exists
  const byEmail = await pool.query("SELECT * FROM valutatori WHERE LOWER(email) = $1", [emailNorm]);
  if ((byEmail.rowCount ?? 0) > 0) {
    const existing = byEmail.rows[0];
    if (existing.password_hash) {
      return NextResponse.json({ error: "Email già registrata. Accedi con la password." }, { status: 409 });
    }
    // Legacy account without password — claim it
    const updated = await pool.query(
      `UPDATE valutatori SET nome=$1, cognome=$2, email=$3, password_hash=$4 WHERE id=$5 RETURNING *`,
      [nome.trim(), cognome.trim(), emailNorm, hash, existing.id]
    );
    return NextResponse.json(safeRow(updated.rows[0]), { status: 200 });
  }

  // Check legacy account by nome+cognome (no email, no password)
  const byName = await pool.query(
    `SELECT * FROM valutatori
     WHERE email IS NULL AND password_hash IS NULL
       AND LOWER(nome) = LOWER($1) AND LOWER(cognome) = LOWER($2)`,
    [nome.trim(), cognome.trim()]
  );
  if ((byName.rowCount ?? 0) > 0) {
    const updated = await pool.query(
      `UPDATE valutatori SET email=$1, password_hash=$2 WHERE id=$3 RETURNING *`,
      [emailNorm, hash, byName.rows[0].id]
    );
    return NextResponse.json(safeRow(updated.rows[0]), { status: 200 });
  }

  // Create new account
  const id = randomUUID();
  const inserted = await pool.query(
    `INSERT INTO valutatori (id, nome, cognome, email, dipendenti_ids, password_hash)
     VALUES ($1, $2, $3, $4, '{}', $5) RETURNING *`,
    [id, nome.trim(), cognome.trim(), emailNorm, hash]
  );

  return NextResponse.json(safeRow(inserted.rows[0]), { status: 201 });
}
