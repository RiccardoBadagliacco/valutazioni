import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, password }: { email: string; password: string } = await req.json();

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();

  const result = await pool.query(
    "SELECT * FROM valutatori WHERE LOWER(email) = $1",
    [emailNorm]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Account non trovato. Registrati prima." }, { status: 404 });
  }

  const user = result.rows[0];

  if (!user.password_hash) {
    return NextResponse.json(
      { error: "Account non configurato. Usa 'Registrati' per impostare la password." },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Password errata." }, { status: 401 });
  }

  return NextResponse.json({
    id:              user.id,
    nome:            user.nome,
    cognome:         user.cognome,
    email:           user.email,
    dipendentiIds:   user.dipendenti_ids,
    dipendenteId:    user.dipendente_id,
    specialFeatures: user.special_features,
  });
}
