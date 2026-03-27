import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import supabase from "@/lib/supabase";
import { Valutazione } from "@/types/valutazione";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapValutazione(row: any): Valutazione {
  return {
    id:           row.id,
    dipendenteId: row.dipendente_id,
    formId:       row.form_id,
    data:         row.data,
    valutatore:   row.valutatore,
    societa:      row.societa,
    risposte:     row.risposte ?? [],
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  let query = supabase
    .from("valutazioni")
    .select()
    .order("data", { ascending: false });

  if (dipendenteId) query = query.eq("dipendente_id", dipendenteId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapValutazione));
}

export async function POST(req: NextRequest) {
  const body: Omit<Valutazione, "id"> = await req.json();
  const id = randomUUID();

  const { data, error } = await supabase
    .from("valutazioni")
    .insert({
      id,
      dipendente_id: body.dipendenteId,
      form_id:       body.formId,
      data:          body.data,
      valutatore:    body.valutatore,
      societa:       body.societa,
      risposte:      body.risposte,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapValutazione(data), { status: 201 });
}
