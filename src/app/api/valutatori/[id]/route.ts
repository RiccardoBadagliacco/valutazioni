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
  const body: {
    addDipendenteId?: string;
    removeDipendenteId?: string;
    setDipendenteId?: string | null;
  } = await req.json();

  const data: Valutatore[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const idx = data.findIndex((v) => v.id === id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.addDipendenteId && !data[idx].dipendentiIds.includes(body.addDipendenteId)) {
    data[idx].dipendentiIds.push(body.addDipendenteId);
  }
  if (body.removeDipendenteId) {
    data[idx].dipendentiIds = data[idx].dipendentiIds.filter((d) => d !== body.removeDipendenteId);
  }
  if ("setDipendenteId" in body) {
    // Clear this dipendenteId from any other valutatore first
    if (body.setDipendenteId) {
      data.forEach((v, i) => {
        if (i !== idx && v.dipendenteId === body.setDipendenteId) {
          data[i].dipendenteId = null;
        }
      });
    }
    data[idx].dipendenteId = body.setDipendenteId ?? null;
  }

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  // Strip passwordHash before returning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safe } = data[idx];
  return NextResponse.json(safe);
}
