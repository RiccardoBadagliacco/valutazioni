import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import supabase from "@/lib/supabase";
import type { Database } from "@/types/database";

type ValutatoreRow = Database["public"]["Tables"]["valutatori"]["Row"];

function safeRow(row: ValutatoreRow) {
  return {
    id:              row.id,
    nome:            row.nome,
    cognome:         row.cognome,
    email:           row.email,
    dipendentiIds:   row.dipendenti_ids ?? [],
    dipendenteId:    row.dipendente_id ?? null,
    specialFeatures: row.special_features ?? false,
  };
}

export async function POST(req: NextRequest) {
  const { nome, cognome, email, password }: {
    nome: string; cognome: string; email: string; password: string;
  } = await req.json();

  if (!nome?.trim() || !cognome?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();
  const hash = await bcrypt.hash(password, 10);

  // Check if email already exists
  const { data: byEmail, error: byEmailError } = await supabase
    .from("valutatori")
    .select("*")
    .ilike("email", emailNorm)
    .maybeSingle();

  if (byEmailError) return NextResponse.json({ error: byEmailError.message }, { status: 500 });

  if (byEmail) {
    if (byEmail.password_hash) {
      return NextResponse.json({ error: "Email già registrata. Accedi con la password." }, { status: 409 });
    }
    // Legacy account — claim it
    const { data: updated, error } = await supabase
      .from("valutatori")
      .update({ nome: nome.trim(), cognome: cognome.trim(), email: emailNorm, password_hash: hash })
      .eq("id", byEmail.id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(safeRow(updated), { status: 200 });
  }

  // Check legacy account by nome+cognome (no email, no password)
  const { data: byName, error: byNameError } = await supabase
    .from("valutatori")
    .select("*")
    .is("email", null)
    .is("password_hash", null)
    .ilike("nome", nome.trim())
    .ilike("cognome", cognome.trim())
    .maybeSingle();

  if (byNameError) return NextResponse.json({ error: byNameError.message }, { status: 500 });

  if (byName) {
    const { data: updated, error } = await supabase
      .from("valutatori")
      .update({ email: emailNorm, password_hash: hash })
      .eq("id", byName.id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(safeRow(updated), { status: 200 });
  }

  // Create new account
  const { data: inserted, error } = await supabase
    .from("valutatori")
    .insert({ id: randomUUID(), nome: nome.trim(), cognome: cognome.trim(), email: emailNorm, dipendenti_ids: [], password_hash: hash })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(safeRow(inserted), { status: 201 });
}
