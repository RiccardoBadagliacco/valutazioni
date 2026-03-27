import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pool from "@/lib/db";
import { Valutazione } from "@/types/valutazione";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  const result = dipendenteId
    ? await pool.query(
        `SELECT id, dipendente_id AS "dipendenteId", form_id AS "formId",
                data, valutatore, societa, risposte
         FROM valutazioni WHERE dipendente_id = $1 ORDER BY data DESC`,
        [dipendenteId]
      )
    : await pool.query(
        `SELECT id, dipendente_id AS "dipendenteId", form_id AS "formId",
                data, valutatore, societa, risposte
         FROM valutazioni ORDER BY data DESC`
      );

  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const body: Omit<Valutazione, "id"> = await req.json();
  const id = randomUUID();

  await pool.query(
    `INSERT INTO valutazioni (id, dipendente_id, form_id, data, valutatore, societa, risposte)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, body.dipendenteId, body.formId, body.data, body.valutatore, body.societa, JSON.stringify(body.risposte)]
  );

  return NextResponse.json({ id, ...body }, { status: 201 });
}
