import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

type NoteRecord = { dipendenteId: string; nota: string; memeIdx: number | null };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNote(row: any): NoteRecord {
  return { dipendenteId: row.dipendente_id, nota: row.nota ?? "", memeIdx: row.meme_idx ?? null };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const { data, error } = await supabase
      .from("riepilogo_note")
      .select()
      .eq("dipendente_id", dipendenteId)
      .single();

    if (error?.code === "PGRST116") return NextResponse.json({ dipendenteId, nota: "", memeIdx: null });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapNote(data));
  }

  const { data, error } = await supabase.from("riepilogo_note").select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapNote));
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");
  if (!dipendenteId) return NextResponse.json({ error: "Missing dipendenteId" }, { status: 400 });

  const body: Partial<Pick<NoteRecord, "nota" | "memeIdx">> = await req.json();

  const { data: current } = await supabase
    .from("riepilogo_note")
    .select()
    .eq("dipendente_id", dipendenteId)
    .single();

  const merged = {
    dipendente_id: dipendenteId,
    nota:     "nota"    in body ? (body.nota    ?? "")   : (current?.nota     ?? ""),
    meme_idx: "memeIdx" in body ? (body.memeIdx ?? null) : (current?.meme_idx ?? null),
  };

  const { data, error } = await supabase
    .from("riepilogo_note")
    .upsert(merged, { onConflict: "dipendente_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapNote(data));
}
