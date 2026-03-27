"use client";

import { useState } from "react";
import {
  X, Plus, Trash2, ChevronLeft, ChevronRight, Check,
  CalendarDays, Building2, User, BookOpen, Brain, TrendingUp, FileText,
} from "lucide-react";
import { DriverValutazione, SchedaRiassuntiva } from "@/types/scheda";
import { Autovalutazione } from "@/types/autovalutazione";
import { Dipendente } from "@/types/dipendente";

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  dipendente: Dipendente;
  onClose: () => void;
  onSaved: () => void;
}

type PeriodoInput = { tipoContratto: string; dataInizio: string; dataFine: string };
type PresenzaMap  = Record<number, { ufficio: number; sw: number }>;
type RispostaInput = { domanda: string; risposta: string; commento: string };
type ValClienteState = { societa: string; valutatore: string; data: string; risposte: RispostaInput[] };
type AutovalState = Omit<Autovalutazione, "dipendenteId" | "dataCompilazione">;

// ── Constants ────────────────────────────────────────────────────────────────

const TIPO_CONTRATTO = ["Tempo indeterminato", "Tempo determinato", "Stage/Tirocinio", "Partita IVA"];

const MESI_IT = ["", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
                 "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

const STEPS = [
  { label: "Staffing",       icon: CalendarDays },
  { label: "Presenze",       icon: Building2 },
  { label: "Autoval. 1/2",  icon: User },
  { label: "Autoval. 2/2",  icon: User },
  { label: "Val. Cliente",  icon: FileText },
  { label: "Scheda",        icon: BookOpen },
  { label: "Riepilogo",     icon: Check },
] as const;

// Domande valutazione cliente (ordine = indice nello SCALE)
const DOMANDE_CLIENTE: { label: string; opzioni: string[] }[] = [
  { label: "Competenze tecniche",             opzioni: ["Insufficienti","Da migliorare","Adeguate","Buone","Eccellenti"] },
  { label: "Autonomia",                       opzioni: ["Non valutabile","Poco autonomo/a","Autonomia parziale","Prevalentemente autonomo/a","Completamente autonomo/a"] },
  { label: "Affidabilità",                    opzioni: ["Mai","Raramente","Talvolta","Quasi sempre","Sempre"] },
  { label: "Comunicazione e relazione",       opzioni: ["Inefficace","Poco efficace","Adeguata","Efficace","Molto efficace"] },
  { label: "Gestione feedback e stress",      opzioni: ["In modo non adeguato","In modo poco efficace","Con qualche difficoltà","In modo adeguato","In modo molto costruttivo"] },
  { label: "Crescita delle competenze",       opzioni: ["Assente","Minima","Moderata","Significativa","Molto significativa"] },
  { label: "Gestione attività complesse",     opzioni: ["Assente","Limitata","Adeguata","Elevata","Molto elevata"] },
  { label: "Valore apportato",                opzioni: ["Non valutabile","Inferiore","In linea","Superiore","Molto superiore"] },
  { label: "Potenziale ruolo più rilevante",  opzioni: ["Decisamente no","Probabilmente no","Non chiaro","Probabilmente sì","Decisamente sì"] },
];

// ── Defaults ─────────────────────────────────────────────────────────────────

function emptyPeriodo(): PeriodoInput {
  return { tipoContratto: "Tempo indeterminato", dataInizio: "", dataFine: "" };
}
function emptyDriver(): DriverValutazione {
  return { nome: "", score: 3, commento: "" };
}
function defaultAutoval(): AutovalState {
  return {
    overview: {
      stimolante: 3,
      percezione: { performanceProgettuali: 0, rapportoLipari: 0, percorsoCrescita: 0, relazioneColleghi: 0, partecipazioneCommunity: 0 },
    },
    progetto: { crescitaSkillMatrix: 3, crescitaSkillMatrixCommento: "", raggiungimentoObiettiviProgetto: 3, soddisfazioneEsperienze: 3, soddisfazioneEsperienzeCommento: "" },
    nuovoProgetto: { staffato: false, complessitaAvvio: null, supportoRicevuto: null, strumentiDisponibili: null },
    attivitaLipari: {
      importanzaCommunity: 3,
      utileCommunity: { crescitaProfessionale: 0, comunicazioniOperative: 0, comunicazioneStrategie: 0, formazione: 0, gestioneProblematiche: 0 },
      ruoloResponsabilita: null, ruoloResponsabilitaCommento: null,
      attivitaPiuMotivante: "", raggiungimentoObiettiviLipari: 3,
    },
    equilibrio: { benessere: "", riferimentiTecnici: "", riferimentiBenessere: "" },
    sviluppoProfessionale: { puntiDiForza: "", automiglioramento: "", necessitaPotenziale: "", consapevolezzaFuturo: "", competenzeDaSviluppare: "" },
  };
}
function defaultValCliente(): ValClienteState {
  return {
    societa: "", valutatore: "", data: new Date().toISOString().split("T")[0],
    risposte: DOMANDE_CLIENTE.map((d) => ({ domanda: d.label, risposta: "", commento: "" })),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcMesi(inizio: string, fine: string): number {
  if (!inizio || !fine) return 0;
  const s = new Date(inizio), e = new Date(fine);
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
}

const SCORE_LABELS: Record<number, string> = {
  1: "Insufficiente", 1.5: "Quasi sufficiente",
  2: "Parziale",      2.5: "Parziale+",
  3: "Adeguato",      3.5: "Adeguato+",
  4: "Buono",         4.5: "Molto buono",
  5: "Eccellente",
};
function scoreColor(s: number) {
  if (s >= 4.5) return "text-[#111]";
  if (s >= 3.5) return "text-[#444]";
  if (s >= 2.5) return "text-[#666]";
  if (s >= 1.5) return "text-orange-600";
  return "text-red-500";
}

// ── Small reusable components ─────────────────────────────────────────────────

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <Icon className="w-4 h-4 text-[#999]" />
      <p className="text-sm font-semibold text-[#111]">{children}</p>
    </div>
  );
}

function QLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#444] mb-1.5">{children}</p>;
}

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`text-xl leading-none transition-colors ${n <= value ? "text-[#111]" : "text-[#E0E0E0]"} hover:text-[#111]`}>
          ★
        </button>
      ))}
    </div>
  );
}

function GridScale({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const labels = ["?", "1", "2", "3", "4", "5"];
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
            n === value ? "bg-[#111] text-white" : "bg-[#F5F5F5] text-[#666] hover:bg-[#E0E0E0]"
          }`}>
          {labels[n]}
        </button>
      ))}
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1">
      <QLabel>{label}</QLabel>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-sm bg-[#FAFAFA] border border-[#EFEFEF] rounded-xl px-3 py-2 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD]" />
    </div>
  );
}

function FieldArea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div className="space-y-1">
      <QLabel>{label}</QLabel>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full text-sm bg-[#FAFAFA] border border-[#EFEFEF] rounded-xl px-3 py-2 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD] resize-none" />
    </div>
  );
}

// ── Step: Staffing ────────────────────────────────────────────────────────────

function StepStaffing({ periodi, setPeriodi }: { periodi: PeriodoInput[]; setPeriodi: (p: PeriodoInput[]) => void }) {
  function update(i: number, p: PeriodoInput) { const n = [...periodi]; n[i] = p; setPeriodi(n); }
  function remove(i: number) { setPeriodi(periodi.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-3">
      <SectionTitle icon={CalendarDays}>Storico Staffing</SectionTitle>
      <p className="text-xs text-[#999]">Aggiungi i periodi di staffing del dipendente.</p>

      {periodi.map((p, i) => {
        const mesi = calcMesi(p.dataInizio, p.dataFine);
        return (
          <div key={i} className="border border-[#EFEFEF] rounded-2xl p-4 space-y-3 bg-[#FAFAFA]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#BDBDBD]">Periodo {i + 1}</span>
              {periodi.length > 1 && (
                <button onClick={() => remove(i)}
                  className="w-7 h-7 rounded-lg hover:bg-[#FEF2F2] flex items-center justify-center text-[#BDBDBD] hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tipo contratto */}
            <div className="space-y-1">
              <QLabel>Tipo contratto</QLabel>
              <div className="flex flex-wrap gap-1.5">
                {TIPO_CONTRATTO.map((t) => (
                  <button key={t} type="button" onClick={() => update(i, { ...p, tipoContratto: t })}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      p.tipoContratto === t ? "bg-[#111] text-white border-[#111]" : "bg-white border-[#E5E5E5] text-[#666] hover:border-[#999]"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <QLabel>Data inizio</QLabel>
                <input type="date" value={p.dataInizio} onChange={(e) => update(i, { ...p, dataInizio: e.target.value })}
                  className="w-full text-sm bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 focus:outline-none focus:border-[#999]" />
              </div>
              <div className="space-y-1">
                <QLabel>Data fine</QLabel>
                <input type="date" value={p.dataFine} onChange={(e) => update(i, { ...p, dataFine: e.target.value })}
                  className="w-full text-sm bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 focus:outline-none focus:border-[#999]" />
              </div>
            </div>

            {mesi > 0 && (
              <p className="text-xs text-[#999]">
                Durata calcolata: <span className="font-semibold text-[#111]">{mesi} {mesi === 1 ? "mese" : "mesi"}</span>
              </p>
            )}
          </div>
        );
      })}

      <button onClick={() => setPeriodi([...periodi, emptyPeriodo()])}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-[#999] hover:text-[#111] border border-dashed border-[#E0E0E0] hover:border-[#999] rounded-2xl transition-colors">
        <Plus className="w-3.5 h-3.5" /> Aggiungi periodo
      </button>
    </div>
  );
}

// ── Step: Presenze ────────────────────────────────────────────────────────────

function StepPresenze({ presenze, setPresenze }: { presenze: PresenzaMap; setPresenze: (p: PresenzaMap) => void }) {
  function update(mese: number, field: "ufficio" | "sw", val: number) {
    const existing = presenze[mese] ?? { ufficio: 0, sw: 0 };
    setPresenze({ ...presenze, [mese]: { ...existing, [field]: val } });
  }

  return (
    <div className="space-y-3">
      <SectionTitle icon={Building2}>Presenze in ufficio</SectionTitle>
      <p className="text-xs text-[#999]">Inserisci i giorni per ogni mese. Lascia a 0 i mesi non lavorati.</p>

      <div className="border border-[#EFEFEF] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_1fr_60px] gap-2 px-4 py-2 bg-[#F9F9F9] border-b border-[#EFEFEF]">
          <span className="text-xs font-semibold text-[#999]">Mese</span>
          <span className="text-xs font-semibold text-[#999]">Ufficio (gg)</span>
          <span className="text-xs font-semibold text-[#999]">Smart W. (gg)</span>
          <span className="text-xs font-semibold text-[#999] text-right">Equiv.</span>
        </div>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mese) => {
          const p   = presenze[mese] ?? { ufficio: 0, sw: 0 };
          const eq  = p.ufficio + p.sw * 0.5;
          const hasData = p.ufficio > 0 || p.sw > 0;
          return (
            <div key={mese} className={`grid grid-cols-[80px_1fr_1fr_60px] gap-2 px-4 py-2 border-b border-[#F5F5F5] last:border-0 items-center ${hasData ? "bg-white" : ""}`}>
              <span className={`text-sm font-medium ${hasData ? "text-[#111]" : "text-[#BDBDBD]"}`}>
                {MESI_IT[mese].slice(0, 3)}
              </span>
              <input type="number" min={0} max={31} value={p.ufficio || ""}
                onChange={(e) => update(mese, "ufficio", Number(e.target.value))}
                placeholder="0"
                className="w-full text-sm bg-[#F9F9F9] border border-[#EFEFEF] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#999] placeholder:text-[#D0D0D0]" />
              <input type="number" min={0} max={31} value={p.sw || ""}
                onChange={(e) => update(mese, "sw", Number(e.target.value))}
                placeholder="0"
                className="w-full text-sm bg-[#F9F9F9] border border-[#EFEFEF] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#999] placeholder:text-[#D0D0D0]" />
              <span className={`text-sm font-semibold text-right ${hasData ? "text-[#111]" : "text-[#BDBDBD]"}`}>
                {eq % 1 === 0 ? eq : eq.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step: Autovalutazione 1/2 ─────────────────────────────────────────────────

function StepAutoval1({ state, onChange }: { state: AutovalState; onChange: (s: AutovalState) => void }) {
  const set = (path: string[], val: unknown) => {
    const next = structuredClone(state) as Record<string, unknown>;
    let cur: Record<string, unknown> = next;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]] as Record<string, unknown>;
    cur[path[path.length - 1]] = val;
    onChange(next as AutovalState);
  };

  return (
    <div className="space-y-5">
      {/* Sezione 1 — Overview */}
      <div>
        <SectionTitle icon={User}>01 — Overview</SectionTitle>
        <div className="space-y-4 pl-1 mt-2">
          <div>
            <QLabel>Q3 — Quanto trovi stimolante il lavoro quest&apos;anno?</QLabel>
            <Stars value={state.overview.stimolante} onChange={(v) => set(["overview", "stimolante"], v)} />
          </div>
          <div>
            <QLabel>Q4 — Come percepisci le performance nelle seguenti aree? (0 = non so)</QLabel>
            <div className="space-y-2 mt-2">
              {[
                ["performanceProgettuali", "Performance progettuali"],
                ["rapportoLipari",         "Rapporto con Lipari"],
                ["percorsoCrescita",        "Percorso di crescita"],
                ["relazioneColleghi",       "Relazione con i colleghi"],
                ["partecipazioneCommunity", "Partecipazione alla community"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3 py-1">
                  <span className="text-xs text-[#666] flex-1">{label}</span>
                  <GridScale
                    value={(state.overview.percezione as Record<string, number>)[key]}
                    onChange={(v) => set(["overview", "percezione", key], v)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sezione 2 — Progetto */}
      <div>
        <SectionTitle icon={Brain}>02 — Progetto</SectionTitle>
        <div className="space-y-4 pl-1 mt-2">
          <div>
            <QLabel>Q5 — Crescita skill matrix nel progetto</QLabel>
            <Stars value={state.progetto.crescitaSkillMatrix} onChange={(v) => set(["progetto", "crescitaSkillMatrix"], v)} />
          </div>
          <FieldArea label="Q6 — Commento sulla crescita delle skill" value={state.progetto.crescitaSkillMatrixCommento}
            onChange={(v) => set(["progetto", "crescitaSkillMatrixCommento"], v)} placeholder="Descrivi la crescita..." />
          <div>
            <QLabel>Q7 — Raggiungimento obiettivi di progetto</QLabel>
            <Stars value={state.progetto.raggiungimentoObiettiviProgetto} onChange={(v) => set(["progetto", "raggiungimentoObiettiviProgetto"], v)} />
          </div>
          <div>
            <QLabel>Q8 — Soddisfazione delle esperienze progettuali</QLabel>
            <Stars value={state.progetto.soddisfazioneEsperienze} onChange={(v) => set(["progetto", "soddisfazioneEsperienze"], v)} />
          </div>
          <FieldArea label="Q9 — Commento sulla soddisfazione" value={state.progetto.soddisfazioneEsperienzeCommento}
            onChange={(v) => set(["progetto", "soddisfazioneEsperienzeCommento"], v)} placeholder="Commento libero..." />
        </div>
      </div>

      {/* Sezione 3 — Nuovo Progetto */}
      <div>
        <SectionTitle icon={CalendarDays}>03 — Nuovo Progetto / Cliente</SectionTitle>
        <div className="space-y-4 pl-1 mt-2">
          <div>
            <QLabel>Q10 — Il dipendente è stato staffato su un nuovo progetto quest&apos;anno?</QLabel>
            <div className="flex items-center gap-2 mt-1">
              {[true, false].map((val) => (
                <button key={String(val)} type="button" onClick={() => set(["nuovoProgetto", "staffato"], val)}
                  className={`px-4 py-2 text-sm rounded-xl border transition-colors ${
                    state.nuovoProgetto.staffato === val ? "bg-[#111] text-white border-[#111]" : "bg-white border-[#E5E5E5] text-[#666] hover:border-[#999]"
                  }`}>
                  {val ? "Sì" : "No"}
                </button>
              ))}
            </div>
          </div>
          {state.nuovoProgetto.staffato && (
            <>
              <FieldArea label="Q11 — Complessità avvio progetto" value={state.nuovoProgetto.complessitaAvvio ?? ""}
                onChange={(v) => set(["nuovoProgetto", "complessitaAvvio"], v || null)} placeholder="Come è stato l'avvio?" />
              <FieldArea label="Q12 — Supporto ricevuto" value={state.nuovoProgetto.supportoRicevuto ?? ""}
                onChange={(v) => set(["nuovoProgetto", "supportoRicevuto"], v || null)} placeholder="Che supporto hai ricevuto?" />
              <FieldArea label="Q13 — Strumenti disponibili" value={state.nuovoProgetto.strumentiDisponibili ?? ""}
                onChange={(v) => set(["nuovoProgetto", "strumentiDisponibili"], v || null)} placeholder="Strumenti e risorse a disposizione..." />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step: Autovalutazione 2/2 ─────────────────────────────────────────────────

function StepAutoval2({ state, onChange }: { state: AutovalState; onChange: (s: AutovalState) => void }) {
  const set = (path: string[], val: unknown) => {
    const next = structuredClone(state) as Record<string, unknown>;
    let cur: Record<string, unknown> = next;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]] as Record<string, unknown>;
    cur[path[path.length - 1]] = val;
    onChange(next as AutovalState);
  };

  return (
    <div className="space-y-5">
      {/* Sezione 4 — Attività Lipari */}
      <div>
        <SectionTitle icon={Building2}>04 — Attività Lipari</SectionTitle>
        <div className="space-y-4 pl-1 mt-2">
          <div>
            <QLabel>Q14 — Importanza della community Lipari per te</QLabel>
            <Stars value={state.attivitaLipari.importanzaCommunity} onChange={(v) => set(["attivitaLipari", "importanzaCommunity"], v)} />
          </div>
          <div>
            <QLabel>Q15 — Quanto è stata utile la community in questi aspetti? (0 = non so)</QLabel>
            <div className="space-y-2 mt-2">
              {[
                ["crescitaProfessionale",   "Crescita professionale"],
                ["comunicazioniOperative",  "Comunicazioni operative"],
                ["comunicazioneStrategie",  "Comunicazione delle strategie"],
                ["formazione",             "Formazione"],
                ["gestioneProblematiche",  "Gestione delle problematiche"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3 py-1">
                  <span className="text-xs text-[#666] flex-1">{label}</span>
                  <GridScale
                    value={(state.attivitaLipari.utileCommunity as Record<string, number>)[key]}
                    onChange={(v) => set(["attivitaLipari", "utileCommunity", key], v)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <QLabel>Q16 — Soddisfazione per ruolo/responsabilità in Lipari (opzionale)</QLabel>
            <div className="flex items-center gap-1">
              {[null, 1, 2, 3, 4, 5].map((n) => (
                <button key={String(n)} type="button" onClick={() => set(["attivitaLipari", "ruoloResponsabilita"], n)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    state.attivitaLipari.ruoloResponsabilita === n ? "bg-[#111] text-white" : "bg-[#F5F5F5] text-[#666] hover:bg-[#E0E0E0]"
                  }`}>
                  {n === null ? "—" : n}
                </button>
              ))}
            </div>
          </div>
          {state.attivitaLipari.ruoloResponsabilita !== null && (
            <FieldArea label="Q17 — Commento sul ruolo" value={state.attivitaLipari.ruoloResponsabilitaCommento ?? ""}
              onChange={(v) => set(["attivitaLipari", "ruoloResponsabilitaCommento"], v || null)} />
          )}
          <FieldArea label="Q18 — Attività più motivante in Lipari" value={state.attivitaLipari.attivitaPiuMotivante}
            onChange={(v) => set(["attivitaLipari", "attivitaPiuMotivante"], v)} placeholder="Cosa ti ha motivato di più?" />
          <div>
            <QLabel>Q19 — Raggiungimento obiettivi Lipari</QLabel>
            <Stars value={state.attivitaLipari.raggiungimentoObiettiviLipari} onChange={(v) => set(["attivitaLipari", "raggiungimentoObiettiviLipari"], v)} />
          </div>
        </div>
      </div>

      {/* Sezione 5 — Equilibrio */}
      <div>
        <SectionTitle icon={User}>05 — Equilibrio e benessere</SectionTitle>
        <div className="space-y-4 pl-1 mt-2">
          <FieldArea label="Q20 — Come descrivi il tuo benessere professionale quest'anno?" value={state.equilibrio.benessere}
            onChange={(v) => set(["equilibrio", "benessere"], v)} placeholder="Buono, discreto, difficile..." />
          <FieldArea label="Q21 — A chi ti rivolgi per riferimenti tecnici?" value={state.equilibrio.riferimentiTecnici}
            onChange={(v) => set(["equilibrio", "riferimentiTecnici"], v)} placeholder="Colleghi, responsabile..." />
          <FieldArea label="Q22 — A chi ti rivolgi per il benessere in azienda?" value={state.equilibrio.riferimentiBenessere}
            onChange={(v) => set(["equilibrio", "riferimentiBenessere"], v)} placeholder="HR, responsabile..." />
        </div>
      </div>

      {/* Sezione 6 — Sviluppo */}
      <div>
        <SectionTitle icon={TrendingUp}>06 — Sviluppo Professionale</SectionTitle>
        <div className="space-y-4 pl-1 mt-2">
          <FieldArea label="Q23 — Punti di forza" value={state.sviluppoProfessionale.puntiDiForza}
            onChange={(v) => set(["sviluppoProfessionale", "puntiDiForza"], v)} placeholder="Quali sono i tuoi punti di forza?" />
          <FieldArea label="Q24 — Aree di miglioramento" value={state.sviluppoProfessionale.automiglioramento}
            onChange={(v) => set(["sviluppoProfessionale", "automiglioramento"], v)} placeholder="Su cosa vuoi migliorare?" />
          <FieldArea label="Q25 — Necessità e potenziale" value={state.sviluppoProfessionale.necessitaPotenziale}
            onChange={(v) => set(["sviluppoProfessionale", "necessitaPotenziale"], v)} placeholder="Quali esigenze hai?" />
          <FieldArea label="Q26 — Consapevolezza del futuro" value={state.sviluppoProfessionale.consapevolezzaFuturo}
            onChange={(v) => set(["sviluppoProfessionale", "consapevolezzaFuturo"], v)} placeholder="Come vedi il tuo percorso?" />
          <FieldArea label="Q27 — Competenze da sviluppare" value={state.sviluppoProfessionale.competenzeDaSviluppare}
            onChange={(v) => set(["sviluppoProfessionale", "competenzeDaSviluppare"], v)} placeholder="Cosa vuoi imparare?" />
        </div>
      </div>
    </div>
  );
}

// ── Step: Valutazione Cliente ─────────────────────────────────────────────────

function StepValCliente({ state, onChange }: { state: ValClienteState; onChange: (s: ValClienteState) => void }) {
  function setRisposta(i: number, field: "risposta" | "commento", val: string) {
    const next = { ...state, risposte: [...state.risposte] };
    next.risposte[i] = { ...next.risposte[i], [field]: val };
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <SectionTitle icon={FileText}>Valutazione Cliente</SectionTitle>

      <div className="grid grid-cols-2 gap-3">
        <FieldInput label="Società" value={state.societa} onChange={(v) => onChange({ ...state, societa: v })} placeholder="Nome azienda cliente" />
        <FieldInput label="Valutatore" value={state.valutatore} onChange={(v) => onChange({ ...state, valutatore: v })} placeholder="Nome referente" />
      </div>
      <FieldInput label="Data valutazione" type="date" value={state.data} onChange={(v) => onChange({ ...state, data: v })} />

      <div className="space-y-3 pt-2">
        {DOMANDE_CLIENTE.map((d, i) => (
          <div key={i} className="border border-[#EFEFEF] rounded-2xl p-4 space-y-2 bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#1A1A1A]">{d.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {d.opzioni.map((opt) => (
                <button key={opt} type="button" onClick={() => setRisposta(i, "risposta", opt)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                    state.risposte[i]?.risposta === opt
                      ? "bg-[#111] text-white border-[#111]"
                      : "bg-white border-[#E5E5E5] text-[#666] hover:border-[#999]"
                  }`}>
                  {opt}
                </button>
              ))}
            </div>
            <input type="text" value={state.risposte[i]?.commento ?? ""} onChange={(e) => setRisposta(i, "commento", e.target.value)}
              placeholder="Commento (opzionale)..."
              className="w-full text-xs bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step: Scheda Riassuntiva ───────────────────────────────────────────────────

function DriverEditor({ driver, index, onChange, onRemove }: {
  driver: DriverValutazione; index: number;
  onChange: (d: DriverValutazione) => void; onRemove: () => void;
}) {
  return (
    <div className="border border-[#EFEFEF] rounded-2xl p-4 space-y-3 bg-[#FAFAFA]">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[#BDBDBD] w-5 shrink-0">{index + 1}.</span>
        <input type="text" placeholder="Nome competenza" value={driver.nome}
          onChange={(e) => onChange({ ...driver, nome: e.target.value })}
          className="flex-1 text-sm bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD]" />
        <button onClick={onRemove}
          className="w-8 h-8 rounded-lg hover:bg-[#FEF2F2] flex items-center justify-center text-[#BDBDBD] hover:text-red-500 transition-colors shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-[#BDBDBD] w-10 shrink-0">Score</span>
        <input type="range" min={1} max={5} step={0.5} value={driver.score}
          onChange={(e) => onChange({ ...driver, score: Number(e.target.value) })}
          className="flex-1 accent-[#111] cursor-pointer" />
        <span className={`text-sm font-bold w-6 text-right shrink-0 ${scoreColor(driver.score)}`}>
          {driver.score % 1 === 0 ? `${driver.score}` : driver.score}
        </span>
      </div>
      <p className="text-xs text-[#BDBDBD] text-right pr-1">{SCORE_LABELS[driver.score]}</p>
      <textarea placeholder="Commento..." value={driver.commento}
        onChange={(e) => onChange({ ...driver, commento: e.target.value })}
        rows={3} className="w-full text-sm bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD] resize-none" />
    </div>
  );
}

function StepScheda({ hardSkill, setHardSkill, softSkill, setSoftSkill, crescita, setCrescita }: {
  hardSkill: DriverValutazione[]; setHardSkill: (d: DriverValutazione[]) => void;
  softSkill: DriverValutazione[]; setSoftSkill: (d: DriverValutazione[]) => void;
  crescita: string; setCrescita: (s: string) => void;
}) {
  function updateDriver(list: DriverValutazione[], setList: (l: DriverValutazione[]) => void, idx: number, d: DriverValutazione) {
    const n = [...list]; n[idx] = d; setList(n);
  }

  return (
    <div className="space-y-5">
      {/* Hard Skill */}
      <div>
        <SectionTitle icon={BookOpen}>Hard Skill</SectionTitle>
        <div className="space-y-3 mt-2">
          {hardSkill.map((d, i) => (
            <DriverEditor key={i} driver={d} index={i}
              onChange={(nd) => updateDriver(hardSkill, setHardSkill, i, nd)}
              onRemove={() => setHardSkill(hardSkill.filter((_, x) => x !== i))} />
          ))}
          <button onClick={() => setHardSkill([...hardSkill, emptyDriver()])}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-[#999] hover:text-[#111] border border-dashed border-[#E0E0E0] hover:border-[#999] rounded-2xl transition-colors">
            <Plus className="w-3.5 h-3.5" /> Aggiungi hard skill
          </button>
        </div>
      </div>

      {/* Soft Skill */}
      <div>
        <SectionTitle icon={Brain}>Soft Skill</SectionTitle>
        <div className="space-y-3 mt-2">
          {softSkill.map((d, i) => (
            <DriverEditor key={i} driver={d} index={i}
              onChange={(nd) => updateDriver(softSkill, setSoftSkill, i, nd)}
              onRemove={() => setSoftSkill(softSkill.filter((_, x) => x !== i))} />
          ))}
          <button onClick={() => setSoftSkill([...softSkill, emptyDriver()])}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-[#999] hover:text-[#111] border border-dashed border-[#E0E0E0] hover:border-[#999] rounded-2xl transition-colors">
            <Plus className="w-3.5 h-3.5" /> Aggiungi soft skill
          </button>
        </div>
      </div>

      {/* Crescita */}
      <div>
        <SectionTitle icon={TrendingUp}>Crescita & Knowledge</SectionTitle>
        <div className="mt-2">
          <textarea value={crescita} onChange={(e) => setCrescita(e.target.value)}
            placeholder="Nel corso dell'anno il dipendente ha..." rows={5}
            className="w-full text-sm bg-[#FAFAFA] border border-[#EFEFEF] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD] resize-none" />
        </div>
      </div>
    </div>
  );
}

// ── Step: Riepilogo ───────────────────────────────────────────────────────────

function StepRiepilogo({ periodi, presenze, autoval, valCliente, hardSkill, softSkill, crescita }: {
  periodi: PeriodoInput[]; presenze: PresenzaMap;
  autoval: AutovalState; valCliente: ValClienteState;
  hardSkill: DriverValutazione[]; softSkill: DriverValutazione[]; crescita: string;
}) {
  const totMesi   = periodi.reduce((s, p) => s + calcMesi(p.dataInizio, p.dataFine), 0);
  const mesiConPresenze = Object.values(presenze).filter((p) => p.ufficio > 0 || p.sw > 0).length;
  const risposteCompilate = valCliente.risposte.filter((r) => r.risposta).length;

  function Row({ label, value }: { label: string; value: string }) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
        <span className="text-xs text-[#999]">{label}</span>
        <span className="text-xs font-semibold text-[#111]">{value}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SectionTitle icon={Check}>Riepilogo valutazione</SectionTitle>
      <p className="text-xs text-[#999]">Tutto pronto. Verifica i dati e clicca &quot;Salva tutto&quot; per completare.</p>

      <div className="border border-[#EFEFEF] rounded-2xl p-4 bg-[#FAFAFA] space-y-0">
        <Row label="Periodi staffing" value={`${periodi.length} periodo${periodi.length !== 1 ? "i" : ""} · ${totMesi} mesi`} />
        <Row label="Presenze" value={`${mesiConPresenze} mesi registrati`} />
        <Row label="Autovalutazione" value="Compilata" />
        <Row label="Val. cliente" value={`${valCliente.societa || "—"} · ${risposteCompilate}/9 risposte`} />
        <Row label="Hard skill" value={`${hardSkill.filter((d) => d.nome).length} competenze`} />
        <Row label="Soft skill" value={`${softSkill.filter((d) => d.nome).length} competenze`} />
        <Row label="Crescita & knowledge" value={crescita.trim() ? "Compilata" : "Non compilata"} />
      </div>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export default function SchedaWizard({ dipendente, onClose, onSaved }: Props) {
  const [step, setStep] = useState(0);

  // State per ogni sezione
  const [periodi,    setPeriodi]    = useState<PeriodoInput[]>([emptyPeriodo()]);
  const [presenze,   setPresenze]   = useState<PresenzaMap>({});
  const [autoval,    setAutoval]    = useState<AutovalState>(defaultAutoval());
  const [valCliente, setValCliente] = useState<ValClienteState>(defaultValCliente());
  const [hardSkill,  setHardSkill]  = useState<DriverValutazione[]>([emptyDriver()]);
  const [softSkill,  setSoftSkill]  = useState<DriverValutazione[]>([emptyDriver()]);
  const [crescita,   setCrescita]   = useState("");
  const [saving,     setSaving]     = useState(false);

  const initials = `${dipendente.nome[0]}${dipendente.cognome[0]}`.toUpperCase();

  // Validazione per "Avanti"
  const canNext =
    step === 0 ? periodi.length > 0 && periodi.every((p) => p.dataInizio && p.dataFine) :
    step === 4 ? valCliente.societa.trim() !== "" && valCliente.valutatore.trim() !== "" :
    step === 5 ? hardSkill.some((d) => d.nome.trim()) && softSkill.some((d) => d.nome.trim()) :
    true;

  async function handleSave() {
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // Build staffing payload
      const staffingPayload = {
        dipendenteId: dipendente.id,
        periodi: periodi.map((p) => ({
          tipoContratto: p.tipoContratto,
          dataInizio: p.dataInizio,
          dataFine: p.dataFine,
          mesi: calcMesi(p.dataInizio, p.dataFine),
        })),
        presenze: Object.entries(presenze)
          .filter(([, v]) => v.ufficio > 0 || v.sw > 0)
          .map(([mese, v]) => ({
            mese: Number(mese),
            giorniUfficio: v.ufficio,
            giorniSmartWorking: v.sw,
            giorniEquivalenti: v.ufficio + v.sw * 0.5,
          }))
          .sort((a, b) => a.mese - b.mese),
      };

      // Build autovalutazione payload
      const autovalPayload: Autovalutazione = {
        dipendenteId: dipendente.id,
        dataCompilazione: today,
        ...autoval,
      };

      // Build valutazione cliente payload (only if risposta filled)
      const valClientePayload = {
        dipendenteId: dipendente.id,
        formId: Date.now(),
        data: valCliente.data,
        valutatore: valCliente.valutatore,
        societa: valCliente.societa,
        risposte: valCliente.risposte,
      };

      // Build scheda payload
      const schedaPayload: SchedaRiassuntiva = {
        dipendenteId: dipendente.id,
        hardSkill: hardSkill.filter((d) => d.nome.trim()),
        softSkill: softSkill.filter((d) => d.nome.trim()),
        crescitaKnowledge: crescita.trim() ? { commento: crescita.trim() } : null,
      };

      await Promise.all([
        fetch("/api/staffing",       { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(staffingPayload) }),
        fetch("/api/autovalutazione", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(autovalPayload) }),
        fetch("/api/valutazioni",    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(valClientePayload) }),
        fetch("/api/schede",         { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(schedaPayload) }),
      ]);

      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#EFEFEF] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F0F0F0] flex items-center justify-center text-xs font-bold text-[#1A1A1A]">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111]">{dipendente.nome} {dipendente.cognome}</p>
              <p className="text-xs text-[#999]">Nuova valutazione completa</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-center text-[#999] hover:text-[#111] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-[#F5F5F5] shrink-0 overflow-x-auto">
          {STEPS.map(({ label }, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <button onClick={() => i < step && setStep(i)} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? "bg-[#111] text-white cursor-pointer" : i === step ? "bg-[#111] text-white" : "bg-[#F0F0F0] text-[#BDBDBD]"
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap hidden sm:block ${i === step ? "text-[#111]" : i < step ? "text-[#666]" : "text-[#BDBDBD]"}`}>
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-4 h-px mx-1.5 ${i < step ? "bg-[#111]" : "bg-[#EFEFEF]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && <StepStaffing periodi={periodi} setPeriodi={setPeriodi} />}
          {step === 1 && <StepPresenze presenze={presenze} setPresenze={setPresenze} />}
          {step === 2 && <StepAutoval1 state={autoval} onChange={setAutoval} />}
          {step === 3 && <StepAutoval2 state={autoval} onChange={setAutoval} />}
          {step === 4 && <StepValCliente state={valCliente} onChange={setValCliente} />}
          {step === 5 && (
            <StepScheda
              hardSkill={hardSkill} setHardSkill={setHardSkill}
              softSkill={softSkill}  setSoftSkill={setSoftSkill}
              crescita={crescita}    setCrescita={setCrescita}
            />
          )}
          {step === 6 && (
            <StepRiepilogo
              periodi={periodi} presenze={presenze}
              autoval={autoval} valCliente={valCliente}
              hardSkill={hardSkill} softSkill={softSkill} crescita={crescita}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F5F5F5] shrink-0">
          <button onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#111] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Annulla" : "Indietro"}
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext}
              className="flex items-center gap-1.5 bg-[#111] hover:bg-[#333] disabled:bg-[#E0E0E0] disabled:text-[#BDBDBD] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
              Avanti <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 bg-[#111] hover:bg-[#333] disabled:bg-[#E0E0E0] disabled:text-[#BDBDBD] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
              {saving ? "Salvataggio..." : "Salva tutto"}
              {!saving && <Check className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
