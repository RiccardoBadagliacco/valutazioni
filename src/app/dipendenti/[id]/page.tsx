"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Check, ChevronRight, ShieldCheck } from "lucide-react";
import { Dipendente } from "@/types/dipendente";
import { Valutatore } from "@/types/valutatore";
import ValutazioneClienteTab from "@/components/profilo/ValutazioneClienteTab";
import SchedaRiassuntivaTab from "@/components/profilo/SchedaRiassuntivaTab";
import SkillMatrixTab from "@/components/profilo/SkillMatrixTab";
import EconomicsTab from "@/components/profilo/EconomicsTab";
import SommarioTab from "@/components/profilo/SommarioTab";
import AutovalutazioneTab from "@/components/profilo/AutovalutazioneTab";
import RiepilogoTab from "@/components/profilo/RiepilogoTab";

const STEPS = [
  { key: "sommario",            label: "Sommario" },
  { key: "autovalutazione",    label: "Autovalutazione" },
  { key: "valutazione-cliente", label: "Valutazione cliente" },
  { key: "scheda-riassuntiva", label: "Scheda riassuntiva" },
  { key: "skill-matrics",      label: "Skill matrix" },
  { key: "economics",          label: "Economics" },
  { key: "riepilogo",          label: "Riepilogo" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const LEVEL_BADGE: Record<string, string> = {
  Junior: "bg-[#F5F5F5] text-[#666]",
  C1:     "bg-[#F5F5F5] text-[#444]",
  C2:     "bg-[#EFEFEF] text-[#333]",
  SC1:    "bg-[#111] text-white",
  SC2:    "bg-[#111] text-white",
  SC3:    "bg-[#111] text-white",
};

function getInitials(nome: string, cognome: string) {
  return `${nome[0]}${cognome[0]}`.toUpperCase();
}

export default function ProfiloDipendente() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("mode") === "edit";
  const [dipendente, setDipendente]       = useState<Dipendente | null>(null);
  const [linkedValutatore, setLinkedValutatore] = useState<Valutatore | null>(null);
  const [specialFeatures, setSpecialFeatures]   = useState(false);
  const [activeStep, setActiveStep]       = useState<StepKey>("sommario");

  useEffect(() => {
    const loggedId = typeof window !== "undefined" ? localStorage.getItem("valutatoreId") : null;
    Promise.all([
      fetch("/api/dipendenti").then((r) => r.json()),
      fetch("/api/valutatori").then((r) => r.json()),
    ]).then(([dipendenti, valutatori]: [Dipendente[], Valutatore[]]) => {
      const found = dipendenti.find((d) => d.id === id);
      if (found) setDipendente(found);
      const linked = valutatori.find((v) => v.dipendenteId === id);
      setLinkedValutatore(linked ?? null);
      if (loggedId) {
        const loggedIn = valutatori.find((v) => v.id === loggedId);
        setSpecialFeatures(loggedIn?.specialFeatures === true);
      }
    });
  }, [id]);

  if (!dipendente) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="text-sm text-[#999]">Caricamento...</p>
      </div>
    );
  }

  const levelStyle   = LEVEL_BADGE[dipendente.jobprofile] ?? LEVEL_BADGE["Junior"];
  const activeIndex  = STEPS.findIndex((s) => s.key === activeStep);
  const currentStep  = STEPS[activeIndex];
  const isFirst      = activeIndex === 0;
  const isLast       = activeIndex === STEPS.length - 1;

  const goNext = () => { if (!isLast)  setActiveStep(STEPS[activeIndex + 1].key); };
  const goPrev = () => { if (!isFirst) setActiveStep(STEPS[activeIndex - 1].key); };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">

      {/* Top bar */}
      <header className="bg-white border-b border-[#EFEFEF] px-8 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#999] hover:text-[#111] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna all&apos;elenco
        </button>
      </header>

      {/* Profile header */}
      <div className="bg-white border-b border-[#EFEFEF] px-8 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EFEFEF] flex items-center justify-center text-xl font-bold text-[#1A1A1A] shrink-0">
            {getInitials(dipendente.nome, dipendente.cognome)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {dipendente.nome} {dipendente.cognome}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${levelStyle}`}>
                {dipendente.jobprofile}
              </span>
              <div className="flex items-center gap-1.5 text-sm text-[#999]">
                <MapPin className="w-3.5 h-3.5" />
                {dipendente.sede}
              </div>
              {linkedValutatore && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#111] text-white text-xs font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Manager · {linkedValutatore.dipendentiIds.length} {linkedValutatore.dipendentiIds.length === 1 ? "dipendente" : "dipendenti"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="max-w-4xl mx-auto mt-10">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const isActive    = step.key === activeStep;
              const isCompleted = i < activeIndex;

              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  {/* Step */}
                  <button
                    onClick={() => setActiveStep(step.key)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                        isActive
                          ? "bg-[#111] border-[#111] text-white"
                          : isCompleted
                          ? "bg-[#111] border-[#111] text-white"
                          : "bg-white border-[#DCDCDC] text-[#999] group-hover:border-[#999]"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? "text-[#111]"
                          : isCompleted
                          ? "text-[#111]"
                          : "text-[#999] group-hover:text-[#666]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-3 mb-5">
                      <div className="h-px relative overflow-hidden bg-[#EFEFEF]">
                        <div
                          className="absolute inset-y-0 left-0 bg-[#111] transition-all duration-300"
                          style={{ width: isCompleted ? "100%" : "0%" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <main className="max-w-4xl mx-auto px-8 py-8 space-y-4">
        {isEditing && (
          <div className="flex items-center justify-between bg-[#111] text-white rounded-2xl px-5 py-3">
            <p className="text-sm font-semibold">Modalità compilazione — inserisci i dati per questa valutazione</p>
            <button
              onClick={() => router.replace(`/dipendenti/${id}`)}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Esci
            </button>
          </div>
        )}
        {activeStep === "sommario" ? (
          <SommarioTab dipendenteId={dipendente.id} isEditing={isEditing} />
        ) : activeStep === "autovalutazione" ? (
          <AutovalutazioneTab dipendenteId={dipendente.id} isEditing={isEditing} />
        ) : activeStep === "valutazione-cliente" ? (
          <ValutazioneClienteTab dipendenteId={dipendente.id} isEditing={isEditing} />
        ) : activeStep === "scheda-riassuntiva" ? (
          <SchedaRiassuntivaTab dipendenteId={dipendente.id} isEditing={isEditing} />
        ) : activeStep === "skill-matrics" ? (
          <SkillMatrixTab dipendenteId={dipendente.id} />
        ) : activeStep === "economics" ? (
          <EconomicsTab dipendenteId={dipendente.id} isEditing={isEditing} specialFeatures={specialFeatures} />
        ) : activeStep === "riepilogo" ? (
          <RiepilogoTab dipendenteId={dipendente.id} specialFeatures={specialFeatures} />
        ) : (
          <div className="bg-white rounded-2xl border border-[#EFEFEF] p-8 min-h-52 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              Step {activeIndex + 1} — {currentStep.label}
            </p>
            <p className="text-xs text-[#999] mt-1">Sezione in costruzione</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#666] bg-white border border-[#E5E5E5] rounded-xl hover:border-[#999] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Precedente
          </button>
          <button
            onClick={goNext}
            disabled={isLast}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#111] text-white rounded-xl hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Avanti
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

    </div>
  );
}
