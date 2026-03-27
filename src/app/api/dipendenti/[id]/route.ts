import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { DipendenteInput } from "@/types/dipendente";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: DipendenteInput = await req.json();

  if (!body.nome || !body.cognome || !body.jobprofile || !body.sede) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const result = await pool.query(
    "UPDATE dipendenti SET nome=$1, cognome=$2, jobprofile=$3, sede=$4 WHERE id=$5 RETURNING *",
    [body.nome, body.cognome, body.jobprofile, body.sede, id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Dipendente non trovato" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await pool.query("DELETE FROM dipendenti WHERE id=$1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Dipendente non trovato" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
