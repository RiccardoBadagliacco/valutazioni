"use client";

import { useEffect, useState } from "react";
import { Staffing, PeriodoStaffing, PresenzaMese } from "@/types/staffing";
import { CalendarDays, Building2, Plus, Trash2, Check, Pencil, X } from "lucide-react";

interface Props {
  dipendenteId: string;
  isEditing?: boolean;
}

const MESI_IT = ["", "Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function calcMesi(inizio: string, fine: string): number {
  if (!inizio || !fine) return 0;
  const d1 = new Date(inizio);
  const d2 = new Date(fine);
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
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
      <p className="text-xs font-semibold text-[#999] w-7 shrink-0">{MESI_IT[p.mese]}</p>
      <div className="flex-1 h-5 bg-[#F5F5F5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#111] rounded-full transition-all"
          style={{ width: `${pctUfficio}%` }}
        />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-semibold text-[#1A1A1A] w-8 text-right">
          {p.giorniEquivalenti % 1 === 0 ? p.giorniEquivalenti : p.giorniEquivalenti.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// ─── Create form ──────────────────────────────────────────────────────────────

interface PeriodoForm {
  tipoContratto: string;
  dataInizio: string;
  dataFine: string;
}

const EMPTY_PERIODO: PeriodoForm = { tipoContratto: "", dataInizio: "", dataFine: "" };

function CreateStaffingForm({
  dipendenteId,
  initialData,
  onSaved,
  onCancel,
}: {
  dipendenteId: string;
  initialData?: Staffing;
  onSaved: (data: Staffing) => void;
  onCancel?: () => void;
}) {
  const [periodi, setPeriodi] = useState<PeriodoForm[]>(
    initialData?.periodi?.length
      ? initialData.periodi.map((p) => ({ tipoContratto: p.tipoContratto, dataInizio: p.dataInizio, dataFine: p.dataFine }))
      : [{ ...EMPTY_PERIODO }]
  );
  const [presenze, setPresenze] = useState<Record<number, number>>(
    Object.fromEntries(Array.from({ length: 12 }, (_, i) => {
      const mese = i + 1;
      const found = initialData?.presenze?.find((p) => p.mese === mese);
      return [mese, found?.giorniUfficio ?? 0];
    }))
  );
  const [saving, setSaving] = useState(false);

  function updatePeriodo(i: number, field: keyof PeriodoForm, val: string) {
    setPeriodi((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }

  function addPeriodo() {
    setPeriodi((prev) => [...prev, { ...EMPTY_PERIODO }]);
  }

  function removePeriodo(i: number) {
    setPeriodi((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    try {
      const staffingPeriodi = periodi
        .filter((p) => p.tipoContratto && p.dataInizio && p.dataFine)
        .map((p) => ({ ...p, mesi: calcMesi(p.dataInizio, p.dataFine) }));

      const staffingPresenze: PresenzaMese[] = Object.entries(presenze)
        .filter(([, gg]) => gg > 0)
        .map(([mese, gg]) => ({
          mese: parseInt(mese),
          giorniUfficio: gg,
          giorniSmartWorking: 0,
          giorniEquivalenti: gg,
        }));

      const body: Staffing = {
        dipendenteId,
        periodi: staffingPeriodi,
        presenze: staffingPresenze,
      };

      const res = await fetch("/api/staffing", {
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
      {/* Periodi */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
              <CalendarDays className="w-4 h-4" />
            </div>
            <p className="font-semibold text-[#1A1A1A] text-sm">Storico staffing</p>
          </div>
          <button
            onClick={addPeriodo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#555] bg-[#F5F5F5] rounded-lg hover:bg-[#EBEBEB] transition-colors"
          >
            <Plus className="w-3 h-3" />
            Aggiungi
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {periodi.map((p, i) => (
            <div key={i} className="bg-[#FAFAFA] rounded-xl border border-[#EFEFEF] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#999] uppercase tracking-wide">Periodo {i + 1}</p>
                {periodi.length > 1 && (
                  <button onClick={() => removePeriodo(i)} className="text-[#BDBDBD] hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs text-[#999] mb-1 block">Tipo contratto</label>
                  <input
                    type="text"
                    value={p.tipoContratto}
                    onChange={(e) => updatePeriodo(i, "tipoContratto", e.target.value)}
                    placeholder="Es. T&M, Fixed price..."
                    className="w-full text-sm text-[#111] bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#999] mb-1 block">Data inizio</label>
                  <input
                    type="date"
                    value={p.dataInizio}
                    onChange={(e) => updatePeriodo(i, "dataInizio", e.target.value)}
                    className="w-full text-sm text-[#111] bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#999] mb-1 block">Data fine</label>
                  <input
                    type="date"
                    value={p.dataFine}
                    onChange={(e) => updatePeriodo(i, "dataFine", e.target.value)}
                    className="w-full text-sm text-[#111] bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
              </div>
              {p.dataInizio && p.dataFine && (
                <p className="text-xs text-[#999]">
                  {calcMesi(p.dataInizio, p.dataFine)} mesi calcolati automaticamente
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Presenze */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center px-6 py-4 border-b border-[#F5F5F5] gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
            <Building2 className="w-4 h-4" />
          </div>
          <p className="font-semibold text-[#1A1A1A] text-sm">Presenze in ufficio</p>
          <span className="text-xs text-[#999] ml-auto">giorni/mese</span>
        </div>

        <div className="px-6 py-3">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((mese) => (
            <div key={mese} className="flex items-center gap-4 py-2 border-b border-[#F5F5F5] last:border-0">
              <p className="text-xs font-semibold text-[#999] w-7 shrink-0">{MESI_IT[mese]}</p>
              <input
                type="number"
                min={0}
                max={23}
                value={presenze[mese]}
                onChange={(e) =>
                  setPresenze((prev) => ({ ...prev, [mese]: Math.max(0, parseInt(e.target.value) || 0) }))
                }
                className="w-20 text-sm text-right font-semibold text-[#111] bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#111] transition-colors"
              />
              <span className="text-xs text-[#999]">gg</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 mt-2 border-t border-[#F0F0F0]">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#111] text-white text-sm font-semibold rounded-xl hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-3.5 h-3.5" />
          {saving ? "Salvataggio…" : "Salva"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-[#555] bg-white border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-colors">
            <X className="w-3.5 h-3.5" />
            Annulla
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SommarioTab({ dipendenteId, isEditing }: Props) {
  const [data, setData]       = useState<Staffing | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch(`/api/staffing?dipendenteId=${dipendenteId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [dipendenteId]);

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  if (editing || (isEditing && !data)) {
    return (
      <CreateStaffingForm
        dipendenteId={dipendenteId}
        initialData={data ?? undefined}
        onSaved={(saved) => { setData(saved); setEditing(false); }}
        onCancel={data ? () => setEditing(false) : undefined}
      />
    );
  }

  const periodi  = data?.periodi  ?? [];
  const presenze = data?.presenze ?? [];
  const totMesi  = periodi.reduce((s, p) => s + p.mesi, 0);
  const chargeability = Math.round((totMesi / 12) * 100);

  const presenzeMap = new Map(presenze.map((p) => [p.mese, p]));
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const mese = i + 1;
    return presenzeMap.get(mese) ?? { mese, giorniUfficio: 0, giorniSmartWorking: 0, giorniEquivalenti: 0 };
  });

  const maxGiorni = presenze.length > 0
    ? Math.max(...presenze.map((p) => p.giorniUfficio + p.giorniSmartWorking))
    : 1;

  const totEquivalenti = presenze.reduce((s, p) => s + p.giorniEquivalenti, 0);

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
          <div className="flex items-center gap-3">
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#555] bg-[#F5F5F5] rounded-lg hover:bg-[#EBEBEB] transition-colors">
            <Pencil className="w-3 h-3" />
            Modifica
          </button>
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
          <div className="flex items-center gap-4 pb-1">
            <p className="text-xs text-[#BDBDBD] w-7 shrink-0" />
            <p className="flex-1 text-xs text-[#BDBDBD]" />
            <div className="flex items-center gap-3 shrink-0 text-xs text-[#BDBDBD]">
              <span className="w-8 text-right">gg</span>
            </div>
          </div>

          {allMonths.map((p) => (
            <PresenzeRow key={p.mese} p={p} maxGiorni={maxGiorni} />
          ))}

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

    </div>
  );
}
