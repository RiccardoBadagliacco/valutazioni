"use client";

import { useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Plus, Search, Users, TrendingUp, Banknote, LogOut, Eye, EyeOff, HelpCircle, CheckCircle2 } from "lucide-react";
import { Dipendente } from "@/types/dipendente";
import { DipendenteFormData } from "@/components/dipendenti/DipendenteForm";
import { Economics } from "@/types/economics";
import { Valutatore } from "@/types/valutatore";
import { SchedaRiassuntiva } from "@/types/scheda";
import DipendenteDialog from "@/components/dipendenti/DipendenteDialog";
import ConfermaEliminazione from "@/components/dipendenti/ConfermaEliminazione";
import DipendenteCard from "@/components/dipendenti/DipendenteCard";
import SchedaWizard from "@/components/valutazione/SchedaWizard";
import OnboardingWizard from "@/components/OnboardingWizard";

function formatEur(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

// ── Login / Register Page ───────────────────────────────────────────────────

function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoFocus,
  rightSlot,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#999] uppercase tracking-wide">{label}</label>
      <div className="flex items-center bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl overflow-hidden focus-within:border-[#111] focus-within:bg-white transition-colors">
        <input
          autoFocus={autoFocus}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-3 text-sm text-[#111] bg-transparent focus:outline-none placeholder:text-[#BDBDBD]"
        />
        {rightSlot}
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (v: Valutatore) => void }) {
  const [mode, setMode]       = useState<"login" | "register">("login");
  const [nome, setNome]       = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  function reset() { setNome(""); setCognome(""); setEmail(""); setPass(""); setError(""); }

  const canSubmit = mode === "login"
    ? email.trim() && password
    : nome.trim() && cognome.trim() && email.trim() && password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: email.trim(), password }
        : { nome: nome.trim(), cognome: cognome.trim(), email: email.trim(), password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore. Riprova.");
      } else {
        onLogin(data as Valutatore);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F9] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 bg-[#111] rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-[#111] text-sm leading-none">HR Portal</p>
            <p className="text-xs text-[#999] mt-0.5">Lipari · Valutazione 2025</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-[#F0F0F0]">
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setMode(tab); reset(); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  mode === tab
                    ? "text-[#111] border-b-2 border-[#111] -mb-px"
                    : "text-[#999] hover:text-[#555]"
                }`}
              >
                {tab === "login" ? "Accedi" : "Registrati"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-7 space-y-4">

            {/* Nome + Cognome — solo in registrazione */}
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <AuthInput label="Nome"    value={nome}    onChange={setNome}    placeholder="Luca"     autoFocus />
                <AuthInput label="Cognome" value={cognome} onChange={setCognome} placeholder="Marchetti" />
              </div>
            )}

            <AuthInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="luca@example.com"
              autoFocus={mode === "login"}
            />

            <AuthInput
              label="Password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={setPass}
              placeholder="••••••••"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="px-3 text-[#BDBDBD] hover:text-[#555] transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {error && (
              <p className="text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full py-3 bg-[#111] text-white text-sm font-semibold rounded-xl hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Caricamento…" : mode === "login" ? "Accedi" : "Crea account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#BDBDBD] mt-6">
          Lipari · HR Portal
        </p>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function Page() {
  const [dipendenti, setDipendenti]   = useState<Dipendente[]>([]);
  const [economics, setEconomics]     = useState<Economics[]>([]);
  const [valutatori, setValutatori]   = useState<Valutatore[]>([]);
  const [valutatore, setValutatore]   = useState<Valutatore | null>(null);
  const [schedeIds, setSchedeIds]         = useState<Set<string>>(new Set());
  const [valutazioniIds, setValutazioniIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted]         = useState(false);

  const [ricerca, setRicerca]             = useState("");
  const [sedeFiltro, setSedeFiltro]       = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [formOpen, setFormOpen]       = useState(false);
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [selected, setSelected]       = useState<Dipendente | undefined>();
  const [wizardDip, setWizardDip]     = useState<Dipendente | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchAll = useCallback(async (signal?: AbortSignal) => {
    const [rDip, rEco, rVal, rSchede, rVlt] = await Promise.all([
      fetch("/api/dipendenti",  { signal }),
      fetch("/api/economics",   { signal }),
      fetch("/api/valutatori",  { signal }),
      fetch("/api/schede",      { signal }),
      fetch("/api/valutazioni", { signal }),
    ]);
    if (signal?.aborted) return;
    const [dip, eco, vlt, schede, vltArr]: [Dipendente[], Economics[], Valutatore[], SchedaRiassuntiva[], { dipendenteId: string }[]] =
      await Promise.all([rDip.json(), rEco.json(), rVal.json(), rSchede.json(), rVlt.json()]);
    setDipendenti(dip);
    setEconomics(eco);
    setValutatori(vlt);
    setSchedeIds(new Set(schede.map((s) => s.dipendenteId)));
    setValutazioniIds(new Set(vltArr.map((v) => v.dipendenteId)));
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchAll(ctrl.signal).then(() => setMounted(true));
    return () => ctrl.abort();
  }, [fetchAll]);

  // Restore valutatore from localStorage after data loads
  useEffect(() => {
    if (!mounted || valutatori.length === 0) return;
    const saved = localStorage.getItem("valutatoreId");
    if (saved) {
      const found = valutatori.find((v) => v.id === saved);
      if (found) {
        setValutatore(found);
        if (!localStorage.getItem(`onboarding_done_${found.id}`)) {
          setShowOnboarding(true);
        }
      }
    }
  }, [mounted, valutatori]);

  function selectValutatore(v: Valutatore, isNew = false) {
    localStorage.setItem("valutatoreId", v.id);
    setValutatore(v);
    if (isNew || !localStorage.getItem(`onboarding_done_${v.id}`)) {
      setShowOnboarding(true);
    }
  }

  function closeOnboarding(valutatoreId: string) {
    localStorage.setItem(`onboarding_done_${valutatoreId}`, "1");
    setShowOnboarding(false);
  }

  function changeValutatore() {
    localStorage.removeItem("valutatoreId");
    setValutatore(null);
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const dipendentiScope = (() => {
    if (!valutatore) return dipendenti;
    const directIds = new Set(valutatore.dipendentiIds);
    // Sub-valutatori: valutatori linked to one of my direct dipendenti
    const subValutatori = valutatori.filter(
      (v) => v.id !== valutatore.id && v.dipendenteId && directIds.has(v.dipendenteId)
    );
    const subIds = new Set(subValutatori.flatMap((v) => v.dipendentiIds));
    return dipendenti.filter((d) => directIds.has(d.id) || subIds.has(d.id));
  })();

  // Set of dipendente IDs that are also valutatori
  const valutatoreDipendenteIds = new Set(valutatori.map((v) => v.dipendenteId).filter(Boolean) as string[]);

  const dipendentiIds = new Set(dipendentiScope.map((d) => d.id));
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
  const sedi = Array.from(new Set(dipendentiScope.map((d) => d.sede))).sort();

  // ── Manager dipendenti (sub-valutatori in scope) ───────────────────────────
  const managerDipendenti = dipendentiScope.filter((d) => valutatoreDipendenteIds.has(d.id));

  // IDs of the selected manager's direct reports
  const selectedManagerReportIds = selectedManagerId
    ? new Set(valutatori.find((v) => v.dipendenteId === selectedManagerId)?.dipendentiIds ?? [])
    : null;

  // ── Filtri ─────────────────────────────────────────────────────────────────
  const filtrati = dipendentiScope.filter((d) => {
    if (valutatoreDipendenteIds.has(d.id)) return false; // managers shown separately
    const q = ricerca.toLowerCase();
    const matchSearch =
      d.nome.toLowerCase().includes(q) ||
      d.cognome.toLowerCase().includes(q) ||
      d.sede.toLowerCase().includes(q) ||
      d.jobprofile.toLowerCase().includes(q);
    const matchSede = !sedeFiltro || d.sede === sedeFiltro;
    const matchManager = !selectedManagerReportIds || selectedManagerReportIds.has(d.id);
    return matchSearch && matchSede && matchManager;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (data: DipendenteFormData) => {
    setLoading(true);
    const { valutatoreId: newValutatoreId, ...dipendenteData } = data;
    try {
      let dipendenteId: string;

      if (selected) {
        await fetch(`/api/dipendenti/${selected.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dipendenteData),
        });
        dipendenteId = selected.id;
        toast.success("Dipendente aggiornato");
      } else {
        const res = await fetch("/api/dipendenti", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dipendenteData),
        });
        const nuovo = await res.json();
        dipendenteId = nuovo.id;
        if (valutatore) {
          await fetch(`/api/valutatori/${valutatore.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addDipendenteId: dipendenteId }),
          });
          setValutatore({ ...valutatore, dipendentiIds: [...valutatore.dipendentiIds, dipendenteId] });
        }
        toast.success("Dipendente aggiunto");
      }

      // Handle valutatore link change
      const prevLinked = valutatori.find((v) => v.dipendenteId === dipendenteId);
      const prevValutatoreId = prevLinked?.id ?? null;
      if (newValutatoreId !== prevValutatoreId) {
        // Unlink old
        if (prevValutatoreId) {
          await fetch(`/api/valutatori/${prevValutatoreId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ setDipendenteId: null }),
          });
        }
        // Link new
        if (newValutatoreId) {
          await fetch(`/api/valutatori/${newValutatoreId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ setDipendenteId: dipendenteId }),
          });
        }
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

  const handleSaved = async () => {
    await fetchAll(undefined);
    setWizardDip(null);
    toast.success("Valutazione salvata");
  };

  // ── Loading / selector ─────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F4F5F9] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#E0E0E0] border-t-[#111] rounded-full animate-spin" />
      </div>
    );
  }

  if (!valutatore) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <LoginPage
          onLogin={(v) => {
            const isNew = !valutatori.some((x) => x.id === v.id);
            setValutatori((prev) => prev.some((x) => x.id === v.id) ? prev : [...prev, v]);
            selectValutatore(v, isNew);
          }}
        />
      </>
    );
  }

  const initials = `${valutatore.nome[0]}${valutatore.cognome[0]}`.toUpperCase();
  const completate = dipendentiScope.filter((d) => schedeIds.has(d.id) || valutazioniIds.has(d.id)).length;
  const daValutare = dipendentiScope.length - completate;
  const completatePct = dipendentiScope.length > 0 ? Math.round((completate / dipendentiScope.length) * 100) : 0;

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

          {/* Valutatore chip */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#EBEBEB]">
            <div className="w-7 h-7 rounded-lg bg-[#111] flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <span className="text-sm font-medium text-[#111]">
              {valutatore.nome} {valutatore.cognome}
            </span>
            <button
              onClick={changeValutatore}
              title="Cambia profilo"
              className="w-7 h-7 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-center text-[#999] hover:text-[#111] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowOnboarding(true)}
            title="Rivedi il wizard di benvenuto"
            className="w-8 h-8 rounded-xl hover:bg-[#F5F5F5] flex items-center justify-center text-[#BDBDBD] hover:text-[#111] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
          <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[#999]">Dipendenti</p>
              <div className="w-6 h-6 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-[#888]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#111]">{dipendentiScope.length}</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[#999]">RAL media</p>
              <div className="w-6 h-6 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                <Banknote className="w-3.5 h-3.5 text-[#888]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#111]">
              {conEco.length ? formatEur(ralMedia) : "—"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[#999]">Con aumento</p>
              <div className="w-6 h-6 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-[#888]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#111]">
              {conAumento.length}
              {conAumento.length > 0 && aumentoMedio > 0 && (
                <span className="text-sm font-normal text-[#16A34A] ml-2">+{aumentoMedio.toFixed(1)}%</span>
              )}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[#999]">Completate</p>
              <div className="w-6 h-6 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#888]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#111]">
              {completate}
              <span className="text-sm font-normal text-[#999] ml-1">/ {dipendentiScope.length}</span>
            </p>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {dipendentiScope.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-4 mt-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-medium text-[#999]">Avanzamento valutazioni</p>
              <p className="text-xs font-semibold text-[#111]">{completatePct}%</p>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#111] h-full rounded-full transition-all duration-700"
                style={{ width: `${completatePct}%` }}
              />
            </div>
            {daValutare > 0 && (
              <p className="text-xs text-[#BDBDBD] mt-2">{daValutare} {daValutare === 1 ? "dipendente ancora da valutare" : "dipendenti ancora da valutare"}</p>
            )}
          </div>
        )}

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

        {/* ── Referenti di secondo livello ── */}
        {managerDipendenti.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#999] uppercase tracking-wide">Referenti di secondo livello</p>
              {selectedManagerId && (
                <button
                  onClick={() => setSelectedManagerId(null)}
                  className="text-xs text-[#999] hover:text-[#111] transition-colors"
                >
                  ✕ Rimuovi filtro
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {managerDipendenti.map((d) => (
                <DipendenteCard
                  key={d.id}
                  dipendente={d}
                  economics={economics.find((e) => e.dipendenteId === d.id)}
                  onEdit={() => { setSelected(d); setFormOpen(true); }}
                  onDelete={() => { setSelected(d); setDeleteOpen(true); }}
                  haScheda={schedeIds.has(d.id) || valutazioniIds.has(d.id)}
                  onCreaValutazione={() => setWizardDip(d)}
                  isValutatore
                  onCardClick={() => setSelectedManagerId(selectedManagerId === d.id ? null : d.id)}
                  highlighted={selectedManagerId === d.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Separator ── */}
        {managerDipendenti.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-[#EBEBEB]" />
            <p className="text-xs font-semibold text-[#BDBDBD] uppercase tracking-wide whitespace-nowrap">
              {selectedManagerId
                ? `Team di ${managerDipendenti.find(d => d.id === selectedManagerId)?.nome ?? ""}`
                : "Tutti i dipendenti"}
            </p>
            <div className="flex-1 h-px bg-[#EBEBEB]" />
          </div>
        )}

        {/* ── Grid ── */}
        {filtrati.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            <button
              onClick={() => { setSelected(undefined); setFormOpen(true); }}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#DEDEDE] hover:border-[#BDBDBD] hover:bg-[#FAFAFA] transition-colors min-h-[140px] text-[#BDBDBD] hover:text-[#999]"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Nuovo dipendente</span>
            </button>
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
                haScheda={schedeIds.has(d.id) || valutazioniIds.has(d.id)}
                onCreaValutazione={() => setWizardDip(d)}
                isValutatore={false}
              />
            ))}
            {!ricerca && (
              <button
                onClick={() => { setSelected(undefined); setFormOpen(true); }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#DEDEDE] hover:border-[#BDBDBD] hover:bg-[#FAFAFA] transition-colors min-h-[140px] text-[#BDBDBD] hover:text-[#999]"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Nuovo dipendente</span>
              </button>
            )}
          </div>
        )}
      </div>

      <DipendenteDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        dipendente={selected}
        onSubmit={handleSubmit}
        loading={loading}
        valutatori={valutatori.filter((v) => v.id !== valutatore?.id)}
        linkedValutatoreId={selected ? (valutatori.find((v) => v.dipendenteId === selected.id)?.id ?? null) : null}
      />
      <ConfermaEliminazione
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        dipendente={selected}
        onConfirm={handleDelete}
        loading={loading}
      />

      {wizardDip && (
        <SchedaWizard
          dipendente={wizardDip}
          onClose={() => setWizardDip(null)}
          onSaved={handleSaved}
        />
      )}

      {showOnboarding && valutatore && (
        <OnboardingWizard onClose={() => closeOnboarding(valutatore.id)} />
      )}
    </div>
  );
}
