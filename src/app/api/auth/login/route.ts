import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import bcrypt from "bcryptjs";
import path from "path";
import { Valutatore } from "@/types/valutatore";

const DATA_PATH = path.join(process.cwd(), "src/data/valutatori.json");

function strip(v: Valutatore): Omit<Valutatore, "passwordHash"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...rest } = v;
  return rest;
}

export async function POST(req: NextRequest) {
  const { email, password }: { email: string; password: string } = await req.json();

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();
  const data: Valutatore[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  const user = data.find((v) => v.email?.toLowerCase() === emailNorm);

  if (!user) {
    return NextResponse.json({ error: "Account non trovato. Registrati prima." }, { status: 404 });
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "Account non configurato. Usa 'Registrati' per impostare la password." },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Password errata." }, { status: 401 });
  }

  return NextResponse.json(strip(user));
}
