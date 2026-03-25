"use client";

import { useEffect, useState } from "react";
import { Staffing, PeriodoStaffing, PresenzaMese } from "@/types/staffing";
import { CalendarDays, Building2 } from "lucide-react";

interface Props {
  dipendenteId: string;
}

const MESI_IT = ["", "Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Staffing timeline ────────────────────────────────────────────────────────

function PeriodoRow({ periodo, isLast }: { periodo: PeriodoStaffing; isLast: boolean }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-[#111] shrink-0 mt-1" />
        {!isLast && <div className="w-px flex-1 bg-[#E5E5E5] mt-1.5" />}
      </div>
      <div className={`flex-1 ${!isLast ? "pb-6" : ""}`}>
        <div className="bg-[#FAFAFA] rounded-2xl border border-[#EFEFEF] px-5 py-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">{periodo.tipoContratto}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#999]">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{formatDate(periodo.dataInizio)}</span>
                <span className="text-[#DCDCDC]">→</span>
                <span>{formatDate(periodo.dataFine)}</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white border border-[#E5E5E5] text-[#444] shrink-0">
              {periodo.mesi} {periodo.mesi === 1 ? "mese" : "mesi"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Presenze bar ─────────────────────────────────────────────────────────────

function PresenzeRow({ p, maxGiorni }: { p: PresenzaMese; maxGiorni: number }) {
  const pctUfficio = maxGiorni > 0 ? (p.giorniEquivalenti / maxGiorni) * 100 : 0;

  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-[#F5F5F5] last:border-0">
      {/* Mese */}
      <p className="text-xs font-semibold text-[#999] w-7 shrink-0">{MESI_IT[p.mese]}</p>

      {/* Barra */}
      <div className="flex-1 h-5 bg-[#F5F5F5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#111] rounded-full transition-all"
          style={{ width: `${pctUfficio}%` }}
        />
      </div>

      {/* Valori */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-semibold text-[#1A1A1A] w-8 text-right">
          {p.giorniEquivalenti % 1 === 0 ? p.giorniEquivalenti : p.giorniEquivalenti.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SommarioTab({ dipendenteId }: Props) {
  const [data, setData]       = useState<Staffing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/staffing?dipendenteId=${dipendenteId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [dipendenteId]);

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  const periodi  = data?.periodi  ?? [];
  const presenze = data?.presenze ?? [];
  const totMesi  = periodi.reduce((s, p) => s + p.mesi, 0);
  const chargeability = Math.round((totMesi / 12) * 100);

  const maxGiorni = presenze.length > 0
    ? Math.max(...presenze.map((p) => p.giorniUfficio + p.giorniSmartWorking))
    : 1;

  const totGiorniUfficio = presenze.reduce((s, p) => s + p.giorniUfficio, 0);
  const totSW            = presenze.reduce((s, p) => s + p.giorniSmartWorking, 0);
  const totEquivalenti   = presenze.reduce((s, p) => s + p.giorniEquivalenti, 0);

  return (
    <div className="space-y-4">

      {/* ── Staffing ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
              <CalendarDays className="w-4 h-4" />
            </div>
            <p className="font-semibold text-[#1A1A1A] text-sm">Storico staffing</p>
          </div>
          {totMesi > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#999]">{totMesi} / 12 mesi</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                chargeability >= 80
                  ? "bg-[#DCFCE7] text-[#16A34A]"
                  : chargeability >= 50
                  ? "bg-[#FEF9C3] text-[#A16207]"
                  : "bg-[#FEE2E2] text-[#DC2626]"
              }`}>
                {chargeability}% chargeability
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          {periodi.length === 0 ? (
            <p className="text-sm text-[#999]">Nessun periodo di staffing registrato</p>
          ) : (
            periodi.map((p, i) => (
              <PeriodoRow key={i} periodo={p} isLast={i === periodi.length - 1} />
            ))
          )}
        </div>
      </div>

      {/* ── Presenze ── */}
      {presenze.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
                <Building2 className="w-4 h-4" />
              </div>
              <p className="font-semibold text-[#1A1A1A] text-sm">Presenze in ufficio</p>
            </div>
          </div>

          <div className="px-6 py-2">
            {/* Column headers */}
            <div className="flex items-center gap-4 pb-1">
              <p className="text-xs text-[#BDBDBD] w-7 shrink-0" />
              <p className="flex-1 text-xs text-[#BDBDBD]" />
              <div className="flex items-center gap-3 shrink-0 text-xs text-[#BDBDBD]">
                <span className="w-8 text-right">gg</span>
              </div>
            </div>

            {presenze.map((p) => (
              <PresenzeRow key={p.mese} p={p} maxGiorni={maxGiorni} />
            ))}

            {/* Totali */}
            <div className="flex items-center gap-4 pt-3 mt-1 border-t border-[#EBEBEB]">
              <p className="text-xs font-semibold text-[#999] w-7 shrink-0">Tot</p>
              <p className="flex-1" />
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-[#1A1A1A] w-8 text-right">
                  {totEquivalenti % 1 === 0 ? totEquivalenti : totEquivalenti.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
