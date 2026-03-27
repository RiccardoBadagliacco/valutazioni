"use client";

import { useState } from "react";
import { X, Plus, Trash2, ChevronLeft, ChevronRight, Check, BookOpen, Brain, TrendingUp } from "lucide-react";
import { DriverValutazione, SchedaRiassuntiva } from "@/types/scheda";
import { Dipendente } from "@/types/dipendente";

interface Props {
  dipendente: Dipendente;
  onClose: () => void;
  onSave: (scheda: SchedaRiassuntiva) => Promise<void>;
}

const STEPS = ["Hard Skill", "Soft Skill", "Crescita", "Riepilogo"] as const;

const SCORE_LABELS: Record<number, string> = {
  1: "Insufficiente", 1.5: "Quasi sufficiente",
  2: "Parziale", 2.5: "Parziale+",
  3: "Adeguato", 3.5: "Adeguato+",
  4: "Buono", 4.5: "Molto buono",
  5: "Eccellente",
};

function scoreColor(s: number) {
  if (s >= 4.5) return "text-[#111]";
  if (s >= 3.5) return "text-[#444]";
  if (s >= 2.5) return "text-[#666]";
  if (s >= 1.5) return "text-orange-600";
  return "text-red-500";
}

function scoreBg(s: number) {
  if (s >= 4.5) return "bg-[#111] text-white";
  if (s >= 3.5) return "bg-[#EBEBEB] text-[#222]";
  if (s >= 2.5) return "bg-[#F5F5F5] text-[#666]";
  if (s >= 1.5) return "bg-[#FFF7ED] text-orange-700";
  return "bg-[#FEF2F2] text-red-600";
}

function emptyDriver(): DriverValutazione {
  return { nome: "", score: 3, commento: "" };
}

// ── DriverEditor ────────────────────────────────────────────────────────────

function DriverEditor({
  driver,
  index,
  onChange,
  onRemove,
}: {
  driver: DriverValutazione;
  index: number;
  onChange: (d: DriverValutazione) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-[#EFEFEF] rounded-2xl p-4 space-y-3 bg-[#FAFAFA]">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[#BDBDBD] w-5 shrink-0">{index + 1}.</span>
        <input
          type="text"
          placeholder="Nome competenza"
          value={driver.nome}
          onChange={(e) => onChange({ ...driver, nome: e.target.value })}
          className="flex-1 text-sm bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD]"
        />
        <button
          onClick={onRemove}
          className="w-8 h-8 rounded-lg hover:bg-[#FEF2F2] flex items-center justify-center text-[#BDBDBD] hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-[#BDBDBD] w-10 shrink-0">Score</span>
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          value={driver.score}
          onChange={(e) => onChange({ ...driver, score: Number(e.target.value) })}
          className="flex-1 accent-[#111] cursor-pointer"
        />
        <span className={`text-sm font-bold w-6 text-right shrink-0 ${scoreColor(driver.score)}`}>
          {driver.score % 1 === 0 ? `${driver.score}` : driver.score}
        </span>
      </div>
      <p className="text-xs text-[#BDBDBD] text-right pr-1">{SCORE_LABELS[driver.score]}</p>

      <textarea
        placeholder="Commento sul dipendente per questa competenza..."
        value={driver.commento}
        onChange={(e) => onChange({ ...driver, commento: e.target.value })}
        rows={3}
        className="w-full text-sm bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD] resize-none"
      />
    </div>
  );
}

// ── ReadOnlyDriver ───────────────────────────────────────────────────────────

function ReadOnlyDriver({ driver }: { driver: DriverValutazione }) {
  const pct = ((driver.score - 1) / 4) * 100;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-medium text-[#1A1A1A] truncate">{driver.nome || <span className="text-[#BDBDBD] italic">senza nome</span>}</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${scoreBg(driver.score)}`}>
            {driver.score % 1 === 0 ? `${driver.score}.0` : driver.score}
          </span>
        </div>
        <div className="h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div className="h-full bg-[#111] rounded-full" style={{ width: `${pct}%` }} />
        </div>
        {driver.commento && (
          <p className="text-xs text-[#999] mt-1.5 line-clamp-2">{driver.commento}</p>
        )}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export default function SchedaWizard({ dipendente, onClose, onSave }: Props) {
  const [step, setStep]               = useState(0);
  const [hardSkill, setHardSkill]     = useState<DriverValutazione[]>([emptyDriver()]);
  const [softSkill, setSoftSkill]     = useState<DriverValutazione[]>([emptyDriver()]);
  const [crescita, setCrescita]       = useState("");
  const [saving, setSaving]           = useState(false);

  const initials = `${dipendente.nome[0]}${dipendente.cognome[0]}`.toUpperCase();

  function updateDriver(
    list: DriverValutazione[],
    setList: (l: DriverValutazione[]) => void,
    idx: number,
    d: DriverValutazione
  ) {
    const next = [...list];
    next[idx] = d;
    setList(next);
  }

  function removeDriver(
    list: DriverValutazione[],
    setList: (l: DriverValutazione[]) => void,
    idx: number
  ) {
    setList(list.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    await onSave({
      dipendenteId: dipendente.id,
      hardSkill,
      softSkill,
      crescitaKnowledge: crescita.trim() ? { commento: crescita.trim() } : null,
    });
    setSaving(false);
  }

  const canNext =
    step === 0 ? hardSkill.length > 0 && hardSkill.every((d) => d.nome.trim()) :
    step === 1 ? softSkill.length > 0 && softSkill.every((d) => d.nome.trim()) :
    true;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#EFEFEF] w-full max-w-xl max-h-[90vh] flex flex-col shadow-xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F5F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F0F0F0] flex items-center justify-center text-xs font-bold text-[#1A1A1A]">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111]">
                {dipendente.nome} {dipendente.cognome}
              </p>
              <p className="text-xs text-[#999]">Nuova scheda riassuntiva</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-center text-[#999] hover:text-[#111] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Steps indicator ── */}
        <div className="flex items-center gap-0 px-6 pt-5 pb-4 shrink-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => i < step && setStep(i)}
                className="flex items-center gap-2 group"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step
                      ? "bg-[#111] text-white cursor-pointer"
                      : i === step
                      ? "bg-[#111] text-white"
                      : "bg-[#F0F0F0] text-[#BDBDBD]"
                  }`}
                >
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    i === step ? "text-[#111]" : i < step ? "text-[#666]" : "text-[#BDBDBD]"
                  }`}
                >
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < step ? "bg-[#111]" : "bg-[#EFEFEF]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">

          {/* Step 0 — Hard Skill */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-[#999]" />
                <p className="text-sm font-semibold text-[#111]">Hard Skill</p>
              </div>
              <p className="text-xs text-[#999] mb-3">
                Competenze professionali e tecniche. Aggiungi tutte quelle rilevanti.
              </p>
              {hardSkill.map((d, i) => (
                <DriverEditor
                  key={i}
                  driver={d}
                  index={i}
                  onChange={(nd) => updateDriver(hardSkill, setHardSkill, i, nd)}
                  onRemove={() => removeDriver(hardSkill, setHardSkill, i)}
                />
              ))}
              <button
                onClick={() => setHardSkill([...hardSkill, emptyDriver()])}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-[#999] hover:text-[#111] border border-dashed border-[#E0E0E0] hover:border-[#999] rounded-2xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Aggiungi competenza
              </button>
            </>
          )}

          {/* Step 1 — Soft Skill */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-[#999]" />
                <p className="text-sm font-semibold text-[#111]">Soft Skill</p>
              </div>
              <p className="text-xs text-[#999] mb-3">
                Competenze trasversali: relazionali, organizzative, di leadership e di pensiero.
              </p>
              {softSkill.map((d, i) => (
                <DriverEditor
                  key={i}
                  driver={d}
                  index={i}
                  onChange={(nd) => updateDriver(softSkill, setSoftSkill, i, nd)}
                  onRemove={() => removeDriver(softSkill, setSoftSkill, i)}
                />
              ))}
              <button
                onClick={() => setSoftSkill([...softSkill, emptyDriver()])}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-[#999] hover:text-[#111] border border-dashed border-[#E0E0E0] hover:border-[#999] rounded-2xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Aggiungi competenza
              </button>
            </>
          )}

          {/* Step 2 — Crescita */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#999]" />
                <p className="text-sm font-semibold text-[#111]">Crescita & Knowledge</p>
              </div>
              <p className="text-xs text-[#999] mb-3">
                Descrivi il contributo del dipendente alla community, le iniziative interne
                e l&apos;evoluzione delle sue competenze nel corso dell&apos;anno.
              </p>
              <textarea
                value={crescita}
                onChange={(e) => setCrescita(e.target.value)}
                placeholder="Nel corso dell'anno il dipendente ha..."
                rows={8}
                className="w-full text-sm bg-[#FAFAFA] border border-[#EFEFEF] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#999] placeholder:text-[#BDBDBD] resize-none"
              />
            </>
          )}

          {/* Step 3 — Riepilogo */}
          {step === 3 && (
            <>
              <p className="text-xs text-[#999] mb-4">
                Verifica i dati inseriti prima di salvare la scheda.
              </p>

              {/* Hard Skill */}
              <div className="bg-[#FAFAFA] border border-[#EFEFEF] rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#999]" />
                  <p className="text-xs font-semibold text-[#666] uppercase tracking-wide">Hard Skill</p>
                  <span className="text-xs text-[#BDBDBD]">({hardSkill.length})</span>
                </div>
                <div className="divide-y divide-[#F0F0F0]">
                  {hardSkill.map((d, i) => <ReadOnlyDriver key={i} driver={d} />)}
                </div>
              </div>

              {/* Soft Skill */}
              <div className="bg-[#FAFAFA] border border-[#EFEFEF] rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-3.5 h-3.5 text-[#999]" />
                  <p className="text-xs font-semibold text-[#666] uppercase tracking-wide">Soft Skill</p>
                  <span className="text-xs text-[#BDBDBD]">({softSkill.length})</span>
                </div>
                <div className="divide-y divide-[#F0F0F0]">
                  {softSkill.map((d, i) => <ReadOnlyDriver key={i} driver={d} />)}
                </div>
              </div>

              {/* Crescita */}
              {crescita.trim() && (
                <div className="bg-[#FAFAFA] border border-[#EFEFEF] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#999]" />
                    <p className="text-xs font-semibold text-[#666] uppercase tracking-wide">Crescita & Knowledge</p>
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">{crescita.trim()}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F5F5F5] shrink-0">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1.5 text-sm text-[#666] hover:text-[#111] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Annulla" : "Indietro"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="flex items-center gap-1.5 bg-[#111] hover:bg-[#333] disabled:bg-[#E0E0E0] disabled:text-[#BDBDBD] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              Avanti
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#111] hover:bg-[#333] disabled:bg-[#E0E0E0] disabled:text-[#BDBDBD] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              {saving ? "Salvataggio..." : "Salva scheda"}
              {!saving && <Check className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
