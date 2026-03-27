import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { SchedaRiassuntiva } from "@/types/scheda";
import type { Database } from "@/types/database";

type SchedeInsert = Database["public"]["Tables"]["schede_riassuntive"]["Insert"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapScheda(row: any): SchedaRiassuntiva {
  return {
    dipendenteId:       row.dipendente_id,
    templateId:         row.template_id ?? undefined,
    hardSkill:          row.hard_skill ?? [],
    softSkill:          row.soft_skill ?? [],
    crescitaKnowledge:  row.crescita_knowledge ?? null,
    performance:        row.performance ?? undefined,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  if (dipendenteId) {
    const { data, error } = await supabase
      .from("schede_riassuntive")
      .select()
      .eq("dipendente_id", dipendenteId)
      .single();

    if (error?.code === "PGRST116") return NextResponse.json(null, { status: 404 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapScheda(data));
  }

  const { data, error } = await supabase.from("schede_riassuntive").select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(mapScheda));
}

export async function POST(req: NextRequest) {
  const body: SchedaRiassuntiva = await req.json();

  const { data, error } = await supabase
    .from("schede_riassuntive")
    .upsert({
      dipendente_id:      body.dipendenteId,
      template_id:        body.templateId ?? null,
      hard_skill:         body.hardSkill,
      soft_skill:         body.softSkill,
      crescita_knowledge: body.crescitaKnowledge ?? null,
      performance:        body.performance ?? null,
    } as unknown as SchedeInsert, { onConflict: "dipendente_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(mapScheda(data), { status: 201 });
}
