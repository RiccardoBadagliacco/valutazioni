import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { DipendenteInput } from "@/types/dipendente";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: DipendenteInput = await req.json();

  if (!body.nome || !body.cognome || !body.jobprofile || !body.sede) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("dipendenti")
    .update({ nome: body.nome, cognome: body.cognome, jobprofile: body.jobprofile, sede: body.sede })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase.from("dipendenti").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
