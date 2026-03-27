import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pool from "@/lib/db";

const SELECT_SAFE = `
  SELECT id, nome, cognome, email,
         dipendenti_ids   AS "dipendentiIds",
         dipendente_id    AS "dipendenteId",
         special_features AS "specialFeatures"
  FROM valutatori
  ORDER BY cognome, nome
`;

export async function GET() {
  const result = await pool.query(SELECT_SAFE);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { nome, cognome }: { nome: string; cognome: string } = await req.json();
  const id = randomUUID();

  await pool.query(
    "INSERT INTO valutatori (id, nome, cognome, dipendenti_ids) VALUES ($1, $2, $3, '{}')",
    [id, nome, cognome]
  );

  return NextResponse.json(
    { id, nome, cognome, dipendentiIds: [], dipendenteId: null, specialFeatures: false },
    { status: 201 }
  );
}
