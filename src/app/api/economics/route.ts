import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { Economics } from "@/types/economics";

const DATA_PATH = path.join(process.cwd(), "src/data/economics.json");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");

  const data: Economics[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  const result = dipendenteId
    ? data.find((e) => e.dipendenteId === dipendenteId) ?? null
    : data;

  if (dipendenteId && !result) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dipendenteId = searchParams.get("dipendenteId");
  if (!dipendenteId) return NextResponse.json({ error: "Missing dipendenteId" }, { status: 400 });

  const body: Partial<Economics> = await req.json();
  const data: Economics[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  const idx = data.findIndex((e) => e.dipendenteId === dipendenteId);
  if (idx === -1) return NextResponse.json(null, { status: 404 });

  data[idx] = { ...data[idx], ...body, dipendenteId };

  const { writeFileSync } = await import("fs");
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");

  return NextResponse.json(data[idx]);
}
