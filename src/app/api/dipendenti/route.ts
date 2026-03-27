import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import supabase from "@/lib/supabase";
import { DipendenteInput } from "@/types/dipendente";

export async function GET() {
  const { data, error } = await supabase
    .from("dipendenti")
    .select()
    .order("cognome")
    .order("nome");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body: DipendenteInput = await req.json();

  if (!body.nome || !body.cognome || !body.jobprofile || !body.sede) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dipendenti")
    .insert({ id: randomUUID(), ...body })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
