import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import supabase from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapValutatore(row: any) {
  return {
    id:              row.id,
    nome:            row.nome,
    cognome:         row.cognome,
    email:           row.email ?? null,
    dipendentiIds:   row.dipendenti_ids ?? [],
    dipendenteId:    row.dipendente_id ?? null,
    specialFeatures: row.special_features ?? false,
  };
}

export async function GET() {
  const { data, error } = await supabase
    .from("valutatori")
    .select("id, nome, cognome, email, dipendenti_ids, dipendente_id, special_features")
    .order("cognome")
    .order("nome");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapValutatore));
}

export async function POST(req: NextRequest) {
  const { nome, cognome }: { nome: string; cognome: string } = await req.json();

  const { data, error } = await supabase
    .from("valutatori")
    .insert({ id: randomUUID(), nome, cognome, dipendenti_ids: [] })
    .select("id, nome, cognome, email, dipendenti_ids, dipendente_id, special_features")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapValutatore(data), { status: 201 });
}
