import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { Economics } from "@/types/economics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEconomics(row: any): Economics {
  return {
    dipendenteId:     row.dipendente_id,
    economicsAttuale: row.economics_attuale ?? null,
    propostaAumento:  row.proposta_aumento ?? null,
    bonus:            row.bonus ?? null,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const { data, error } = await supabase
      .from("economics")
      .select()
      .eq("dipendente_id", dipendenteId)
      .single();

    if (error?.code === "PGRST116") return NextResponse.json(null, { status: 404 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapEconomics(data));
  }

  const { data, error } = await supabase.from("economics").select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapEconomics));
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");
  if (!dipendenteId) return NextResponse.json({ error: "Missing dipendenteId" }, { status: 400 });

  const body: Partial<Economics> = await req.json();

  // Fetch existing to merge
  const { data: existing } = await supabase
    .from("economics")
    .select()
    .eq("dipendente_id", dipendenteId)
    .single();

  const merged = {
    dipendente_id:     dipendenteId,
    economics_attuale: "economicsAttuale" in body ? (body.economicsAttuale ?? null) : (existing?.economics_attuale ?? null),
    proposta_aumento:  "propostaAumento"  in body ? (body.propostaAumento  ?? null) : (existing?.proposta_aumento  ?? null),
    bonus:             "bonus"            in body ? (body.bonus            ?? null) : (existing?.bonus            ?? null),
  };

  const { data, error } = await supabase
    .from("economics")
    .upsert(merged, { onConflict: "dipendente_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const status = existing ? 200 : 201;
  return NextResponse.json(mapEconomics(data), { status });
}
