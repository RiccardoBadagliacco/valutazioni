"use client";

import { useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Plus, Search, Users, TrendingUp, Banknote, MapPin } from "lucide-react";
import { Dipendente, DipendenteInput } from "@/types/dipendente";
import { Economics } from "@/types/economics";
import DipendenteDialog from "@/components/dipendenti/DipendenteDialog";
import ConfermaEliminazione from "@/components/dipendenti/ConfermaEliminazione";
import DipendenteCard from "@/components/dipendenti/DipendenteCard";

function formatEur(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export default function Page() {
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [economics, setEconomics]   = useState<Economics[]>([]);
  const [ricerca, setRicerca]       = useState("");
  const [sedeFiltro, setSedeFiltro] = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [formOpen, setFormOpen]     = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected]     = useState<Dipendente | undefined>();

  const fetchAll = useCallback(async (signal?: AbortSignal) => {
    const [rDip, rEco] = await Promise.all([
      fetch("/api/dipendenti", { signal }),
      fetch("/api/economics",  { signal }),
    ]);
    if (signal?.aborted) return;
    setDipendenti(await rDip.json());
    setEconomics(await rEco.json());
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchAll(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchAll]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  // Solo economics di dipendenti esistenti, deduplicati
  const dipendentiIds = new Set(dipendenti.map((d) => d.id));
  const uniqueEconomics = economics.filter(
    (e, i, arr) =>
      dipendentiIds.has(e.dipendenteId) &&
      arr.findIndex((x) => x.dipendenteId === e.dipendenteId) === i
  );
  const conEco = uniqueEconomics.filter((e) => e.economicsAttuale !== null);
  const ralMedia = conEco.length
    ? conEco.reduce((s, e) => s + e.economicsAttuale!.ral, 0) / conEco.length
    : 0;
  const conAumento = uniqueEconomics.filter((e) => {
    if (!e.economicsAttuale || !e.propostaAumento) return false;
    const nuovaRal = Number(e.propostaAumento.nuovaRal);
    const ral      = Number(e.economicsAttuale.ral);
    return Number.isFinite(nuovaRal) && Number.isFinite(ral) && nuovaRal > ral;
  });
  const aumentoMedio = conEco.length > 0
    ? conAumento.reduce((sum, e) => {
        const nuovaRal = Number(e.propostaAumento!.nuovaRal!);
        const ral      = Number(e.economicsAttuale!.ral);
        return sum + ((nuovaRal - ral) / ral) * 100;
      }, 0) / conEco.length
    : 0;

  // ── Sedi uniche ────────────────────────────────────────────────────────────
  const sedi = Array.from(new Set(dipendenti.map((d) => d.sede))).sort();

  // ── Filtri ─────────────────────────────────────────────────────────────────
  const filtrati = dipendenti.filter((d) => {
    const q = ricerca.toLowerCase();
    const matchSearch =
      d.nome.toLowerCase().includes(q) ||
      d.cognome.toLowerCase().includes(q) ||
      d.sede.toLowerCase().includes(q) ||
      d.jobprofile.toLowerCase().includes(q);
    const matchSede = !sedeFiltro || d.sede === sedeFiltro;
    return matchSearch && matchSede;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (data: DipendenteInput) => {
    setLoading(true);
    try {
      if (selected) {
        await fetch(`/api/dipendenti/${selected.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast.success("Dipendente aggiornato");
      } else {
        await fetch("/api/dipendenti", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast.success("Dipendente aggiunto");
      }
      await fetchAll(undefined);
      setFormOpen(false);
    } catch {
      toast.error("Errore. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await fetch(`/api/dipendenti/${selected.id}`, { method: "DELETE" });
      toast.success("Dipendente eliminato");
      await fetchAll(undefined);
      setDeleteOpen(false);
    } catch {
      toast.error("Errore. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f9]">
      <Toaster richColors position="top-right" />

      {/* ── Header ── */}
      <header className="bg-white border-b border-[#EBEBEB] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#111] rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-[#111] text-sm leading-none">HR Portal</p>
            <p className="text-xs text-[#999] mt-0.5">Valutazione 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BDBDBD]" />
            <input
              placeholder="Cerca dipendente..."
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl w-56 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD] transition-colors"
            />
          </div>
          <button
            onClick={() => { setSelected(undefined); setFormOpen(true); }}
            className="flex items-center gap-2 bg-[#111] hover:bg-[#333] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuovo dipendente
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {/* Dipendenti */}
          <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Users className="w-3.5 h-3.5 text-[#BDBDBD]" />
              <p className="text-xs text-[#999]">Dipendenti</p>
            </div>
            <p className="text-2xl font-bold text-[#111]">{dipendenti.length}</p>
          </div>

          {/* RAL media */}
          <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Banknote className="w-3.5 h-3.5 text-[#BDBDBD]" />
              <p className="text-xs text-[#999]">RAL media</p>
            </div>
            <p className="text-2xl font-bold text-[#111]">
              {conEco.length ? formatEur(ralMedia) : "—"}
            </p>
          </div>

          {/* Con aumento */}
          <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#BDBDBD]" />
              <p className="text-xs text-[#999]">Con aumento RAL</p>
            </div>
            <p className="text-2xl font-bold text-[#111]">
              {conAumento.length}
              <span className="text-sm font-normal text-[#999] ml-1">/ {dipendenti.length}</span>
            </p>
          </div>

          {/* Aumento medio */}
          <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#BDBDBD]" />
              <p className="text-xs text-[#999]">Aumento medio RAL</p>
            </div>
            <p className="text-2xl font-bold text-[#111]">
              {conAumento.length ? `+${aumentoMedio.toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>

        {/* ── Filtro sede + contatore ── */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSedeFiltro(null)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                !sedeFiltro
                  ? "bg-[#111] text-white"
                  : "bg-white border border-[#E5E5E5] text-[#666] hover:border-[#999]"
              }`}
            >
              Tutti
            </button>
            {sedi.map((s) => (
              <button
                key={s}
                onClick={() => setSedeFiltro(s === sedeFiltro ? null : s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  sedeFiltro === s
                    ? "bg-[#111] text-white"
                    : "bg-white border border-[#E5E5E5] text-[#666] hover:border-[#999]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#999]">
            {filtrati.length} {filtrati.length === 1 ? "dipendente" : "dipendenti"}
          </p>
        </div>

        {/* ── Grid ── */}
        {filtrati.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#BDBDBD]">
            <Users className="w-10 h-10 mb-4 opacity-40" />
            <p className="font-medium text-[#999]">Nessun dipendente trovato</p>
            <p className="text-sm text-[#BDBDBD] mt-1">
              {ricerca ? "Prova con un altro termine di ricerca" : "Clicca \"Nuovo dipendente\" per iniziare"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filtrati.map((d) => (
              <DipendenteCard
                key={d.id}
                dipendente={d}
                economics={economics.find((e) => e.dipendenteId === d.id)}
                onEdit={() => { setSelected(d); setFormOpen(true); }}
                onDelete={() => { setSelected(d); setDeleteOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      <DipendenteDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        dipendente={selected}
        onSubmit={handleSubmit}
        loading={loading}
      />
      <ConfermaEliminazione
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        dipendente={selected}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}
