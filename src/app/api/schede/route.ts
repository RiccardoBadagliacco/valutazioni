import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { SchedaRiassuntiva } from "@/types/scheda";

const DATA_PATH = path.join(process.cwd(), "src/data/schede.json");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  const data: SchedaRiassuntiva[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  const result = dipendenteId
    ? data.find((s) => s.dipendenteId === dipendenteId) ?? null
    : data;

  if (dipendenteId && !result) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body: SchedaRiassuntiva = await req.json();
  const data: SchedaRiassuntiva[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const idx = data.findIndex((s) => s.dipendenteId === body.dipendenteId);
  if (idx >= 0) {
    data[idx] = body;
  } else {
    data.push(body);
  }
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return NextResponse.json(body, { status: 201 });
}
