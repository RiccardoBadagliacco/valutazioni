import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Autovalutazione } from "@/types/autovalutazione";

const SELECT_ROW = `
  SELECT dipendente_id          AS "dipendenteId",
         data_compilazione      AS "dataCompilazione",
         overview,
         progetto,
         nuovo_progetto         AS "nuovoProgetto",
         attivita_lipari        AS "attivitaLipari",
         equilibrio,
         sviluppo_professionale AS "sviluppoProfessionale"
  FROM autovalutazioni
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
  const body: Autovalutazione = await req.json();

  await pool.query(
    `INSERT INTO autovalutazioni
       (dipendente_id, data_compilazione, overview, progetto, nuovo_progetto,
        attivita_lipari, equilibrio, sviluppo_professionale)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (dipendente_id) DO UPDATE SET
       data_compilazione      = EXCLUDED.data_compilazione,
       overview               = EXCLUDED.overview,
       progetto               = EXCLUDED.progetto,
       nuovo_progetto         = EXCLUDED.nuovo_progetto,
       attivita_lipari        = EXCLUDED.attivita_lipari,
       equilibrio             = EXCLUDED.equilibrio,
       sviluppo_professionale = EXCLUDED.sviluppo_professionale`,
    [
      body.dipendenteId,
      body.dataCompilazione,
      JSON.stringify(body.overview),
      JSON.stringify(body.progetto),
      JSON.stringify(body.nuovoProgetto),
      JSON.stringify(body.attivitaLipari),
      JSON.stringify(body.equilibrio),
      JSON.stringify(body.sviluppoProfessionale),
    ]
  );

  return NextResponse.json(body, { status: 201 });
}
