import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: {
    addDipendenteId?: string;
    removeDipendenteId?: string;
    setDipendenteId?: string | null;
  } = await req.json();

  const exists = await pool.query("SELECT id FROM valutatori WHERE id=$1", [id]);
  if (exists.rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.addDipendenteId) {
    await pool.query(
      `UPDATE valutatori
       SET dipendenti_ids = array_append(dipendenti_ids, $1)
       WHERE id = $2 AND NOT ($1 = ANY(dipendenti_ids))`,
      [body.addDipendenteId, id]
    );
  }

  if (body.removeDipendenteId) {
    await pool.query(
      "UPDATE valutatori SET dipendenti_ids = array_remove(dipendenti_ids, $1) WHERE id = $2",
      [body.removeDipendenteId, id]
    );
  }

  if ("setDipendenteId" in body) {
    if (body.setDipendenteId) {
      await pool.query(
        "UPDATE valutatori SET dipendente_id = NULL WHERE dipendente_id = $1 AND id != $2",
        [body.setDipendenteId, id]
      );
    }
    await pool.query(
      "UPDATE valutatori SET dipendente_id = $1 WHERE id = $2",
      [body.setDipendenteId ?? null, id]
    );
  }

  const result = await pool.query(
    `SELECT id, nome, cognome, email,
            dipendenti_ids   AS "dipendentiIds",
            dipendente_id    AS "dipendenteId",
            special_features AS "specialFeatures"
     FROM valutatori WHERE id = $1`,
    [id]
  );

  return NextResponse.json(result.rows[0]);
}
