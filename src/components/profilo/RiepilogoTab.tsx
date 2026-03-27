"use client";

import { useEffect, useRef, useState } from "react";
import { Valutazione } from "@/types/valutazione";
import { SchedaRiassuntiva } from "@/types/scheda";
import { Economics } from "@/types/economics";
import { Building2, BookOpen, Radar, Banknote, ArrowRight, TrendingUp } from "lucide-react";

// ─── Meme scale ───────────────────────────────────────────────────────────────

const MEMES = [
  { file: "0.jpeg", label: "Disastroso"   },
  { file: "1.jpg",  label: "Insufficiente"},
  { file: "3.jpeg", label: "Nella norma"  },
  { file: "4.jpeg", label: "Buono"        },
  { file: "5.jpeg", label: "Ottimo"       },
  { file: "6.jpeg", label: "Eccellente"   },
];


function MemeSection({ dipendenteId }: { dipendenteId: string }) {
  const [active, setActive] = useState<number | null>(null);
  const [nota, setNota]     = useState("");
  const [saved, setSaved]   = useState(false);
  const taRef               = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/riepilogo-note?dipendenteId=${dipendenteId}`)
      .then((r) => r.json())
      .then((d) => {
        setNota(d?.nota ?? "");
        setActive(d?.memeIdx ?? null);
      });
  }, [dipendenteId]);

  const persist = (patch: { nota?: string; memeIdx?: number | null }) => {
    fetch(`/api/riepilogo-note?dipendenteId=${dipendenteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000); });
  };

  const selectMeme = (i: number) => {
    const next = active === i ? null : i;
    setActive(next);
    persist({ memeIdx: next });
  };

  const saveNota = (val: string) => {
    setNota(val);
    persist({ nota: val });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#F5F5F5]">
        <p className="font-semibold text-[#1A1A1A] text-sm">Giudizio complessivo</p>
        <p className="text-xs text-[#999] mt-0.5">Seleziona il meme che meglio rappresenta la tua valutazione dell&apos;anno</p>
      </div>

      <div className="px-6 py-6">
        {/* Meme scale */}
        <div className="flex items-end justify-center gap-3 mb-6">
          {MEMES.map((m, i) => {
            const isActive  = active === i;
            const hasChoice = active !== null;
            return (
              <button
                key={m.file}
                onClick={() => selectMeme(i)}
                className="flex flex-col items-center gap-2 focus:outline-none"
              >
                <div
                  className={`overflow-hidden rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-[#111] shadow-lg"
                      : hasChoice
                      ? "opacity-25 grayscale hover:opacity-60 hover:grayscale-0"
                      : "opacity-70 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{
                    width:  isActive ? 180 : 110,
                    height: isActive ? 180 : 110,
                    transform: isActive ? "scale(1.1)" : undefined,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/rating/${m.file}`}
                    alt={m.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`text-xs whitespace-nowrap transition-all ${isActive ? "font-bold text-[#1A1A1A]" : "text-[#BDBDBD]"}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#999]">Note del responsabile</p>
          <textarea
            ref={taRef}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            onBlur={(e) => saveNota(e.target.value.trim())}
            placeholder="Aggiungi un commento complessivo sulla valutazione..."
            rows={4}
            className="w-full text-sm text-[#1A1A1A] bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl px-4 py-3 resize-none placeholder:text-[#BDBDBD] focus:outline-none focus:border-[#111] transition-colors"
          />
          {saved && <p className="text-xs text-[#16A34A] text-right">Salvato</p>}
        </div>
      </div>
    </div>
  );
}

interface Props { dipendenteId: string; specialFeatures?: boolean }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avg(nums: number[]) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function fmtEur(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function scoreColor(s: number) {
  if (s >= 4.5) return { stroke: "#111",    text: "text-[#111]",      bg: "bg-[#111] text-white",           bar: "bg-[#111]" };
  if (s >= 3.5) return { stroke: "#555",    text: "text-[#444]",      bg: "bg-[#EBEBEB] text-[#333]",       bar: "bg-[#555]" };
  if (s >= 2.5) return { stroke: "#BDBDBD", text: "text-[#666]",      bg: "bg-[#F5F5F5] text-[#666]",       bar: "bg-[#BDBDBD]" };
  if (s >= 1.5) return { stroke: "#FB923C", text: "text-orange-700",  bg: "bg-[#FFF7ED] text-orange-700",   bar: "bg-orange-400" };
  return               { stroke: "#F87171", text: "text-red-500",     bg: "bg-[#FEF2F2] text-red-500",      bar: "bg-red-400" };
}

// ─── Valutazione scoring ──────────────────────────────────────────────────────

const SCALE: Record<number, string[][]> = {
  0: [["Insufficienti"], ["Da migliorare"], ["Adeguate"], ["Buone"], ["Eccellenti"]],
  1: [["Non valutabile"], ["Poco autonomo/a","Poco autonomo"], ["Autonomia parziale"], ["Prevalentemente autonomo/a","Prevalentemente autonomo"], ["Completamente autonomo/a","Completamente autonomo"]],
  2: [["Mai"], ["Raramente"], ["Talvolta"], ["Quasi sempre"], ["Sempre"]],
  3: [["Inefficace"], ["Poco efficace"], ["Adeguata"], ["Efficace"], ["Molto efficace"]],
  4: [["In modo non adeguato"], ["In modo poco efficace"], ["Con qualche difficoltà"], ["In modo adeguato"], ["In modo molto costruttivo"]],
  5: [["Assente"], ["Minima"], ["Moderata"], ["Significativa"], ["Molto significativa"]],
  6: [["Assente"], ["Limitata"], ["Adeguata"], ["Elevata"], ["Molto elevata"]],
  7: [["Non valutabile"], ["Inferiore"], ["In linea"], ["Superiore"], ["Molto superiore"]],
  8: [["Decisamente no"], ["Probabilmente no"], ["Non chiaro"], ["Probabilmente sì"], ["Decisamente sì"]],
};

function getScore(risposta: string, idx: number): number {
  const scale = SCALE[idx];
  if (!scale) return 0;
  const r = risposta.trim().toLowerCase();
  const found = scale.findIndex((labels) => labels.some((l) => l.toLowerCase() === r));
  return found >= 0 ? found + 1 : 0;
}

const VAL_SECTIONS = [
  { label: "Competenze e autonomia",       indices: [0, 1] },
  { label: "Affidabilità e comunicazione", indices: [2, 3] },
  { label: "Resilienza e crescita",        indices: [4, 5, 6] },
  { label: "Valore e potenziale",          indices: [7, 8] },
];

function valScore(vals: Valutazione[]): { overall: number; sections: { label: string; score: number }[] } {
  if (!vals.length) return { overall: 0, sections: [] };
  const allScores = vals.flatMap((v) =>
    v.risposte.map((r, i) => getScore(r.risposta, i)).filter((s) => s > 0)
  );
  const sections = VAL_SECTIONS.map((sec) => {
    const scores = vals.flatMap((v) =>
      sec.indices.map((i) => getScore(v.risposte[i]?.risposta ?? "", i)).filter((s) => s > 0)
    );
    return { label: sec.label, score: avg(scores) };
  });
  return { overall: avg(allScores), sections };
}

// ─── Scheda scoring ───────────────────────────────────────────────────────────

const SKILL_CATS = ["skill personali","skill relazionali","skill organizzative","skill di leadership","skill di pensiero"] as const;

function schedaScore(scheda: SchedaRiassuntiva) {
  const hard = avg(scheda.hardSkill.map((d) => d.score));
  const soft = avg(scheda.softSkill.map((d) => d.score));
  const overall = avg([...scheda.hardSkill, ...scheda.softSkill].map((d) => d.score));
  const cats: { label: string; score: number }[] = [];
  for (const cat of SKILL_CATS) {
    const items = scheda.softSkill.filter((d) => d.nome.toLowerCase().includes(cat));
    if (items.length) cats.push({ label: cat.replace("skill ", ""), score: avg(items.map((d) => d.score)) });
  }
  return { overall, hard, soft, cats };
}

function skillAxes(scheda: SchedaRiassuntiva) {
  const groups: Record<string, number[]> = {};
  for (const cat of SKILL_CATS) groups[cat] = [];
  for (const d of scheda.softSkill) {
    const cat = SKILL_CATS.find((k) => d.nome.toLowerCase().includes(k));
    if (cat) groups[cat].push(d.score);
  }
  return [
    { label: "Hard skill",          value: avg(scheda.hardSkill.map((d) => d.score)) },
    ...SKILL_CATS.map((cat) => ({ label: cat.replace("skill ", ""), value: avg(groups[cat]) })),
  ].filter((a) => a.value > 0);
}

// ─── Gauge SVG ────────────────────────────────────────────────────────────────

function Gauge({ score, size = 96 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / 5, 1);
  const c = scoreColor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={c.stroke}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`font-bold leading-none ${c.text}`} style={{ fontSize: size * 0.22 }}>
          {score.toFixed(1)}
        </p>
        <p className="text-[#BDBDBD] leading-none mt-0.5" style={{ fontSize: size * 0.13 }}>/5</p>
      </div>
    </div>
  );
}

// ─── Mini bar ────────────────────────────────────────────────────────────────

function MiniBar({ label, score }: { label: string; score: number }) {
  const c = scoreColor(score);
  return (
    <div className="flex items-center gap-2.5">
      <p className="text-xs text-[#999] w-36 shrink-0 truncate capitalize">{label}</p>
      <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <p className={`text-xs font-semibold w-7 text-right ${c.text}`}>{score.toFixed(1)}</p>
    </div>
  );
}

// ─── Score pill ──────────────────────────────────────────────────────────────

function Pill({ label, score }: { label: string; score: number }) {
  const c = scoreColor(score);
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${c.bg.includes("bg-[#111]") ? "bg-[#111]" : "bg-[#F7F7F7]"}`}>
      <span className={`text-xs capitalize ${c.bg.includes("bg-[#111]") ? "text-white/70" : "text-[#999]"}`}>{label}</span>
      <span className={`text-xs font-bold ml-3 ${c.bg.includes("bg-[#111]") ? "text-white" : c.text}`}>{score.toFixed(1)}</span>
    </div>
  );
}

// ─── Section card ────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  sub,
  score,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  score?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F5F5F5]">
        <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666] shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1A1A1A] text-sm">{title}</p>
          {sub && <p className="text-xs text-[#999] truncate">{sub}</p>}
        </div>
        {score !== undefined && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${scoreColor(score).bg}`}>
            {score.toFixed(1)} / 5
          </span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function RiepilogoTab({ dipendenteId, specialFeatures }: Props) {
  const [vals,    setVals]    = useState<Valutazione[]>([]);
  const [scheda,  setScheda]  = useState<SchedaRiassuntiva | null>(null);
  const [eco,     setEco]     = useState<Economics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/valutazioni?dipendenteId=${dipendenteId}`).then((r) => r.json()),
      fetch(`/api/schede?dipendenteId=${dipendenteId}`).then((r) => r.json()),
      fetch(`/api/economics?dipendenteId=${dipendenteId}`).then((r) => r.json()),
    ]).then(([v, s, e]) => {
      setVals(Array.isArray(v) ? v : []);
      setScheda(s ?? null);
      setEco(e ?? null);
    }).finally(() => setLoading(false));
  }, [dipendenteId]);

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  // ── Scores ──
  const valData   = valScore(vals);
  const skedData  = scheda ? schedaScore(scheda)  : null;
  const axesData  = scheda ? skillAxes(scheda)    : [];
  const skillOverall = axesData.length ? avg(axesData.map((a) => a.value)) : 0;

  const ea = eco?.economicsAttuale   ?? null;
  const pa = eco?.propostaAumento    ?? null;
  const bo = eco?.bonus              ?? null;

  const ralPct    = ea && pa?.nuovaRal ? ((pa.nuovaRal - ea.ral) / ea.ral) * 100 : null;
  const bonusPct  = ea && bo?.bonusErogato ? ((bo.bonusErogato - ea.bonusErogato) / ea.bonusErogato) * 100 : null;

  const overallScores = [valData.overall, skedData?.overall ?? 0, skillOverall].filter((s) => s > 0);
  const overallScore  = avg(overallScores);

  return (
    <div className="space-y-4">

      {/* ── Hero: overview scores ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F5F5F5] flex items-center justify-between">
          <p className="font-semibold text-[#1A1A1A] text-sm">Riepilogo valutazione</p>
          {overallScore > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#999]">Score medio</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${scoreColor(overallScore).bg}`}>
                {overallScore.toFixed(2)} / 5
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#F5F5F5]">
          {/* Valutazione cliente */}
          <div className="flex flex-col items-center gap-2 px-6 py-6">
            {valData.overall > 0 ? (
              <Gauge score={valData.overall} />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-[#DCDCDC]">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <p className="text-xs font-semibold text-[#666] text-center mt-1">Valutazione cliente</p>
            {vals.length > 0 && (
              <p className="text-xs text-[#BDBDBD] text-center">{vals.length} {vals.length === 1 ? "risposta" : "risposte"}</p>
            )}
          </div>

          {/* Scheda riassuntiva */}
          <div className="flex flex-col items-center gap-2 px-6 py-6">
            {skedData ? (
              <Gauge score={skedData.overall} />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-[#DCDCDC]">
                <BookOpen className="w-8 h-8" />
              </div>
            )}
            <p className="text-xs font-semibold text-[#666] text-center mt-1">Scheda riassuntiva</p>
            {skedData && (
              <p className="text-xs text-[#BDBDBD] text-center">
                Hard {skedData.hard.toFixed(1)} · Soft {skedData.soft.toFixed(1)}
              </p>
            )}
          </div>

          {/* Skill matrix */}
          <div className="flex flex-col items-center gap-2 px-6 py-6">
            {skillOverall > 0 ? (
              <Gauge score={skillOverall} />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-[#DCDCDC]">
                <Radar className="w-8 h-8" />
              </div>
            )}
            <p className="text-xs font-semibold text-[#666] text-center mt-1">Skill matrix</p>
            {axesData.length > 0 && (
              <p className="text-xs text-[#BDBDBD] text-center">{axesData.length} assi</p>
            )}
          </div>

          {/* Economics */}
          <div className="flex flex-col items-center justify-center gap-1 px-6 py-6">
            {ea ? (
              <>
                {ralPct !== null && ralPct > 0 ? (
                  <span className="text-4xl font-bold text-[#16A34A] leading-none">
                    +{ralPct.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-3xl font-bold text-[#999] leading-none">—</span>
                )}
                <span className="text-xs font-semibold text-[#BDBDBD] uppercase tracking-wide mt-1">RAL</span>
                {pa?.nuovaRal && (
                  <span className="text-lg font-bold text-[#1A1A1A] leading-none mt-1">
                    {fmtEur(pa.nuovaRal)}
                  </span>
                )}
                {bo?.bonusErogato != null && (
                  <span className="text-xs text-[#999] mt-2">
                    Bonus <span className="font-semibold text-[#1A1A1A]">{fmtEur(bo.bonusErogato)}</span>
                  </span>
                )}
              </>
            ) : (
              <Banknote className="w-8 h-8 text-[#DCDCDC]" />
            )}
            <p className="text-xs font-semibold text-[#666] text-center mt-2">Economics</p>
          </div>
        </div>
      </div>

      {/* ── Detail grid: 3 columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Valutazione */}
        <SectionCard
          icon={<Building2 className="w-4 h-4" />}
          title="Valutazione cliente"
          sub={vals.length ? vals.map((v) => v.societa).filter((s, i, a) => a.indexOf(s) === i).join(", ") : undefined}
          score={valData.overall > 0 ? valData.overall : undefined}
        >
          {valData.sections.length > 0 ? (
            <div className="space-y-2.5">
              {valData.sections.map((s) => (
                <MiniBar key={s.label} label={s.label} score={s.score} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#999]">Nessuna valutazione</p>
          )}
        </SectionCard>

        {/* Scheda riassuntiva */}
        <SectionCard
          icon={<BookOpen className="w-4 h-4" />}
          title="Scheda riassuntiva"
          score={skedData ? skedData.overall : undefined}
        >
          {skedData ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#BDBDBD] uppercase tracking-wide">Hard skill</p>
                {scheda!.hardSkill.map((d) => (
                  <MiniBar key={d.nome} label={d.nome} score={d.score} />
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#BDBDBD] uppercase tracking-wide">Soft skill</p>
                {skedData.cats.map((c) => (
                  <MiniBar key={c.label} label={c.label} score={c.score} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#999]">Nessuna scheda</p>
          )}
        </SectionCard>

        {/* Skill matrix */}
        <SectionCard
          icon={<Radar className="w-4 h-4" />}
          title="Skill matrix"
          score={skillOverall > 0 ? skillOverall : undefined}
        >
          {axesData.length > 0 ? (
            <div className="space-y-2">
              {axesData.map((a) => (
                <Pill key={a.label} label={a.label} score={a.value} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#999]">Nessun dato</p>
          )}
        </SectionCard>
      </div>

      {/* ── Economics detail ── */}
      {ea && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F5F5F5]">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
              <Banknote className="w-4 h-4" />
            </div>
            <p className="font-semibold text-[#1A1A1A] text-sm flex-1">Economics</p>
            {pa?.jobProfile && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#444]">
                {pa.jobProfile}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#F5F5F5]">

            {/* RAL */}
            <div className="px-5 py-4">
              <p className="text-xs text-[#BDBDBD] uppercase tracking-wide mb-3">RAL</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[#BDBDBD] line-through">{fmtEur(ea.ral)}</span>
                {pa?.nuovaRal && pa.nuovaRal > ea.ral ? (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span className="text-sm font-bold text-[#1A1A1A]">{fmtEur(pa.nuovaRal)}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                      +{ralPct!.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-[#1A1A1A]">{fmtEur(ea.ral)}</span>
                )}
              </div>
              {pa?.ralMin != null && pa?.ralMax != null && (
                <p className="text-xs text-[#BDBDBD] mt-1.5">Range {fmtEur(pa.ralMin)} – {fmtEur(pa.ralMax)}</p>
              )}
            </div>

            {/* Bonus */}
            <div className="px-5 py-4">
              <p className="text-xs text-[#BDBDBD] uppercase tracking-wide mb-3">Bonus</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[#BDBDBD] line-through">{fmtEur(ea.bonusErogato)}</span>
                {bo?.bonusErogato != null ? (
                  <>
                    <ArrowRight className={`w-3.5 h-3.5 ${bonusPct !== null && bonusPct > 0 ? "text-[#16A34A]" : "text-[#BDBDBD]"}`} />
                    <span className="text-sm font-bold text-[#1A1A1A]">{fmtEur(bo.bonusErogato)}</span>
                    {bonusPct !== null && bonusPct > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                        +{bonusPct.toFixed(1)}%
                      </span>
                    )}
                  </>
                ) : pa?.bonusImporto != null ? (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-[#BDBDBD]" />
                    <span className="text-sm font-bold text-[#1A1A1A]">{fmtEur(pa.bonusImporto)}</span>
                  </>
                ) : (
                  <span className="text-sm text-[#999]">—</span>
                )}
              </div>
              {pa?.bonusTipo && (
                <p className="text-xs text-[#BDBDBD] mt-1.5">{pa.bonusTipo} {pa.bonusPercentuale != null ? `· ${pa.bonusPercentuale}%` : ""}</p>
              )}
            </div>

            {/* Indennità + profilo */}
            <div className="px-5 py-4">
              <p className="text-xs text-[#BDBDBD] uppercase tracking-wide mb-3">Dettagli</p>
              <div className="space-y-2">
                {pa?.profilo && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#999]">Profilo</span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">{pa.profilo}</span>
                  </div>
                )}
                {pa?.sede && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#999]">Sede</span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">{pa.sede}</span>
                  </div>
                )}
                {ea.indennita > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#999]">Indennità</span>
                    <div className="flex items-center gap-1.5">
                      {pa?.nuovaIndennita != null && pa.nuovaIndennita !== ea.indennita ? (
                        <>
                          <span className="text-xs text-[#BDBDBD] line-through">{fmtEur(ea.indennita)}</span>
                          <TrendingUp className="w-3 h-3 text-[#16A34A]" />
                          <span className="text-xs font-semibold text-[#1A1A1A]">{fmtEur(pa.nuovaIndennita)}</span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-[#1A1A1A]">{fmtEur(ea.indennita)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Meme + note ── */}
      {specialFeatures && <MemeSection dipendenteId={dipendenteId} />}

    </div>
  );
}
