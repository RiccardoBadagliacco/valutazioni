import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import supabase from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password }: { email: string; password: string } = await req.json();

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();

  const { data: user, error } = await supabase
    .from("valutatori")
    .select("*")
    .ilike("email", emailNorm)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Account non trovato. Registrati prima." }, { status: 404 });

  if (!user.password_hash) {
    return NextResponse.json(
      { error: "Account non configurato. Usa 'Registrati' per impostare la password." },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return NextResponse.json({ error: "Password errata." }, { status: 401 });

  return NextResponse.json({
    id:              user.id,
    nome:            user.nome,
    cognome:         user.cognome,
    email:           user.email,
    dipendentiIds:   user.dipendenti_ids ?? [],
    dipendenteId:    user.dipendente_id ?? null,
    specialFeatures: user.special_features ?? false,
  });
}
