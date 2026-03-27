import { NextRequest, NextResponse } from "next/server";
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

const SELECT_SAFE = "id, nome, cognome, email, dipendenti_ids, dipendente_id, special_features";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: {
    addDipendenteId?: string;
    removeDipendenteId?: string;
    setDipendenteId?: string | null;
  } = await req.json();

  // Fetch current valutatore
  const { data: current, error: fetchErr } = await supabase
    .from("valutatori")
    .select(SELECT_SAFE)
    .eq("id", id)
    .single();

  if (fetchErr || !current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let dipendentiIds: string[] = current.dipendenti_ids ?? [];

  if (body.addDipendenteId && !dipendentiIds.includes(body.addDipendenteId)) {
    dipendentiIds = [...dipendentiIds, body.addDipendenteId];
  }

  if (body.removeDipendenteId) {
    dipendentiIds = dipendentiIds.filter((d) => d !== body.removeDipendenteId);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = { dipendenti_ids: dipendentiIds };

  if ("setDipendenteId" in body) {
    if (body.setDipendenteId) {
      // Clear same dipendenteId from other valutatori
      await supabase
        .from("valutatori")
        .update({ dipendente_id: null })
        .eq("dipendente_id", body.setDipendenteId)
        .neq("id", id);
    }
    updates.dipendente_id = body.setDipendenteId ?? null;
  }

  const { data: updated, error } = await supabase
    .from("valutatori")
    .update(updates)
    .eq("id", id)
    .select(SELECT_SAFE)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapValutatore(updated));
}
