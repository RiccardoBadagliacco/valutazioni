import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Valutatore } from "@/types/valutatore";

const DATA_PATH = path.join(process.cwd(), "src/data/valutatori.json");

// PATCH /api/valutatori/[id] — add or remove a dipendenteId
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { addDipendenteId, removeDipendenteId }: { addDipendenteId?: string; removeDipendenteId?: string } =
    await req.json();

  const data: Valutatore[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const idx = data.findIndex((v) => v.id === id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (addDipendenteId && !data[idx].dipendentiIds.includes(addDipendenteId)) {
    data[idx].dipendentiIds.push(addDipendenteId);
  }
  if (removeDipendenteId) {
    data[idx].dipendentiIds = data[idx].dipendentiIds.filter((d) => d !== removeDipendenteId);
  }

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return NextResponse.json(data[idx]);
}
