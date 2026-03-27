import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Economics } from "@/types/economics";

const SELECT_ROW = `
  SELECT dipendente_id     AS "dipendenteId",
         economics_attuale AS "economicsAttuale",
         proposta_aumento  AS "propostaAumento",
         bonus
  FROM economics
`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const result = await pool.query(`${SELECT_ROW} WHERE dipendente_id = $1`, [dipendenteId]);
    if (result.rowCount === 0) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(result.rows[0]);
  }

  const result = await pool.query(SELECT_ROW);
  return NextResponse.json(result.rows);
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");
  if (!dipendenteId) return NextResponse.json({ error: "Missing dipendenteId" }, { status: 400 });

  const body: Partial<Economics> = await req.json();

  const current = await pool.query(
    "SELECT economics_attuale, proposta_aumento, bonus FROM economics WHERE dipendente_id = $1",
    [dipendenteId]
  );

  if (current.rowCount === 0) {
    const nuovo: Economics = {
      dipendenteId,
      economicsAttuale: null,
      propostaAumento: null,
      bonus: null,
      ...body,
    };
    await pool.query(
      `INSERT INTO economics (dipendente_id, economics_attuale, proposta_aumento, bonus)
       VALUES ($1, $2, $3, $4)`,
      [
        dipendenteId,
        nuovo.economicsAttuale ? JSON.stringify(nuovo.economicsAttuale) : null,
        nuovo.propostaAumento  ? JSON.stringify(nuovo.propostaAumento)  : null,
        nuovo.bonus            ? JSON.stringify(nuovo.bonus)            : null,
      ]
    );
    return NextResponse.json(nuovo, { status: 201 });
  }

  const ex = current.rows[0];
  const merged: Economics = {
    dipendenteId,
    economicsAttuale: "economicsAttuale" in body ? (body.economicsAttuale ?? null) : ex.economics_attuale,
    propostaAumento:  "propostaAumento"  in body ? (body.propostaAumento  ?? null) : ex.proposta_aumento,
    bonus:            "bonus"            in body ? (body.bonus            ?? null) : ex.bonus,
  };

  await pool.query(
    `UPDATE economics SET economics_attuale=$1, proposta_aumento=$2, bonus=$3 WHERE dipendente_id=$4`,
    [
      merged.economicsAttuale ? JSON.stringify(merged.economicsAttuale) : null,
      merged.propostaAumento  ? JSON.stringify(merged.propostaAumento)  : null,
      merged.bonus            ? JSON.stringify(merged.bonus)            : null,
      dipendenteId,
    ]
  );

  return NextResponse.json(merged);
}
