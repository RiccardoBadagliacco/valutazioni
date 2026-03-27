import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { Autovalutazione } from "@/types/autovalutazione";
import type { Database } from "@/types/database";

type AutovalInsert = Database["public"]["Tables"]["autovalutazioni"]["Insert"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAutovalutazione(row: any): Autovalutazione {
  return {
    dipendenteId:          row.dipendente_id,
    dataCompilazione:      row.data_compilazione,
    overview:              row.overview,
    progetto:              row.progetto,
    nuovoProgetto:         row.nuovo_progetto,
    attivitaLipari:        row.attivita_lipari,
    equilibrio:            row.equilibrio,
    sviluppoProfessionale: row.sviluppo_professionale,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const { data, error } = await supabase
      .from("autovalutazioni")
      .select()
      .eq("dipendente_id", dipendenteId)
      .single();

    if (error?.code === "PGRST116") return NextResponse.json(null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapAutovalutazione(data));
  }

  const { data, error } = await supabase.from("autovalutazioni").select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapAutovalutazione));
}

export async function POST(req: NextRequest) {
  const body: Autovalutazione = await req.json();

  const { data, error } = await supabase
    .from("autovalutazioni")
    .upsert({
      dipendente_id:          body.dipendenteId,
      data_compilazione:      body.dataCompilazione,
      overview:               body.overview,
      progetto:               body.progetto,
      nuovo_progetto:         body.nuovoProgetto,
      attivita_lipari:        body.attivitaLipari,
      equilibrio:             body.equilibrio,
      sviluppo_professionale: body.sviluppoProfessionale,
    } as unknown as AutovalInsert, { onConflict: "dipendente_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapAutovalutazione(data), { status: 201 });
}
