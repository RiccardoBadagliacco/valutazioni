"use client";

import { useEffect, useState } from "react";
import { SchedaRiassuntiva, DriverValutazione } from "@/types/scheda";
import { BookOpen, Brain, TrendingUp } from "lucide-react";

interface Props {
  dipendenteId: string;
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SchedaRiassuntivaTab({ dipendenteId }: Props) {
  const [scheda, setScheda]   = useState<SchedaRiassuntiva | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/schede?dipendenteId=${dipendenteId}`)
      .then((r) => r.json())
      .then(setScheda)
      .finally(() => setLoading(false));
  }, [dipendenteId]);

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  if (!scheda) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFEFEF] p-8 text-center">
        <p className="text-sm text-[#999]">Scheda non disponibile</p>
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

    </div>
  );
}
