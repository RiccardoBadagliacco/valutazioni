"use client";

import { useEffect, useState } from "react";
import { Dipendente, DipendenteInput, JOB_PROFILES, SEDI } from "@/types/dipendente";
import { Valutatore } from "@/types/valutatore";
import { MapPin, ShieldCheck, User, ChevronDown } from "lucide-react";

export type DipendenteFormData = DipendenteInput & { valutatoreId?: string | null };

interface Props {
  dipendente?: Dipendente;
  onSubmit: (data: DipendenteFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  valutatori?: Valutatore[];
  linkedValutatoreId?: string | null;
}

// Job profiles split into two tiers for visual hierarchy
const JP_BASE   = ["Junior", "C1", "C2"] as const;
const JP_SENIOR = ["SC1", "SC2", "SC3"] as const;

function getInitials(nome: string, cognome: string) {
  const n = nome.trim()[0] ?? "";
  const c = cognome.trim()[0] ?? "";
  return (n + c).toUpperCase() || null;
}

export default function DipendenteForm({ dipendente, onSubmit, onCancel, loading, valutatori = [], linkedValutatoreId }: Props) {
  const [form, setForm] = useState<DipendenteInput>({
    nome: "", cognome: "", jobprofile: "", sede: "",
  });
  const [valutatoreId, setValutatoreId] = useState<string | null>(linkedValutatoreId ?? null);

  useEffect(() => {
    if (dipendente) {
      setForm({
        nome:       dipendente.nome,
        cognome:    dipendente.cognome,
        jobprofile: dipendente.jobprofile,
        sede:       dipendente.sede,
      });
    }
  }, [dipendente]);

  useEffect(() => {
    setValutatoreId(linkedValutatoreId ?? null);
  }, [linkedValutatoreId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...form, valutatoreId });
  };

  const initials = getInitials(form.nome, form.cognome);
  const previewName = [form.nome, form.cognome].filter(Boolean).join(" ") || null;
  const previewSub  = [form.jobprofile, form.sede].filter(Boolean).join(" · ") || null;
  const canSubmit   = !loading && !!form.nome.trim() && !!form.cognome.trim() && !!form.sede && !!form.jobprofile;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Live preview ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F8F8] rounded-xl border border-[#F0F0F0]">
        <div className="w-10 h-10 rounded-xl bg-[#E5E5E5] flex items-center justify-center text-sm font-bold text-[#1A1A1A] shrink-0">
          {initials ?? <User className="w-4 h-4 text-[#BDBDBD]" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111] truncate">
            {previewName ?? <span className="text-[#BDBDBD] font-normal">Nome Cognome</span>}
          </p>
          <p className="text-xs text-[#999] mt-0.5 flex items-center gap-1 truncate">
            {previewSub ? (
              <>
                <MapPin className="w-3 h-3 shrink-0" />
                {previewSub}
              </>
            ) : (
              <span className="text-[#BDBDBD]">Job Profile · Sede</span>
            )}
          </p>
        </div>
      </div>

      {/* ── Nome + Cognome ── */}
      <div className="grid grid-cols-2 gap-3">
        {(["nome", "cognome"] as const).map((field) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#999] uppercase tracking-wide">
              {field === "nome" ? "Nome" : "Cognome"}
            </label>
            <div className="flex items-center bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl overflow-hidden focus-within:border-[#111] focus-within:bg-white transition-colors">
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={field === "nome" ? "Mario" : "Rossi"}
                required
                className="flex-1 px-3 py-2.5 text-sm font-medium text-[#111] bg-transparent focus:outline-none placeholder:font-normal placeholder:text-[#BDBDBD]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Sede ── */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#999] uppercase tracking-wide">Sede</label>
        <div className="flex gap-2">
          {SEDI.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, sede: s })}
              className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                form.sede === s
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#E8E8E8] text-[#666] hover:border-[#999] bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Job Profile ── */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#999] uppercase tracking-wide">Job profile</label>
        <div className="space-y-2">
          {/* Base tier */}
          <div className="grid grid-cols-3 gap-2">
            {JP_BASE.map((jp) => (
              <button
                key={jp}
                type="button"
                onClick={() => setForm({ ...form, jobprofile: jp })}
                className={`py-2 rounded-xl border text-sm font-medium transition-colors ${
                  form.jobprofile === jp
                    ? "border-[#111] bg-[#111] text-white"
                    : "border-[#E8E8E8] text-[#666] hover:border-[#999] bg-white"
                }`}
              >
                {jp}
              </button>
            ))}
          </div>
          {/* Senior tier */}
          <div className="grid grid-cols-3 gap-2">
            {JP_SENIOR.map((jp) => (
              <button
                key={jp}
                type="button"
                onClick={() => setForm({ ...form, jobprofile: jp })}
                className={`py-2 rounded-xl border text-sm font-semibold transition-colors ${
                  form.jobprofile === jp
                    ? "border-[#111] bg-[#111] text-white"
                    : "border-[#DCDCDC] text-[#333] hover:border-[#999] bg-[#FAFAFA]"
                }`}
              >
                {jp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Collega account valutatore ── */}
      <div className="flex flex-col gap-2 pt-1 border-t border-[#F3F3F3]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#BDBDBD]" />
          <label className="text-xs font-semibold text-[#999] uppercase tracking-wide">Account valutatore</label>
        </div>

        {valutatori.length === 0 ? (
          <p className="text-xs text-[#BDBDBD] bg-[#FAFAFA] border border-[#F0F0F0] rounded-xl px-3 py-2.5">
            Nessun altro account valutatore disponibile
          </p>
        ) : (
          <div className="relative">
            <select
              value={valutatoreId ?? ""}
              onChange={(e) => setValutatoreId(e.target.value || null)}
              className="w-full appearance-none bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl px-3 py-2.5 pr-9 text-sm text-[#111] font-medium focus:outline-none focus:border-[#111] focus:bg-white transition-colors cursor-pointer"
            >
              <option value="">Nessuno</option>
              {valutatori.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome} {v.cognome}{v.email ? ` — ${v.email}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BDBDBD] pointer-events-none" />
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-[#666] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-xl transition-colors disabled:opacity-40"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 py-2.5 text-sm font-semibold bg-[#111] hover:bg-[#333] text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? "Salvataggio…" : dipendente ? "Salva modifiche" : "Aggiungi"}
        </button>
      </div>

    </form>
  );
}
