import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Dipendente, DipendenteInput } from "@/types/dipendente";

const DATA_PATH = path.join(process.cwd(), "src/data/dipendenti.json");

function readData(): Dipendente[] {
  const raw = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeData(data: Dipendente[]) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: DipendenteInput = await req.json();

  if (!body.nome || !body.cognome || !body.jobprofile || !body.sede) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const data = readData();
  const index = data.findIndex((d) => d.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Dipendente non trovato" }, { status: 404 });
  }

  data[index] = { id, ...body };
  writeData(data);

  return NextResponse.json(data[index]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = readData();
  const index = data.findIndex((d) => d.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Dipendente non trovato" }, { status: 404 });
  }

  data.splice(index, 1);
  writeData(data);

  return NextResponse.json({ success: true });
}
