import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { Valutazione } from "@/types/valutazione";

const DATA_PATH = path.join(process.cwd(), "src/data/valutazioni.json");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  const data: Valutazione[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  const result = dipendenteId
    ? data.filter((v) => v.dipendenteId === dipendenteId)
    : data;

  return NextResponse.json(result);
}
