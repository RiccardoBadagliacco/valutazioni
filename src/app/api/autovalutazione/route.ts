import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { Autovalutazione } from "@/types/autovalutazione";

const DATA_PATH = path.join(process.cwd(), "src/data/autovalutazione.json");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  const data: Autovalutazione[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  const result = dipendenteId
    ? data.find((a) => a.dipendenteId === dipendenteId) ?? null
    : data;

  return NextResponse.json(result);
}
