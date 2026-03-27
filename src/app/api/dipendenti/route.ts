import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pool from "@/lib/db";
import { DipendenteInput } from "@/types/dipendente";

export async function GET() {
  const result = await pool.query(
    "SELECT id, nome, cognome, jobprofile, sede FROM dipendenti ORDER BY cognome, nome"
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const body: DipendenteInput = await req.json();

  if (!body.nome || !body.cognome || !body.jobprofile || !body.sede) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const id = randomUUID();
  await pool.query(
    "INSERT INTO dipendenti (id, nome, cognome, jobprofile, sede) VALUES ($1, $2, $3, $4, $5)",
    [id, body.nome, body.cognome, body.jobprofile, body.sede]
  );

  return NextResponse.json({ id, ...body }, { status: 201 });
}
