import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
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
