"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Dipendente, DipendenteInput, JOB_PROFILES, SEDI } from "@/types/dipendente";

interface Props {
  dipendente?: Dipendente;
  onSubmit: (data: DipendenteInput) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function DipendenteForm({ dipendente, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<DipendenteInput>({
    nome: "", cognome: "", jobprofile: "", sede: "",
  });

  useEffect(() => {
    if (dipendente) {
      setForm({
        nome: dipendente.nome,
        cognome: dipendente.cognome,
        jobprofile: dipendente.jobprofile,
        sede: dipendente.sede,
      });
    }
  }, [dipendente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Nome + Cognome */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#666]">Nome</label>
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Mario"
            required
            className="h-9 rounded-xl border-[#E5E5E5] text-sm focus-visible:ring-[#111] focus-visible:ring-1"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#666]">Cognome</label>
          <Input
            value={form.cognome}
            onChange={(e) => setForm({ ...form, cognome: e.target.value })}
            placeholder="Rossi"
            required
            className="h-9 rounded-xl border-[#E5E5E5] text-sm focus-visible:ring-[#111] focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Sede */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#666]">Sede</label>
        <div className="grid grid-cols-3 gap-2">
          {SEDI.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, sede: s })}
              className={`py-2 rounded-xl border text-sm font-medium transition-colors ${
                form.sede === s
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#E5E5E5] text-[#666] hover:border-[#999] bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Job Profile */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#666]">Job profile</label>
        <div className="grid grid-cols-3 gap-2">
          {JOB_PROFILES.map((jp) => (
            <button
              key={jp}
              type="button"
              onClick={() => setForm({ ...form, jobprofile: jp })}
              className={`py-2 rounded-xl border text-sm font-medium transition-colors ${
                form.jobprofile === jp
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#E5E5E5] text-[#666] hover:border-[#999] bg-white"
              }`}
            >
              {jp}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-[#666] bg-[#F5F5F5] hover:bg-[#EFEFEF] rounded-xl transition-colors"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading || !form.sede || !form.jobprofile}
          className="flex-1 py-2.5 text-sm font-semibold bg-[#111] hover:bg-[#333] text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? "Salvataggio..." : dipendente ? "Salva modifiche" : "Aggiungi"}
        </button>
      </div>

    </form>
  );
}
