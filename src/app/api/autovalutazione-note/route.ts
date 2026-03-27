import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

type NoteRecord = { dipendenteId: string; note: Record<string, string> };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const { data, error } = await supabase
      .from("autovalutazione_note")
      .select()
      .eq("dipendente_id", dipendenteId)
      .single();

    if (error?.code === "PGRST116") return NextResponse.json({ dipendenteId, note: {} });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ dipendenteId: data.dipendente_id, note: data.note ?? {} });
  }

  const { data, error } = await supabase.from("autovalutazione_note").select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((r) => ({ dipendenteId: r.dipendente_id, note: r.note ?? {} })));
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");
  if (!dipendenteId) return NextResponse.json({ error: "Missing dipendenteId" }, { status: 400 });

  const { key, value }: { key: string; value: string } = await req.json();

  // Fetch current note
  const { data: current } = await supabase
    .from("autovalutazione_note")
    .select("note")
    .eq("dipendente_id", dipendenteId)
    .single();

  const note: Record<string, string> = (current?.note as Record<string, string> | null) ?? {};
  if (value) note[key] = value;
  else delete note[key];

  const { error } = await supabase
    .from("autovalutazione_note")
    .upsert({ dipendente_id: dipendenteId, note }, { onConflict: "dipendente_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const updated: NoteRecord = { dipendenteId, note };
  return NextResponse.json(updated);
}
