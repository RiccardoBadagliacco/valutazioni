import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
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
  const { nome, cognome, email, password }: {
    nome: string; cognome: string; email: string; password: string;
  } = await req.json();

  if (!nome?.trim() || !cognome?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();

  const data: Valutatore[] = JSON.parse(readFileSync(DATA_PATH, "utf-8"));

  // Check email uniqueness
  const byEmail = data.find((v) => v.email?.toLowerCase() === emailNorm);
  if (byEmail) {
    if (byEmail.passwordHash) {
      return NextResponse.json({ error: "Email già registrata. Accedi con la password." }, { status: 409 });
    }
    // Legacy account without password — claim it by email
    byEmail.nome       = nome.trim();
    byEmail.cognome    = cognome.trim();
    byEmail.email      = emailNorm;
    byEmail.passwordHash = await bcrypt.hash(password, 10);
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return NextResponse.json(strip(byEmail), { status: 200 });
  }

  // Also claim legacy account matched by nome+cognome (no email, no password)
  const byName = data.find(
    (v) =>
      !v.email &&
      !v.passwordHash &&
      v.nome.toLowerCase() === nome.trim().toLowerCase() &&
      v.cognome.toLowerCase() === cognome.trim().toLowerCase()
  );
  if (byName) {
    byName.email        = emailNorm;
    byName.passwordHash = await bcrypt.hash(password, 10);
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return NextResponse.json(strip(byName), { status: 200 });
  }

  const nuovo: Valutatore = {
    id: randomUUID(),
    nome: nome.trim(),
    cognome: cognome.trim(),
    email: emailNorm,
    dipendentiIds: [],
    passwordHash: await bcrypt.hash(password, 10),
  };
  data.push(nuovo);
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return NextResponse.json(strip(nuovo), { status: 201 });
}
