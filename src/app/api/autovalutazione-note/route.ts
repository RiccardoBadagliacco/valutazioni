import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type NoteRecord = { dipendenteId: string; note: Record<string, string> };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const result = await pool.query(
      `SELECT dipendente_id AS "dipendenteId", note FROM autovalutazione_note WHERE dipendente_id = $1`,
      [dipendenteId]
    );
    return NextResponse.json(result.rows[0] ?? { dipendenteId, note: {} });
  }

  const result = await pool.query(
    `SELECT dipendente_id AS "dipendenteId", note FROM autovalutazione_note`
  );
  return NextResponse.json(result.rows);
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");
  if (!dipendenteId) return NextResponse.json({ error: "Missing dipendenteId" }, { status: 400 });

  const { key, value }: { key: string; value: string } = await req.json();

  const current = await pool.query(
    "SELECT note FROM autovalutazione_note WHERE dipendente_id = $1",
    [dipendenteId]
  );
  const note: Record<string, string> = current.rows[0]?.note ?? {};

  if (value) note[key] = value;
  else delete note[key];

  await pool.query(
    `INSERT INTO autovalutazione_note (dipendente_id, note) VALUES ($1, $2)
     ON CONFLICT (dipendente_id) DO UPDATE SET note = $2`,
    [dipendenteId, JSON.stringify(note)]
  );

  const updated: NoteRecord = { dipendenteId, note };
  return NextResponse.json(updated);
}
