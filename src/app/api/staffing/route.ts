import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { Staffing } from "@/types/staffing";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStaffing(row: any): Staffing {
  return {
    dipendenteId: row.dipendente_id,
    periodi:      row.periodi ?? [],
    presenze:     row.presenze ?? [],
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const { data, error } = await supabase
      .from("staffing")
      .select()
      .eq("dipendente_id", dipendenteId)
      .single();

    if (error?.code === "PGRST116") return NextResponse.json(null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapStaffing(data));
  }

  const { data, error } = await supabase.from("staffing").select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapStaffing));
}

export async function POST(req: NextRequest) {
  const body: Staffing = await req.json();

  const { data, error } = await supabase
    .from("staffing")
    .upsert(
      { dipendente_id: body.dipendenteId, periodi: body.periodi, presenze: body.presenze },
      { onConflict: "dipendente_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapStaffing(data), { status: 201 });
}
