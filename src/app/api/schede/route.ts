import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { SchedaRiassuntiva } from "@/types/scheda";

const SELECT_ROW = `
  SELECT dipendente_id      AS "dipendenteId",
         template_id        AS "templateId",
         hard_skill         AS "hardSkill",
         soft_skill         AS "softSkill",
         crescita_knowledge AS "crescitaKnowledge",
         performance
  FROM schede_riassuntive
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

export async function POST(req: NextRequest) {
  const body: SchedaRiassuntiva = await req.json();

  await pool.query(
    `INSERT INTO schede_riassuntive
       (dipendente_id, template_id, hard_skill, soft_skill, crescita_knowledge, performance)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (dipendente_id) DO UPDATE SET
       template_id        = EXCLUDED.template_id,
       hard_skill         = EXCLUDED.hard_skill,
       soft_skill         = EXCLUDED.soft_skill,
       crescita_knowledge = EXCLUDED.crescita_knowledge,
       performance        = EXCLUDED.performance`,
    [
      body.dipendenteId,
      body.templateId ?? null,
      JSON.stringify(body.hardSkill),
      JSON.stringify(body.softSkill),
      body.crescitaKnowledge ? JSON.stringify(body.crescitaKnowledge) : null,
      body.performance ? JSON.stringify(body.performance) : null,
    ]
  );

  return NextResponse.json(body, { status: 201 });
}
