import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import { Valutatore } from "@/types/valutatore";

const DATA_PATH = path.join(process.cwd(), "src/data/valutatori.json");

export async function GET() {
  const data: Valutatore[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  // Never expose password hashes to the client
  return NextResponse.json(data.map(({ passwordHash: _, ...rest }) => rest));
}

export async function POST(req: NextRequest) {
  const { nome, cognome }: { nome: string; cognome: string } = await req.json();
  const data: Valutatore[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  const nuovo: Valutatore = { id: randomUUID(), nome, cognome, dipendentiIds: [] };
  data.push(nuovo);
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return NextResponse.json(nuovo, { status: 201 });
}
