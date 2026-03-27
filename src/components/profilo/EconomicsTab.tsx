"use client";

import { useEffect, useRef, useState } from "react";
import { Banknote, Gift, ChevronRight, Lock, Check, X, ArrowRight, Pencil } from "lucide-react";
import { Bonus, Economics, EconomicsAttuale, PropostaAumento } from "@/types/economics";
import confetti from "canvas-confetti";

interface Props {
  dipendenteId: string;
  isEditing?: boolean;
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

function ComparisonView({ ea, pa }: { ea: EconomicsAttuale; pa: PropostaAumento; bo?: Bonus | null }) {
  const ralPct = pa.nuovaRal       !== null ? pctChange(ea.ral, pa.nuovaRal) : null;
  const indPct = pa.nuovaIndennita !== null ? pctChange(ea.indennita, pa.nuovaIndennita) : null;
  const bonusPct = pa.bonusImporto !== null ? pctChange(ea.bonusErogato, pa.bonusImporto) : null;

  return (
    <div>
      {/* Column headers */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EBEBEB] gap-4">
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wide w-32">Voce</p>
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wide flex-1 text-right">Prima</p>
        <div className="w-3.5" />
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wide flex-1 text-right">Dopo</p>
      </div>

      {/* Job Profile */}
      {pa.jobProfile && (
        <CompareRow
          label="Job Profile"
          pre={ea.jobProfile ?? "—"}
          post={pa.jobProfile}
          changed={pa.jobProfile !== ea.jobProfile}
        />
      )}

      {/* RAL */}
      {pa.nuovaRal !== null && (
        <CompareRow
          label="RAL"
          pre={formatEur(ea.ral)}
          post={formatEur(pa.nuovaRal)}
          changed={pa.nuovaRal !== ea.ral}
          positive={ralPct !== null && ralPct > 0}
          delta={<DeltaBadge pct={ralPct} />}
        />
      )}

      {/* Indennità */}
      {pa.nuovaIndennita !== null && (
        <CompareRow
          label="Indennità"
          pre={formatEur(ea.indennita, 1)}
          post={formatEur(pa.nuovaIndennita, 1)}
          changed={pa.nuovaIndennita !== ea.indennita}
          positive={indPct !== null && indPct > 0}
          delta={<DeltaBadge pct={indPct} />}
        />
      )}

      {/* Bonus */}
      {pa.bonusImporto !== null && (
        <CompareRow
          label="Bonus"
          pre={formatEur(ea.bonusErogato)}
          post={formatEur(pa.bonusImporto)}
          changed={pa.bonusImporto !== ea.bonusErogato}
          positive={bonusPct !== null && bonusPct > 0}
          delta={<DeltaBadge pct={bonusPct} />}
        />
      )}
    </div>
  );
}

// ─── Editable form ────────────────────────────────────────────────────────────

function FormField({
  label,
  type = "text",
  value,
  onChange,
  prefix,
  placeholder,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#999] uppercase tracking-wide">{label}</label>
      <div className="flex items-center bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl overflow-hidden focus-within:border-[#111] focus-within:bg-white transition-colors">
        {prefix && (
          <span className="px-3 py-2.5 text-sm font-medium text-[#BDBDBD] border-r border-[#E8E8E8] select-none shrink-0">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 text-sm font-semibold text-[#111] bg-transparent focus:outline-none placeholder:font-normal placeholder:text-[#BDBDBD] min-w-0"
        />
      </div>
      {hint && <p className="text-xs text-[#BDBDBD]">{hint}</p>}
    </div>
  );
}

const EMPTY_EA: EconomicsAttuale = {
  tipoContratto: "",
  livello: 0,
  dataInizio: "",
  ral: 0,
  indennita: 0,
  dataPrimoStaffing: "",
  bonusErogato: 0,
  jobProfile: null,
};

const EMPTY_PA: PropostaAumento = {
  profilo: null,
  sede: null,
  jobProfile: null,
  nuovaRal: null,
  ralMin: null,
  ralMax: null,
  nuovaIndennita: null,
  parametroIndennita: null,
  bonusImporto: null,
  bonusTipo: null,
  bonusPercentuale: null,
  note: null,
};

function EditableEconomicsAttuale({
  ea,
  dipendenteId,
  onSaved,
  forceEdit,
  onCancelCreate,
}: {
  ea: EconomicsAttuale | null;
  dipendenteId: string;
  onSaved: (updated: EconomicsAttuale) => void;
  forceEdit?: boolean;
  onCancelCreate?: () => void;
}) {
  const [editing, setEditing] = useState(forceEdit || !ea);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState<EconomicsAttuale>(ea ? { ...ea } : { ...EMPTY_EA });

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

  if (!editing && ea) return (
    <div className="space-y-4">
      {ea.jobProfile && (
        <div>
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-1">Job Profile</p>
          <p className="text-sm font-semibold text-[#1A1A1A]">{ea.jobProfile}</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "RAL",       value: formatEur(ea.ral) },
          { label: "Indennità", value: formatEur(ea.indennita, 1) },
          { label: "Bonus",     value: formatEur(ea.bonusErogato) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#F8F8F8] rounded-xl px-3.5 py-3">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-1">{label}</p>
            <p className="text-base font-bold text-[#111]">{value}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#555] bg-[#F5F5F5] rounded-lg hover:bg-[#EBEBEB] transition-colors">
        <Pencil className="w-3 h-3" />
        Modifica
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <FormField
        label="Job Profile"
        value={form.jobProfile ?? ""}
        onChange={(v) => setForm((f) => ({ ...f, jobProfile: v || null }))}
        placeholder="es. Senior Consultant"
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="RAL"       type="number" prefix="€" value={field("ral")}          onChange={(v) => set("ral", v)}          placeholder="0" />
        <FormField label="Indennità" type="number" prefix="€" value={field("indennita")}    onChange={(v) => set("indennita", v)}    placeholder="0" />
      </div>
      <FormField label="Bonus" type="number" prefix="€" value={field("bonusErogato")} onChange={(v) => set("bonusErogato", v)} placeholder="0" hint="Bonus erogato nella precedente valutazione" />
      <div className="flex items-center gap-3 pt-2 border-t border-[#F0F0F0]">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#111] text-white text-sm font-semibold rounded-xl hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <Check className="w-3.5 h-3.5" />
          {saving ? "Salvataggio…" : "Salva"}
        </button>
        {(ea || onCancelCreate) && (
          <button onClick={() => {
            if (onCancelCreate) { onCancelCreate(); return; }
            setForm({ ...ea! }); setEditing(false);
          }}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-[#555] bg-white border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-colors">
            <X className="w-3.5 h-3.5" />
            Annulla
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Editable proposta aumento ────────────────────────────────────────────────

function EditablePropostaAumento({
  pa,
  dipendenteId,
  onSaved,
  onCancel,
}: {
  pa: PropostaAumento | null;
  dipendenteId: string;
  onSaved: (updated: PropostaAumento) => void;
  onCancel?: () => void;
}) {
  const [form,   setForm]   = useState<PropostaAumento>(pa ? { ...pa } : { ...EMPTY_PA });
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof PropostaAumento>(key: K, raw: string) {
    const numericKeys = ["nuovaRal", "ralMin", "ralMax", "nuovaIndennita", "parametroIndennita", "bonusImporto", "bonusPercentuale"];
    setForm((f) => ({
      ...f,
      [key]: raw === "" ? null : numericKeys.includes(key) ? parseFloat(raw) || 0 : raw,
    }));
  }

  function fieldVal(key: keyof PropostaAumento): string {
    const v = form[key];
    return v === null || v === undefined ? "" : String(v);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/economics?dipendenteId=${dipendenteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propostaAumento: form }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSaved(updated.propostaAumento);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <FormField
        label="Nuovo Job Profile"
        value={fieldVal("jobProfile")}
        onChange={(v) => setField("jobProfile", v)}
        placeholder="es. Senior Manager"
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nuova RAL"       type="number" prefix="€" value={fieldVal("nuovaRal")}       onChange={(v) => setField("nuovaRal", v)}       placeholder="0" />
        <FormField label="Nuova indennità" type="number" prefix="€" value={fieldVal("nuovaIndennita")} onChange={(v) => setField("nuovaIndennita", v)} placeholder="0" />
      </div>
      <FormField label="Nuovo bonus" type="number" prefix="€" value={fieldVal("bonusImporto")} onChange={(v) => setField("bonusImporto", v)} placeholder="0" />

      <div className="flex items-center gap-3 pt-2 border-t border-[#F0F0F0]">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#111] text-white text-sm font-semibold rounded-xl hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <Check className="w-3.5 h-3.5" />
          {saving ? "Salvataggio…" : "Salva proposta"}
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

export default function EconomicsTab({ dipendenteId, isEditing }: Props) {
  const [data, setData]                       = useState<Economics | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [propostaOpen, setPropostaOpen]       = useState(false);
  const [editingProposta, setEditingProposta] = useState(false);
  const [ea, setEa]                           = useState<EconomicsAttuale | null>(null);
  const [pa, setPa]                           = useState<PropostaAumento | null>(null);
  const [creatingEa, setCreatingEa]           = useState(false);
  const celebratedRef                         = useRef(false);

  useEffect(() => {
    fetch(`/api/economics?dipendenteId=${dipendenteId}`)
      .then((r) => r.json())
      .then((d: Economics) => {
        setData(d);
        setEa(d?.economicsAttuale ?? null);
        setPa(d?.propostaAumento ?? null);
      })
      .finally(() => setLoading(false));
  }, [dipendenteId]);

  // Trigger celebrazione dopo il render, quando la proposta viene sbloccata
  useEffect(() => {
    if (!propostaOpen || celebratedRef.current) return;
    const paVal = data?.propostaAumento ?? null;
    const eaVal = ea;
    if (!paVal || !eaVal) return;
    const bo        = data?.bonus ?? null;
    const ralUp     = paVal.nuovaRal !== null && paVal.nuovaRal > eaVal.ral;
    const bonusPost = bo?.bonusErogato ?? paVal.bonusImporto;
    const bonusUp   = bonusPost !== null && bonusPost > eaVal.bonusErogato;
    if (ralUp || bonusUp) {
      celebratedRef.current = true;
      celebrate(ralUp && bonusUp);
    }
  }, [propostaOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  const bo = data?.bonus ?? null;

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
            {propostaOpen && pa && !isEditing ? "Dettaglio risorsa — comparazione" : "Economics prima della valutazione"}
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
          {!ea && !isEditing && !creatingEa ? (
            <div className="flex flex-col items-center justify-center min-h-32 gap-4 text-center">
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">Economics non ancora inseriti</p>
                <p className="text-xs text-[#999] mt-1">Inserisci i dati economici del dipendente</p>
              </div>
              <button
                onClick={() => setCreatingEa(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#444] bg-white border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Inserisci economics
              </button>
            </div>
          ) : propostaOpen && pa && !isEditing && !editingProposta ? (
            /* ─── Comparazione (read-only) ─── */
            <ComparisonView ea={ea!} pa={pa} bo={bo} />
          ) : (
            /* ─── Vista con modifica / creazione ─── */
            <>
              <EditableEconomicsAttuale
                ea={ea}
                dipendenteId={dipendenteId}
                onSaved={(updated) => { setEa(updated); setCreatingEa(false); }}
                forceEdit={(isEditing && !ea) || creatingEa}
                onCancelCreate={creatingEa ? () => setCreatingEa(false) : undefined}
              />
              {!propostaOpen && (ea || isEditing || creatingEa) && (
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

      {/* ── Proposta di aumento (editable o locked) ── */}
      {!propostaOpen && (ea || isEditing || creatingEa) && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden opacity-40 select-none pointer-events-none">
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#999]">
              <Lock className="w-4 h-4" />
            </div>
            <p className="font-semibold text-[#999] text-sm">Proposta di aumento RAL e cambio job profile</p>
          </div>
        </div>
      )}

      {/* ── Proposta form (quando aperta) ── */}
      {propostaOpen && (isEditing || !pa || editingProposta) && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F5F5F5]">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#666]">
              <ChevronRight className="w-4 h-4" />
            </div>
            <p className="font-semibold text-[#1A1A1A] text-sm">Proposta di aumento RAL e cambio job profile</p>
          </div>
          <div className="px-6 py-5">
            <EditablePropostaAumento
              pa={pa}
              dipendenteId={dipendenteId}
              onSaved={(updated) => {
                setPa(updated);
                setData((d) => d ? { ...d, propostaAumento: updated } : d);
                setEditingProposta(false);
              }}
              onCancel={editingProposta ? () => setEditingProposta(false) : undefined}
            />
          </div>
        </div>
      )}

      {/* ── Modifica proposta button (read-only comparazione) ── */}
      {propostaOpen && pa && !isEditing && !editingProposta && (
        <button
          onClick={() => setEditingProposta(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#444] bg-white border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Modifica proposta
        </button>
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
