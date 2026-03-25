"use client";

import { useEffect, useState } from "react";
import { Building2, User, Calendar } from "lucide-react";
import { Valutazione } from "@/types/valutazione";

interface Props {
  dipendenteId: string;
}

// ─── Scale 1–5 per domanda ────────────────────────────────────────────────────

const SCALE: Record<number, [string, ...string[]][]> = {
  0: [["Insufficienti"], ["Da migliorare"], ["Adeguate"], ["Buone"], ["Eccellenti"]],
  1: [["Non valutabile"], ["Poco autonomo/a", "Poco autonomo"], ["Autonomia parziale"], ["Prevalentemente autonomo/a", "Prevalentemente autonomo"], ["Completamente autonomo/a", "Completamente autonomo"]],
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
  const found = scale.findIndex((labels) =>
    labels.some((l) => l.toLowerCase() === r)
  );
  return found >= 0 ? found + 1 : 0;
}

// ─── Score → colori ───────────────────────────────────────────────────────────

function scoreColors(s: number) {
  if (s === 5) return { dot: "bg-[#111]",     pill: "bg-[#111] text-white",       label: "text-[#111]" };
  if (s === 4) return { dot: "bg-[#555]",     pill: "bg-[#EBEBEB] text-[#222]",   label: "text-[#444]" };
  if (s === 3) return { dot: "bg-[#BDBDBD]",  pill: "bg-[#F5F5F5] text-[#666]",   label: "text-[#666]" };
  if (s === 2) return { dot: "bg-orange-400", pill: "bg-[#FFF7ED] text-orange-700", label: "text-orange-700" };
  if (s === 1) return { dot: "bg-red-400",    pill: "bg-[#FEF2F2] text-red-600",   label: "text-red-600" };
  return       { dot: "bg-[#E0E0E0]",   pill: "bg-[#F5F5F5] text-[#999]",   label: "text-[#999]" };
}

// ─── Sezioni tematiche ────────────────────────────────────────────────────────

const SECTIONS = [
  { label: "Competenze e autonomia",       indices: [0, 1] },
  { label: "Affidabilità e comunicazione", indices: [2, 3] },
  { label: "Resilienza e crescita",        indices: [4, 5, 6] },
  { label: "Valore e potenziale",          indices: [7, 8] },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

function avg(risposte: Valutazione["risposte"], indices: number[]) {
  const scores = indices.map((i) => getScore(risposte[i]?.risposta ?? "", i)).filter((s) => s > 0);
  if (!scores.length) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// ─── ScoreDots ────────────────────────────────────────────────────────────────

function ScoreDots({ score }: { score: number }) {
  const c = scoreColors(score);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`rounded-full transition-colors ${
            score > 0 && n <= score ? c.dot : "bg-[#EBEBEB]"
          } ${n <= score && score === 5 ? "w-3 h-3" : "w-2.5 h-2.5"}`}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ValutazioneClienteTab({ dipendenteId }: Props) {
  const [valutazioni, setValutazioni] = useState<Valutazione[]>([]);
  const [selected, setSelected]       = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch(`/api/valutazioni?dipendenteId=${dipendenteId}`)
      .then((r) => r.json())
      .then((data: Valutazione[]) => {
        setValutazioni(data);
        if (data.length > 0) setSelected(data[0].id);
      })
      .finally(() => setLoading(false));
  }, [dipendenteId]);

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  if (!valutazioni.length) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFEFEF] p-8 text-center">
        <p className="text-sm text-[#999]">Nessuna valutazione cliente disponibile</p>
      </div>
    );
  }

  const active    = valutazioni.find((v) => v.id === selected) ?? valutazioni[0];
  const allScores = active.risposte.map((r, i) => getScore(r.risposta, i)).filter((s) => s > 0);
  const global    = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null;

  return (
    <div className="space-y-4">

      {/* Selector */}
      {valutazioni.length > 1 && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] p-5">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-3">
            {valutazioni.length} valutazioni ricevute
          </p>
          <div className="grid grid-cols-2 gap-2">
            {valutazioni.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                  selected === v.id ? "bg-[#111] border-[#111]" : "bg-white border-[#E5E5E5] hover:border-[#BDBDBD]"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  selected === v.id ? "bg-white/15 text-white" : "bg-[#F5F5F5] text-[#666]"
                }`}>{i + 1}</div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${selected === v.id ? "text-white" : "text-[#1A1A1A]"}`}>{v.societa}</p>
                  <p className={`text-xs mt-0.5 truncate ${selected === v.id ? "text-white/60" : "text-[#999]"}`}>{v.valutatore} · {formatDate(v.data)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card principale */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">

        {/* Header con punteggio globale */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#F5F5F5]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#666]" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A] text-base">{active.societa}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-xs text-[#999]"><User className="w-3 h-3" />{active.valutatore}</span>
                <span className="flex items-center gap-1.5 text-xs text-[#999]"><Calendar className="w-3 h-3" />{formatDate(active.data)}</span>
              </div>
            </div>
          </div>
          {global !== null && (
            <div className="text-right">
              <p className="text-4xl font-bold text-[#1A1A1A] leading-none">{global.toFixed(1)}</p>
              <p className="text-xs text-[#999] mt-1">media su 5.0</p>
            </div>
          )}
        </div>

        {/* Sezioni */}
        {SECTIONS.map((section) => {
          const sectionAvg = avg(active.risposte, section.indices);
          return (
            <div key={section.label} className="border-b border-[#F5F5F5] last:border-0">
              {/* Section title */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <p className="text-xs font-semibold text-[#999] uppercase tracking-wider">{section.label}</p>
                {sectionAvg !== null && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${scoreColors(Math.round(sectionAvg)).pill}`}>
                    {sectionAvg.toFixed(1)} / 5
                  </span>
                )}
              </div>

              {/* Domande */}
              <div className="px-6 pb-5 space-y-4">
                {section.indices.map((idx) => {
                  const r = active.risposte[idx];
                  if (!r) return null;
                  const score = getScore(r.risposta, idx);
                  const c     = scoreColors(score);
                  const hasComment = r.commento?.trim() && r.commento.trim() !== ".";

                  return (
                    <div key={idx} className="rounded-xl border border-[#F0F0F0] bg-[#FAFAFA] p-4">
                      {/* Domanda + risposta */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="text-sm font-medium text-[#1A1A1A] leading-snug">{r.domanda}</p>
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 ${c.pill}`}>
                          {r.risposta}
                        </span>
                      </div>
                      {/* Score dots + label */}
                      <div className="flex items-center gap-3">
                        <ScoreDots score={score} />
                        <span className={`text-xs font-semibold ${c.label}`}>
                          {score > 0 ? `${score} / 5` : "–"}
                        </span>
                      </div>
                      {/* Commento */}
                      {hasComment && (
                        <p className="text-sm text-[#666] mt-3 pt-3 border-t border-[#EBEBEB] leading-relaxed">
                          {r.commento}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
