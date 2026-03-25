import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/riepilogo-note.json");

type NoteRecord = { dipendenteId: string; nota: string; memeIdx: number | null };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  const data: NoteRecord[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const result = dipendenteId
    ? (data.find((r) => r.dipendenteId === dipendenteId) ?? { dipendenteId, nota: "" })
    : data;

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");
  if (!dipendenteId) return NextResponse.json({ error: "Missing dipendenteId" }, { status: 400 });

  const body: Partial<Pick<NoteRecord, "nota" | "memeIdx">> = await req.json();
  const data: NoteRecord[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  const idx = data.findIndex((r) => r.dipendenteId === dipendenteId);
  if (idx === -1) data.push({ dipendenteId, nota: body.nota ?? "", memeIdx: body.memeIdx ?? null });
  else data[idx] = { ...data[idx], ...body };

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  return NextResponse.json(data.find((r) => r.dipendenteId === dipendenteId));
}
