import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Staffing } from "@/types/staffing";

const SELECT_ROW = `
  SELECT dipendente_id AS "dipendenteId", periodi, presenze
  FROM staffing
`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const result = await pool.query(`${SELECT_ROW} WHERE dipendente_id = $1`, [dipendenteId]);
    return NextResponse.json(result.rows[0] ?? null);
  }

  const result = await pool.query(SELECT_ROW);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const body: Staffing = await req.json();

  await pool.query(
    `INSERT INTO staffing (dipendente_id, periodi, presenze)
     VALUES ($1, $2, $3)
     ON CONFLICT (dipendente_id) DO UPDATE SET periodi = $2, presenze = $3`,
    [body.dipendenteId, JSON.stringify(body.periodi), JSON.stringify(body.presenze)]
  );

  return NextResponse.json(body, { status: 201 });
}
