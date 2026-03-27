"use client";

import { useEffect, useState } from "react";
import { SchedaRiassuntiva, DriverValutazione, PerformanceDriver } from "@/types/scheda";
import { BookOpen, Brain, TrendingUp, Plus, Trash2, Check, Pencil, X, LayoutTemplate, BarChart2 } from "lucide-react";

interface Props {
  dipendenteId: string;
  isEditing?: boolean;
}

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreColors(s: number) {
  if (s >= 4.5) return { bar: "bg-[#111]",      text: "text-[#111]",      bg: "bg-[#111] text-white" };
  if (s >= 3.5) return { bar: "bg-[#555]",      text: "text-[#444]",      bg: "bg-[#EBEBEB] text-[#222]" };
  if (s >= 2.5) return { bar: "bg-[#BDBDBD]",   text: "text-[#666]",      bg: "bg-[#F5F5F5] text-[#666]" };
  if (s >= 1.5) return { bar: "bg-orange-400",  text: "text-orange-700",  bg: "bg-[#FFF7ED] text-orange-700" };
  return               { bar: "bg-red-400",     text: "text-red-600",     bg: "bg-[#FEF2F2] text-red-600" };
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 5) * 100;
  const c   = scoreColors(score);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold w-8 text-right ${c.text}`}>
        {score % 1 === 0 ? `${score}.0` : score}
      </span>
    </div>
  );
}

function sectionAvg(drivers: DriverValutazione[]) {
  if (!drivers.length) return 0;
  return drivers.reduce((a, b) => a + b.score, 0) / drivers.length;
}

// ─── DriverCard ───────────────────────────────────────────────────────────────

function DriverCard({ driver }: { driver: DriverValutazione }) {
  const c = scoreColors(driver.score);
  return (
    <div className="rounded-xl border border-[#F0F0F0] bg-[#FAFAFA] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">{driver.nome}</p>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${c.bg}`}>
          {driver.score % 1 === 0 ? `${driver.score}.0` : driver.score} / 5
        </span>
      </div>
      <ScoreBar score={driver.score} />
      {driver.commento && (
        <p className="text-sm text-[#666] leading-relaxed pt-2 border-t border-[#EBEBEB]">
          {driver.commento}
        </p>
      )}
    </div>
  );
}

// ─── SectionBlock ─────────────────────────────────────────────────────────────

function SectionBlock({
  title,
  icon,
  drivers,
}: {
  title: string;
  icon: React.ReactNode;
  drivers: DriverValutazione[];
}) {
  const avg    = sectionAvg(drivers);
  const colors = scoreColors(avg);

  return (
    <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
            {icon}
          </div>
          <p className="font-semibold text-[#1A1A1A] text-sm">{title}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.bg}`}>
          media {avg.toFixed(1)} / 5
        </span>
      </div>

      {/* Drivers */}
      <div className="p-5 space-y-3">
        {drivers.map((d) => (
          <DriverCard key={d.nome} driver={d} />
        ))}
      </div>
    </div>
  );
}

// ─── Star picker ──────────────────────────────────────────────────────────────

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const full = display >= n;
        const half = !full && display >= n - 0.5;
        return (
          <div key={n} className="relative w-6 h-6" onMouseLeave={() => setHovered(null)}>
            {/* empty star base */}
            <svg className="absolute inset-0 w-6 h-6 text-[#DCDCDC]" viewBox="0 0 20 20" fill="currentColor">
              <path d={STAR_PATH} />
            </svg>
            {/* filled overlay: full or left-half clipped */}
            {(full || half) && (
              <svg
                className="absolute inset-0 w-6 h-6 text-[#111]"
                viewBox="0 0 20 20"
                fill="currentColor"
                style={half ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              >
                <path d={STAR_PATH} />
              </svg>
            )}
            {/* left half → 0.5 */}
            <button
              type="button"
              className="absolute left-0 top-0 w-1/2 h-full"
              onMouseEnter={() => setHovered(n - 0.5)}
              onClick={() => onChange(n - 0.5)}
            />
            {/* right half → 1.0 */}
            <button
              type="button"
              className="absolute right-0 top-0 w-1/2 h-full"
              onMouseEnter={() => setHovered(n)}
              onClick={() => onChange(n)}
            />
          </div>
        );
      })}
      <span className={`ml-0.5 text-xs font-bold tabular-nums ${value > 0 ? "text-[#555]" : "text-[#BDBDBD]"}`}>
        {value > 0 ? `${value} / 5` : "—"}
      </span>
    </div>
  );
}

// ─── Driver editor ────────────────────────────────────────────────────────────

const CATEGORIE_SOFT = [
  "skill personali",
  "skill relazionali",
  "skill organizzative",
  "skill di leadership",
  "skill di pensiero",
] as const;

function DriverEditor({
  drivers,
  onChange,
  showCategoria = false,
}: {
  drivers: DriverValutazione[];
  onChange: (d: DriverValutazione[]) => void;
  showCategoria?: boolean;
}) {
  function update(i: number, field: keyof DriverValutazione, val: string | number) {
    onChange(drivers.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  }
  function add() {
    onChange([...drivers, { nome: "", score: 3, commento: "" }]);
  }
  function remove(i: number) {
    onChange(drivers.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {drivers.map((d, i) => (
        <div key={i} className="bg-[#FAFAFA] rounded-xl border border-[#EFEFEF] p-4 space-y-3">
          <div className="flex items-start gap-2">
            <input
              type="text"
              value={d.nome}
              onChange={(e) => update(i, "nome", e.target.value)}
              placeholder="Nome driver"
              className="flex-1 text-sm font-semibold text-[#111] bg-white border border-[#E5E5E5] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#111] transition-colors"
            />
            <button onClick={() => remove(i)} className="mt-1.5 text-[#BDBDBD] hover:text-red-400 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <StarPicker value={d.score} onChange={(v) => update(i, "score", v)} />
          {showCategoria && (
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIE_SOFT.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => update(i, "categoria", cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    d.categoria === cat
                      ? "bg-[#111] text-white border-[#111]"
                      : "border-[#E5E5E5] text-[#555] hover:border-[#999]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <textarea
            value={d.commento}
            onChange={(e) => update(i, "commento", e.target.value)}
            placeholder="Commento (facoltativo)"
            rows={2}
            className="w-full text-sm text-[#666] bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 resize-none placeholder:text-[#BDBDBD] focus:outline-none focus:border-[#111] transition-colors"
          />
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#555] bg-[#F5F5F5] rounded-lg hover:bg-[#EBEBEB] transition-colors"
      >
        <Plus className="w-3 h-3" />
        Aggiungi driver
      </button>
    </div>
  );
}

// ─── Performance editor ───────────────────────────────────────────────────────

function PerformanceEditor({
  drivers,
  onChange,
}: {
  drivers: PerformanceDriver[];
  onChange: (d: PerformanceDriver[]) => void;
}) {
  function update(i: number, field: keyof PerformanceDriver, val: string | number | null) {
    onChange(drivers.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  }
  function add() {
    onChange([...drivers, { nome: "", percentuale: null, commento: "" }]);
  }
  function remove(i: number) {
    onChange(drivers.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {drivers.map((d, i) => (
        <div key={i} className="bg-[#FAFAFA] rounded-xl border border-[#EFEFEF] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={d.nome}
              onChange={(e) => update(i, "nome", e.target.value)}
              placeholder="Es. Performance progettuali (peso 50%)"
              className="flex-1 text-sm font-semibold text-[#111] bg-white border border-[#E5E5E5] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#111] transition-colors"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={0}
                max={100}
                value={d.percentuale ?? ""}
                onChange={(e) => update(i, "percentuale", e.target.value === "" ? null : Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                placeholder="—"
                className="w-16 text-sm font-bold text-center text-[#111] bg-white border border-[#E5E5E5] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#111] transition-colors"
              />
              <span className="text-sm text-[#999]">%</span>
            </div>
            <button onClick={() => remove(i)} className="text-[#BDBDBD] hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={d.commento}
            onChange={(e) => update(i, "commento", e.target.value)}
            placeholder="Commento (facoltativo)"
            rows={2}
            className="w-full text-sm text-[#666] bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 resize-none placeholder:text-[#BDBDBD] focus:outline-none focus:border-[#111] transition-colors"
          />
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#555] bg-[#F5F5F5] rounded-lg hover:bg-[#EBEBEB] transition-colors"
      >
        <Plus className="w-3 h-3" />
        Aggiungi driver
      </button>
    </div>
  );
}

// ─── Templates ────────────────────────────────────────────────────────────────

const PERF_JC: PerformanceDriver[] = [
  { nome: "Partecipazione alla vita aziendale (peso 25%)", percentuale: null, commento: "" },
  { nome: "Performance progettuali (peso 50%)",            percentuale: null, commento: "" },
];
const PERF_SC: PerformanceDriver[] = [
  { nome: "Performance progettuali (peso 25%)",            percentuale: null, commento: "" },
  { nome: "Partecipazione alla vita aziendale (peso 50%)", percentuale: null, commento: "" },
];
const PERF_LEAD: PerformanceDriver[] = [
  { nome: "Performance di BU (peso 25%)",       percentuale: null, commento: "" },
  { nome: "Performance personali (peso 50%)",   percentuale: null, commento: "" },
];

const SCHEDA_TEMPLATES = [
  {
    id: "junior-consultant",
    label: "Junior / Consultant",
    hardSkill: [
      { nome: "Competenze Professionali", score: 3, commento: "" },
      { nome: "Competenze Tecniche",      score: 3, commento: "" },
    ],
    softSkill: [
      { nome: "Gestione dello Stress", score: 3, commento: "", categoria: "skill personali" },
      { nome: "Comunicazione Chiara",  score: 3, commento: "", categoria: "skill relazionali" },
      { nome: "Efficacia Personale",   score: 3, commento: "", categoria: "skill organizzative" },
      { nome: "Ascolto Attivo",        score: 3, commento: "", categoria: "skill di leadership" },
      { nome: "Problem Solving",       score: 3, commento: "", categoria: "skill di pensiero" },
    ],
    performance: PERF_JC,
  },
  {
    id: "senior-consultant",
    label: "Senior Consultant",
    hardSkill: [
      { nome: "Competenze Professionali", score: 3, commento: "" },
      { nome: "Competenze Tecniche",      score: 3, commento: "" },
      { nome: "Aggiornamento continuo",   score: 3, commento: "" },
    ],
    softSkill: [
      { nome: "Resilienza",                score: 3, commento: "", categoria: "skill personali" },
      { nome: "Comunicazione Efficace",    score: 3, commento: "", categoria: "skill relazionali" },
      { nome: "Orientamento al Risultato", score: 3, commento: "", categoria: "skill organizzative" },
      { nome: "Gestione del Feedback",     score: 3, commento: "", categoria: "skill di leadership" },
      { nome: "Visione d'Insieme",         score: 3, commento: "", categoria: "skill di pensiero" },
    ],
    performance: PERF_SC,
  },
  {
    id: "senior-consultant-polo",
    label: "Senior Consultant — Referente Polo",
    hardSkill: [
      { nome: "Competenze Professionali", score: 3, commento: "" },
      { nome: "Competenze Tecniche",      score: 3, commento: "" },
      { nome: "Aggiornamento continuo",   score: 3, commento: "" },
    ],
    softSkill: [
      { nome: "Resilienza",                score: 3, commento: "", categoria: "skill personali" },
      { nome: "Comunicazione Efficace",    score: 3, commento: "", categoria: "skill relazionali" },
      { nome: "Orientamento al Risultato", score: 3, commento: "", categoria: "skill organizzative" },
      { nome: "Gestione del Feedback",     score: 3, commento: "", categoria: "skill di leadership" },
      { nome: "Visione d'Insieme",         score: 3, commento: "", categoria: "skill di pensiero" },
    ],
    performance: PERF_SC,
  },
  {
    id: "senior-consultant-ref-polo",
    label: "Senior Consultant — Ref. II livello + Polo",
    hardSkill: [
      { nome: "Competenze Professionali", score: 3, commento: "" },
      { nome: "Competenze Tecniche",      score: 3, commento: "" },
      { nome: "Aggiornamento continuo",   score: 3, commento: "" },
    ],
    softSkill: [
      { nome: "Resilienza",                score: 3, commento: "", categoria: "skill personali" },
      { nome: "Comunicazione Efficace",    score: 3, commento: "", categoria: "skill relazionali" },
      { nome: "Orientamento al Risultato", score: 3, commento: "", categoria: "skill organizzative" },
      { nome: "Gestione del Feedback",     score: 3, commento: "", categoria: "skill di leadership" },
      { nome: "Visione d'Insieme",         score: 3, commento: "", categoria: "skill di pensiero" },
    ],
    performance: PERF_SC,
  },
  {
    id: "lead",
    label: "Lead / Ref. II livello",
    hardSkill: [
      { nome: "Competenze Professionali", score: 3, commento: "" },
      { nome: "Sviluppo Know-How",        score: 3, commento: "" },
      { nome: "Aggiornamento continuo",   score: 3, commento: "" },
    ],
    softSkill: [
      { nome: "Resilienza",                score: 3, commento: "", categoria: "skill personali" },
      { nome: "Comunicazione Efficace",    score: 3, commento: "", categoria: "skill relazionali" },
      { nome: "Orientamento al Risultato", score: 3, commento: "", categoria: "skill organizzative" },
      { nome: "Gestione del Feedback",     score: 3, commento: "", categoria: "skill di leadership" },
      { nome: "Visione d'Insieme",         score: 3, commento: "", categoria: "skill di pensiero" },
    ],
    performance: PERF_LEAD,
  },
];

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateSchedaForm({
  dipendenteId,
  initialData,
  onSaved,
  onCancel,
}: {
  dipendenteId: string;
  initialData?: SchedaRiassuntiva;
  onSaved: (s: SchedaRiassuntiva) => void;
  onCancel?: () => void;
}) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(initialData?.templateId ?? null);
  const [hardSkill, setHardSkill] = useState<DriverValutazione[]>(
    initialData?.hardSkill?.length ? initialData.hardSkill : [{ nome: "", score: 3, commento: "" }]
  );
  const [softSkill, setSoftSkill] = useState<DriverValutazione[]>(
    initialData?.softSkill?.length ? initialData.softSkill : [{ nome: "", score: 3, commento: "" }]
  );
  const [performance, setPerformance] = useState<PerformanceDriver[]>(
    initialData?.performance?.length ? initialData.performance : [{ nome: "", percentuale: null, commento: "" }]
  );
  const [crescitaCommento, setCrescitaCommento] = useState(initialData?.crescitaKnowledge?.commento ?? "");
  const [saving, setSaving] = useState(false);

  function applyTemplate(tpl: typeof SCHEDA_TEMPLATES[number]) {
    setHardSkill(tpl.hardSkill.map((d) => ({ ...d })));
    setSoftSkill(tpl.softSkill.map((d) => ({ ...d })));
    setPerformance(tpl.performance.map((d) => ({ ...d })));
    setActiveTemplate(tpl.id);
  }

  async function save() {
    setSaving(true);
    try {
      const body: SchedaRiassuntiva = {
        dipendenteId,
        templateId: activeTemplate ?? undefined,
        hardSkill: hardSkill.filter((d) => d.nome),
        softSkill: softSkill.filter((d) => d.nome),
        crescitaKnowledge: crescitaCommento ? { commento: crescitaCommento } : null,
        performance: performance.filter((d) => d.nome),
      };
      const res = await fetch("/api/schede", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const saved = await res.json();
        onSaved(saved);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">

      {/* ── Template selector ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1A1A1A] text-sm">Template di riferimento</p>
            <p className="text-xs text-[#999] mt-0.5">Pre-popola i driver in base al profilo</p>
          </div>
          {!activeTemplate && (
            <span className="text-[10px] font-semibold text-[#E55] bg-[#FFF0F0] border border-[#FECACA] px-2 py-0.5 rounded-full shrink-0">
              Obbligatorio
            </span>
          )}
        </div>
        <div className="px-5 py-4 flex flex-wrap gap-2">
          {SCHEDA_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                activeTemplate === tpl.id
                  ? "bg-[#111] text-white border-[#111]"
                  : "border-[#E5E5E5] text-[#555] hover:border-[#999] hover:text-[#111]"
              }`}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="font-semibold text-[#1A1A1A] text-sm">Hard Skill</p>
        </div>
        <div className="p-5">
          <DriverEditor drivers={hardSkill} onChange={setHardSkill} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
            <Brain className="w-4 h-4" />
          </div>
          <p className="font-semibold text-[#1A1A1A] text-sm">Soft Skill</p>
        </div>
        <div className="p-5">
          <DriverEditor drivers={softSkill} onChange={setSoftSkill} showCategoria />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="font-semibold text-[#1A1A1A] text-sm">Crescita Knowledge</p>
        </div>
        <div className="px-6 py-5">
          <textarea
            value={crescitaCommento}
            onChange={(e) => setCrescitaCommento(e.target.value)}
            placeholder="Commento sulla crescita knowledge (facoltativo)"
            rows={3}
            className="w-full text-sm text-[#1A1A1A] bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-3 py-2.5 resize-none placeholder:text-[#BDBDBD] focus:outline-none focus:border-[#111] transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1A1A] text-sm">Performance</p>
            <p className="text-xs text-[#999] mt-0.5">Driver personali con % raggiungimento</p>
          </div>
        </div>
        <div className="p-5">
          <PerformanceEditor drivers={performance} onChange={setPerformance} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 mt-2 border-t border-[#F0F0F0]">
        <button
          onClick={save}
          disabled={saving || !activeTemplate}
          title={!activeTemplate ? "Seleziona prima un template di riferimento" : undefined}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#111] text-white text-sm font-semibold rounded-xl hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-3.5 h-3.5" />
          {saving ? "Salvataggio…" : "Salva scheda"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-[#555] bg-white border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Annulla
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SchedaRiassuntivaTab({ dipendenteId, isEditing }: Props) {
  const [scheda, setScheda]   = useState<SchedaRiassuntiva | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch(`/api/schede?dipendenteId=${dipendenteId}`)
      .then((r) => r.json())
      .then(setScheda)
      .finally(() => setLoading(false));
  }, [dipendenteId]);

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  if (editing || (isEditing && !scheda)) {
    return (
      <CreateSchedaForm
        dipendenteId={dipendenteId}
        initialData={scheda ?? undefined}
        onSaved={(saved) => { setScheda(saved); setEditing(false); }}
        onCancel={scheda ? () => setEditing(false) : undefined}
      />
    );
  }

  if (!scheda) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFEFEF] p-8 flex flex-col items-center justify-center min-h-52 text-center gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1A1A1A]">Scheda riassuntiva non disponibile</p>
          <p className="text-xs text-[#999] mt-1">Non è ancora stata compilata nessuna scheda</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#444] bg-white border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Inserisci scheda riassuntiva
        </button>
      </div>
    );
  }

  const allDrivers = [...scheda.hardSkill, ...scheda.softSkill];
  const globalAvg  = allDrivers.length
    ? allDrivers.reduce((a, b) => a + b.score, 0) / allDrivers.length
    : null;
  const globalColors = globalAvg !== null ? scoreColors(globalAvg) : null;

  return (
    <div className="space-y-4">

      {/* Global score banner */}
      {globalAvg !== null && globalColors && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-0.5">Punteggio complessivo</p>
            <p className="text-sm text-[#666]">{allDrivers.length} driver valutati</p>
            {scheda.templateId && (() => {
              const tpl = SCHEDA_TEMPLATES.find((t) => t.id === scheda.templateId);
              return tpl ? (
                <div className="flex items-center gap-1.5 mt-2">
                  <LayoutTemplate className="w-3 h-3 text-[#999]" />
                  <span className="text-xs text-[#999]">{tpl.label}</span>
                </div>
              ) : null;
            })()}
          </div>
          <div className="flex items-end gap-1">
            <span className={`text-5xl font-bold leading-none ${globalColors.text}`}>
              {globalAvg.toFixed(1)}
            </span>
            <span className="text-base text-[#999] mb-1">/ 5</span>
          </div>
        </div>
      )}

      <SectionBlock
        title="Hard Skill"
        icon={<BookOpen className="w-4 h-4" />}
        drivers={scheda.hardSkill}
      />

      <SectionBlock
        title="Soft Skill"
        icon={<Brain className="w-4 h-4" />}
        drivers={scheda.softSkill}
      />

      {/* Crescita Knowledge */}
      {scheda.crescitaKnowledge?.commento && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#666]" />
            </div>
            <p className="font-semibold text-[#1A1A1A] text-sm">Crescita Knowledge</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-[#666] leading-relaxed">{scheda.crescitaKnowledge.commento}</p>
          </div>
        </div>
      )}

      {/* Performance */}
      {scheda.performance && scheda.performance.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-[#666]" />
            </div>
            <p className="font-semibold text-[#1A1A1A] text-sm">Performance</p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px] gap-4 px-6 pt-4 pb-2 border-b border-[#F5F5F5]">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide">Driver</p>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide text-right">% Ragg.</p>
          </div>

          <div className="divide-y divide-[#F5F5F5]">
            {scheda.performance.map((p, i) => (
              <div key={i} className="px-6 py-4 space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">{p.nome}</p>
                  {p.percentuale !== null ? (
                    <span className={`shrink-0 text-sm font-bold px-3 py-1 rounded-xl ${
                      p.percentuale >= 100 ? "bg-[#DCFCE7] text-[#16A34A]"
                      : p.percentuale >= 75  ? "bg-[#EBEBEB] text-[#222]"
                      : p.percentuale >= 50  ? "bg-[#FEF9C3] text-[#A16207]"
                      : "bg-[#FEE2E2] text-[#DC2626]"
                    }`}>
                      {p.percentuale}%
                    </span>
                  ) : (
                    <span className="shrink-0 text-sm text-[#BDBDBD]">—</span>
                  )}
                </div>
                {p.percentuale !== null && (
                  <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        p.percentuale >= 100 ? "bg-[#16A34A]"
                        : p.percentuale >= 75  ? "bg-[#111]"
                        : p.percentuale >= 50  ? "bg-yellow-400"
                        : "bg-red-400"
                      }`}
                      style={{ width: `${Math.min(p.percentuale, 100)}%` }}
                    />
                  </div>
                )}
                {p.commento && (
                  <p className="text-sm text-[#666] leading-relaxed pt-1">{p.commento}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#444] bg-white border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Modifica scheda riassuntiva
      </button>

    </div>
  );
}
