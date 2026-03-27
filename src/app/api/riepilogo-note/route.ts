import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type NoteRecord = { dipendenteId: string; nota: string; memeIdx: number | null };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const result = await pool.query(
      `SELECT dipendente_id AS "dipendenteId", nota, meme_idx AS "memeIdx"
       FROM riepilogo_note WHERE dipendente_id = $1`,
      [dipendenteId]
    );
    return NextResponse.json(result.rows[0] ?? { dipendenteId, nota: "", memeIdx: null });
  }

  const result = await pool.query(
    `SELECT dipendente_id AS "dipendenteId", nota, meme_idx AS "memeIdx" FROM riepilogo_note`
  );
  return NextResponse.json(result.rows);
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");
  if (!dipendenteId) return NextResponse.json({ error: "Missing dipendenteId" }, { status: 400 });

  const body: Partial<Pick<NoteRecord, "nota" | "memeIdx">> = await req.json();

  const current = await pool.query(
    `SELECT nota, meme_idx AS "memeIdx" FROM riepilogo_note WHERE dipendente_id = $1`,
    [dipendenteId]
  );

  const merged: NoteRecord = {
    dipendenteId,
    nota:    "nota"    in body ? (body.nota    ?? "")   : (current.rows[0]?.nota    ?? ""),
    memeIdx: "memeIdx" in body ? (body.memeIdx ?? null) : (current.rows[0]?.memeIdx ?? null),
  };

  await pool.query(
    `INSERT INTO riepilogo_note (dipendente_id, nota, meme_idx)
     VALUES ($1, $2, $3)
     ON CONFLICT (dipendente_id) DO UPDATE SET nota = $2, meme_idx = $3`,
    [dipendenteId, merged.nota, merged.memeIdx]
  );

  return NextResponse.json(merged);
}
