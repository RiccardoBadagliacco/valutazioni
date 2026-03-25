import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Dipendente, DipendenteInput } from "@/types/dipendente";
import { randomUUID } from "crypto";

const DATA_PATH = path.join(process.cwd(), "src/data/dipendenti.json");

function readData(): Dipendente[] {
  const raw = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeData(data: Dipendente[]) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body: DipendenteInput = await req.json();

  if (!body.nome || !body.cognome || !body.jobprofile || !body.sede) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const data = readData();
  const nuovo: Dipendente = { id: randomUUID(), ...body };
  data.push(nuovo);
  writeData(data);

  return NextResponse.json(nuovo, { status: 201 });
}
