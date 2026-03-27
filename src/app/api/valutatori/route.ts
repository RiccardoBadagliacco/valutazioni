import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/valutatori.json");

export async function GET() {
  const data = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  return NextResponse.json(data);
}
