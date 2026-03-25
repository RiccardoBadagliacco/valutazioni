"use client";

import { useEffect, useRef, useState } from "react";
import { Banknote, Gift, ChevronRight, Lock, Check, X, ArrowRight } from "lucide-react";
import { Bonus, Economics, EconomicsAttuale, PropostaAumento } from "@/types/economics";
import confetti from "canvas-confetti";

interface Props {
  dipendenteId: string;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatEur(n: number, decimals = 0) {
  return n.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function pctChange(from: number, to: number) {
  if (from === 0) return null;
  return ((to - from) / from) * 100;
}

// ─── Read-only row ─────────────────────────────────────────────────────────────

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F5F5F5] last:border-0">
      <span className="text-sm text-[#666]">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-[#111]" : "text-[#1A1A1A]"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Comparison card ──────────────────────────────────────────────────────────

function DeltaBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  if (pct === 0)    return <span className="text-xs text-[#999]">invariato</span>;
  const positive = pct > 0;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
      positive ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"
    }`}>
      {positive ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

function CompareRow({
  label,
  pre,
  post,
  delta,
  sub,
  changed,
  positive,
}: {
  label: string;
  pre: string;
  post: string;
  delta?: React.ReactNode;
  sub?: string;
  changed?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#F5F5F5] last:border-0 gap-4">
      {/* Label + sub */}
      <div className="shrink-0 w-32">
        <p className="text-sm text-[#666]">{label}</p>
        {sub && <p className="text-xs text-[#BDBDBD] mt-0.5 leading-snug">{sub}</p>}
      </div>

      {/* Pre */}
      <p className={`text-sm flex-1 text-right ${changed ? "text-[#BDBDBD] line-through" : "text-[#1A1A1A] font-medium"}`}>
        {pre}
      </p>

      {/* Arrow */}
      <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${
        changed ? (positive ? "text-[#16A34A]" : "text-[#DC2626]") : "text-[#E0E0E0]"
      }`} />

      {/* Post + delta */}
      <div className="flex-1 text-right">
        <p className={`text-sm font-semibold ${
          changed ? (positive ? "text-[#16A34A]" : "text-[#DC2626]") : "text-[#1A1A1A]"
        }`}>{post}</p>
        {delta && <div className="mt-1">{delta}</div>}
      </div>
    </div>
  );
}

function ComparisonView({ ea, pa, bo }: { ea: EconomicsAttuale; pa: PropostaAumento; bo?: Bonus | null }) {
  const ralPct   = pa.nuovaRal       !== null ? pctChange(ea.ral, pa.nuovaRal) : null;
  const indPct   = pa.nuovaIndennita !== null ? pctChange(ea.indennita, pa.nuovaIndennita) : null;
  const bonusPost = bo?.bonusErogato ?? pa.bonusImporto;
  const bonusPct  = bonusPost !== null ? pctChange(ea.bonusErogato, bonusPost) : null;

  return (
    <div>
      {/* Column headers */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EBEBEB] gap-4">
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wide w-32">Voce</p>
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wide flex-1 text-right">Prima</p>
        <div className="w-3.5" />
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wide flex-1 text-right">Dopo</p>
      </div>

      {/* Profilo pills — sotto l'header */}
      {(pa.profilo || pa.sede || pa.jobProfile) && (
        <div className="flex flex-wrap gap-1.5 py-3 border-b border-[#F5F5F5]">
          {[
            pa.profilo    && { label: "Profilo",     value: pa.profilo },
            pa.sede       && { label: "Sede",        value: pa.sede },
            pa.jobProfile && { label: "Job profile", value: pa.jobProfile },
          ].filter(Boolean).map((item) => item && (
            <div key={item.label} className="flex items-center gap-1.5 bg-[#F5F5F5] rounded-lg px-2.5 py-1">
              <span className="text-xs text-[#999]">{item.label}</span>
              <span className="text-xs font-semibold text-[#1A1A1A]">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {pa.nuovaRal !== null && (() => {
        const ralDecreased = ralPct !== null && ralPct <= 0;
        return (
          <CompareRow
            label="RAL"
            pre={ralDecreased ? "" : formatEur(ea.ral)}
            post={formatEur(pa.nuovaRal)}
            changed={!ralDecreased && pa.nuovaRal !== ea.ral}
            positive={ralPct !== null && ralPct > 0}
            delta={ralDecreased ? undefined : <DeltaBadge pct={ralPct} />}
            sub={pa.ralMin !== null && pa.ralMax !== null
              ? `${formatEur(pa.ralMin)} – ${formatEur(pa.ralMax)}`
              : undefined}
          />
        );
      })()}

      {pa.nuovaIndennita !== null && (
        <CompareRow
          label="Indennità"
          pre={formatEur(ea.indennita, 1)}
          post={formatEur(pa.nuovaIndennita, 1)}
          changed={pa.nuovaIndennita !== ea.indennita}
          positive={indPct !== null && indPct > 0}
          delta={<DeltaBadge pct={indPct} />}
          sub={pa.parametroIndennita !== null ? `Param. ${formatEur(pa.parametroIndennita, 1)}` : undefined}
        />
      )}

      {bonusPost !== null && (() => {
        const bonusDecreased = bonusPct !== null && bonusPct < 0;
        return (
          <CompareRow
            label="Bonus"
            pre={bonusDecreased ? "" : formatEur(ea.bonusErogato)}
            post={formatEur(bonusPost, bo?.bonusErogato !== null && bo?.bonusErogato !== undefined ? 2 : 0)}
            changed={!bonusDecreased && bonusPost !== ea.bonusErogato}
            positive={bonusPct !== null && bonusPct > 0}
            delta={bonusDecreased ? undefined : <DeltaBadge pct={bonusPct} />}
            sub={pa.bonusTipo ? `${pa.bonusTipo}${pa.bonusPercentuale !== null ? ` · ${pa.bonusPercentuale}%` : ""}` : undefined}
          />
        );
      })()}
    </div>
  );
}

// ─── Editable form ────────────────────────────────────────────────────────────

function FieldInput({
  label,
  type = "text",
  value,
  onChange,
  suffix,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F5F5F5] last:border-0 gap-4">
      <span className="text-sm text-[#666] shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm font-semibold text-[#111] text-right bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-2.5 py-1 w-40 focus:outline-none focus:border-[#111] transition-colors"
        />
        {suffix && <span className="text-sm text-[#999]">{suffix}</span>}
      </div>
    </div>
  );
}

function EditableEconomicsAttuale({
  ea,
  dipendenteId,
  onSaved,
}: {
  ea: EconomicsAttuale;
  dipendenteId: string;
  onSaved: (updated: EconomicsAttuale) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState<EconomicsAttuale>({ ...ea });

  function field(key: keyof EconomicsAttuale) { return String(form[key]); }
  function set(key: keyof EconomicsAttuale, raw: string) {
    const isNum = ["livello", "ral", "indennita", "bonusErogato"].includes(key);
    setForm((f) => ({ ...f, [key]: isNum ? parseFloat(raw) || 0 : raw }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/economics?dipendenteId=${dipendenteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ economicsAttuale: form }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSaved(updated.economicsAttuale);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!editing) return (
    <div>
      <Row label="Tipo contratto"                 value={ea.tipoContratto} />
      <Row label="Livello"                        value={String(ea.livello)} />
      <Row label="Data inizio"                    value={formatDate(ea.dataInizio)} />
      <Row label="RAL"                            value={formatEur(ea.ral)}          highlight />
      <Row label="Indennità"                      value={formatEur(ea.indennita, 1)} />
      <Row label="Data di primo staffing (2025)"  value={formatDate(ea.dataPrimoStaffing)} />
      <Row label="Bonus erogato nella prec. val." value={formatEur(ea.bonusErogato)} highlight />
    </div>
  );

  return (
    <div>
      <FieldInput label="Tipo contratto"          value={field("tipoContratto")}    onChange={(v) => set("tipoContratto", v)} />
      <FieldInput label="Livello"   type="number" value={field("livello")}          onChange={(v) => set("livello", v)} />
      <FieldInput label="Data inizio" type="date" value={form.dataInizio}           onChange={(v) => set("dataInizio", v)} />
      <FieldInput label="RAL"       type="number" value={field("ral")}              onChange={(v) => set("ral", v)}          suffix="€" />
      <FieldInput label="Indennità" type="number" value={field("indennita")}        onChange={(v) => set("indennita", v)}    suffix="€" />
      <FieldInput label="Data primo staffing" type="date" value={form.dataPrimoStaffing} onChange={(v) => set("dataPrimoStaffing", v)} />
      <FieldInput label="Bonus prec. val." type="number" value={field("bonusErogato")} onChange={(v) => set("bonusErogato", v)} suffix="€" />
      <div className="flex items-center gap-2 pt-4 mt-1">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#111] text-white text-sm font-semibold rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50">
          <Check className="w-3.5 h-3.5" />
          {saving ? "Salvataggio…" : "Salva"}
        </button>
        <button onClick={() => { setForm({ ...ea }); setEditing(false); }}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#666] bg-white border border-[#E5E5E5] rounded-xl hover:border-[#999] transition-colors">
          <X className="w-3.5 h-3.5" />
          Annulla
        </button>
      </div>
    </div>
  );
}

// ─── Celebration ──────────────────────────────────────────────────────────────

const COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6BFF","#FF922B","#A9E34B","#74C0FC","#F783AC","#FFA94D"];

// ─── Audio (file reali) ───────────────────────────────────────────────────────

function playSound(src: string, volume = 1) {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {/* autoplay policy: silent fail */});
  return audio;
}

function celebrate(withAirhorn = false) {
  // ── Audio ──
  if (withAirhorn) playSound("/sounds/airhorn.mp3", 0.9);
  setTimeout(() => playSound("/sounds/applause.mp3", 0.9), withAirhorn ? 600 : 0);

  // 1 — burst iniziale dal centro
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { x: 0.5, y: 0.55 },
    colors: COLORS,
    startVelocity: 45,
    gravity: 0.9,
    scalar: 1.1,
    ticks: 200,
  });

  // 2 — cannoni laterali con delay
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60,  spread: 70, origin: { x: 0, y: 0.6 }, colors: COLORS, startVelocity: 55 });
    confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors: COLORS, startVelocity: 55 });
  }, 300);

  // 3 — pioggia continua per 4 secondi
  const end = Date.now() + 4000;
  const rain = () => {
    confetti({ particleCount: 4, angle: 60,  spread: 50, origin: { x: 0 },   colors: COLORS, gravity: 1.2, scalar: 0.9 });
    confetti({ particleCount: 4, angle: 120, spread: 50, origin: { x: 1 },   colors: COLORS, gravity: 1.2, scalar: 0.9 });
    confetti({ particleCount: 2, angle: 90,  spread: 120, origin: { x: 0.5, y: 0 }, colors: COLORS, gravity: 0.8 });
    if (Date.now() < end) requestAnimationFrame(rain);
  };
  setTimeout(rain, 600);

  // 4 — finale a stella
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 360, origin: { x: 0.5, y: 0.4 }, colors: COLORS, startVelocity: 30, gravity: 0.6, scalar: 1.3, ticks: 250 });
  }, 3800);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EconomicsTab({ dipendenteId }: Props) {
  const [data, setData]                 = useState<Economics | null>(null);
  const [loading, setLoading]           = useState(true);
  const [propostaOpen, setPropostaOpen] = useState(false);
  const [ea, setEa]                     = useState<EconomicsAttuale | null>(null);
  const celebratedRef                   = useRef(false);

  useEffect(() => {
    fetch(`/api/economics?dipendenteId=${dipendenteId}`)
      .then((r) => r.json())
      .then((d: Economics) => { setData(d); setEa(d?.economicsAttuale ?? null); })
      .finally(() => setLoading(false));
  }, [dipendenteId]);

  // Trigger celebrazione dopo il render, quando la proposta viene sbloccata
  useEffect(() => {
    if (!propostaOpen || celebratedRef.current) return;
    const pa = data?.propostaAumento ?? null;
    const eaVal = ea;
    if (!pa || !eaVal) return;
    const bo      = data?.bonus ?? null;
    const ralUp   = pa.nuovaRal !== null && pa.nuovaRal > eaVal.ral;
    const bonusPost = bo?.bonusErogato ?? pa.bonusImporto;
    const bonusUp = bonusPost !== null && bonusPost > eaVal.bonusErogato;
    if (ralUp || bonusUp) {
      celebratedRef.current = true;
      celebrate(ralUp && bonusUp);
    }
  }, [propostaOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  const pa = data?.propostaAumento ?? null;
  const bo = data?.bonus           ?? null;

  return (
    <div className="space-y-4">

      {/* ── Economics card: mostra dati attuali, poi comparazione quando sbloccata ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
            <Banknote className="w-4 h-4" />
          </div>
          <p className="font-semibold text-[#1A1A1A] text-sm flex-1">
            {propostaOpen ? "Dettaglio risorsa — comparazione" : "Economics prima della valutazione"}
          </p>
          {propostaOpen && (
            <button
              onClick={() => setPropostaOpen(false)}
              className="text-xs text-[#999] hover:text-[#111] transition-colors"
            >
              Chiudi proposta
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {!ea ? (
            <p className="text-sm text-[#999]">Dati economics non ancora inseriti</p>
          ) : propostaOpen && pa ? (
            /* ─── Comparazione ─── */
            <ComparisonView ea={ea} pa={pa} bo={bo} />
          ) : (
            /* ─── Vista normale con modifica ─── */
            <>
              <EditableEconomicsAttuale ea={ea} dipendenteId={dipendenteId} onSaved={setEa} />
              {!propostaOpen && (
                <div className="pt-4 mt-1">
                  <button
                    onClick={() => setPropostaOpen(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#111] text-white text-sm font-semibold rounded-xl hover:bg-[#333] transition-colors"
                  >
                    <span>Procedi con la proposta di aumento</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Locked placeholder (solo se economics presente ma proposta non aperta) ── */}
      {ea && !propostaOpen && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden opacity-40 select-none pointer-events-none">
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#999]">
              <Lock className="w-4 h-4" />
            </div>
            <p className="font-semibold text-[#999] text-sm">Proposta di aumento RAL e cambio job profile</p>
          </div>
        </div>
      )}

      {/* ── Bonus ── */}
      {propostaOpen && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
              <Gift className="w-4 h-4" />
            </div>
            <p className="font-semibold text-[#1A1A1A] text-sm flex-1">Bonus</p>
            {bo?.bonusMassimale !== null && bo?.bonusMassimale !== undefined && (
              <span className="text-xs text-[#999]">Massimale {formatEur(bo.bonusMassimale, 2)}</span>
            )}
          </div>

          <div className="px-6 py-5">
            {bo?.obiettivi?.length ? (
              <div className="space-y-4">
                {/* Tabella obiettivi */}
                <div>
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_80px_80px_100px] gap-3 pb-2 border-b border-[#EBEBEB]">
                    <p className="text-xs font-semibold text-[#999] uppercase tracking-wide">Descrizione</p>
                    <p className="text-xs font-semibold text-[#999] uppercase tracking-wide text-right">% Max</p>
                    <p className="text-xs font-semibold text-[#999] uppercase tracking-wide text-right">Peso</p>
                    <p className="text-xs font-semibold text-[#999] uppercase tracking-wide text-right">Quota max</p>
                  </div>

                  {/* Rows */}
                  {bo.obiettivi.map((o) => (
                    <div key={o.descrizione} className="grid grid-cols-[1fr_80px_80px_100px] gap-3 py-3 border-b border-[#F5F5F5] last:border-0 items-center">
                      <p className="text-sm text-[#1A1A1A]">{o.descrizione}</p>
                      <p className="text-sm text-right text-[#666]">{o.percentualeMassima}%</p>
                      <p className="text-sm text-right text-[#666]">{o.pesoObiettivo}%</p>
                      <p className="text-sm font-medium text-right text-[#1A1A1A]">{formatEur(o.quotaBonusMassima, 2)}</p>
                    </div>
                  ))}
                </div>

                {/* Totali */}
                <div className="bg-[#F7F7F7] rounded-xl px-4 py-3 space-y-2">
                  {bo.bonusMassimale !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#666]">Bonus massimale da erogare</span>
                      <span className="text-sm font-semibold text-[#1A1A1A]">{formatEur(bo.bonusMassimale, 2)}</span>
                    </div>
                  )}
                  {bo.bonusErogato !== null && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#EBEBEB]">
                      <span className="text-sm font-semibold text-[#1A1A1A]">Bonus erogato</span>
                      <div className="flex items-center gap-2">
                        {bo.bonusErogatoPercentuale !== null && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                            {bo.bonusErogatoPercentuale.toFixed(1)}% del totale
                          </span>
                        )}
                        <span className="text-sm font-bold text-[#111]">{formatEur(bo.bonusErogato, 2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#999]">Nessun bonus inserito</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
