"use client";

import { useEffect, useState } from "react";
import {
  Users, UserPlus, ClipboardList, ShieldCheck,
  GitBranch, CheckCircle2, ArrowRight, ArrowLeft, X,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  renderContent: () => React.ReactNode;
}

const STEPS: Step[] = [
  {
    icon: Users,
    title: "Benvenuto nell'HR Portal",
    renderContent: () => (
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-14 h-14 bg-[#111] rounded-2xl flex items-center justify-center shadow-none">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-[#111] text-base">HR Portal · Lipari</p>
          <p className="text-xs text-[#999] mt-0.5">Valutazione annuale 2025</p>
        </div>
        <p className="text-sm text-[#555] leading-relaxed max-w-xs">
          Gestisci le <strong className="text-[#111]">valutazioni annuali</strong> del tuo team
          — dai dati anagrafici agli economics, dall&apos;autovalutazione alla proposta di aumento.
        </p>
        <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
          {["Dipendenti", "Schede 7-step", "Economics", "Skill matrix"].map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold text-[#777] bg-[#F5F5F5] rounded-full px-3 py-1 border border-[#EBEBEB]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: UserPlus,
    title: "Aggiungi i tuoi dipendenti",
    renderContent: () => (
      <div className="space-y-4 text-sm text-[#555] leading-relaxed">
        <p>
          Usa il tasto <strong className="text-[#111]">+ Nuovo dipendente</strong> in basso nella
          lista per aggiungere ogni membro del team con nome, cognome, sede e job profile.
        </p>
        <div>
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-2">Job profile disponibili</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Junior", color: "bg-[#F0F0F0] text-[#666]" },
              { label: "C1", color: "bg-[#F0F0F0] text-[#666]" },
              { label: "C2", color: "bg-[#F0F0F0] text-[#666]" },
              { label: "SC1", color: "bg-[#111] text-white" },
              { label: "SC2", color: "bg-[#111] text-white" },
              { label: "SC3", color: "bg-[#111] text-white" },
            ].map(({ label, color }) => (
              <span key={label} className={`text-xs font-semibold px-3 py-1 rounded-full ${color}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-[#999]">
          Ogni dipendente aggiunto viene automaticamente assegnato al tuo team.
        </p>
      </div>
    ),
  },
  {
    icon: ClipboardList,
    title: "La scheda di valutazione",
    renderContent: () => (
      <div className="space-y-3 text-sm text-[#555] leading-relaxed">
        <p>
          Cliccando su un dipendente si apre la sua scheda, organizzata in{" "}
          <strong className="text-[#111]">7 step</strong> compilabili liberamente nel tempo:
        </p>
        <div className="space-y-1.5">
          {[
            { n: 1, label: "Sommario", sub: "note generali" },
            { n: 2, label: "Autovalutazione", sub: "percezione del dipendente" },
            { n: 3, label: "Valutazione cliente", sub: "feedback del progetto" },
            { n: 4, label: "Scheda riassuntiva", sub: "hard & soft skill" },
            { n: 5, label: "Skill matrix", sub: "competenze tecniche" },
            { n: 6, label: "Economics", sub: "RAL, indennità, proposta aumento" },
            { n: 7, label: "Riepilogo", sub: "visione d'insieme" },
          ].map(({ n, label, sub }) => (
            <div key={n} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#F7F7F7]">
              <div className="w-5 h-5 rounded-full bg-[#111] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {n}
              </div>
              <span className="text-xs font-semibold text-[#111]">{label}</span>
              <span className="text-xs text-[#BDBDBD] ml-auto">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Gli account valutatori",
    renderContent: () => (
      <div className="space-y-4 text-sm text-[#555] leading-relaxed">
        <p>
          Ogni account è un <strong className="text-[#111]">valutatore</strong> e vede solo i
          dipendenti del proprio team.
        </p>
        <p>
          Puoi <strong className="text-[#111]">collegare un account valutatore a un dipendente</strong>:
          vai in modifica del dipendente e seleziona l&apos;account dalla lista. Questo serve a
          costruire la gerarchia.
        </p>
        <div className="bg-[#F7F7F7] rounded-xl px-4 py-3 flex gap-3">
          <div className="text-lg shrink-0">💡</div>
          <p className="text-xs text-[#555]">
            Marco è nel tuo team ed è anche lui un valutatore con il suo account.
            Colleghi l&apos;account di Marco al suo profilo dipendente.
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: GitBranch,
    title: "Referenti di secondo livello",
    renderContent: () => (
      <div className="space-y-4 text-sm text-[#555] leading-relaxed">
        <p>
          Collegando un valutatore a un tuo dipendente, quel dipendente diventa un{" "}
          <strong className="text-[#111]">referente di secondo livello</strong>: vedi anche il suo team.
        </p>
        <div className="bg-[#F7F7F7] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#111] text-white text-xs font-bold flex items-center justify-center shrink-0">
              Tu
            </div>
            <div className="flex-1 h-px border-t border-dashed border-[#BDBDBD]" />
            <div className="w-8 h-8 rounded-xl bg-[#E4E4E4] text-[#111] text-xs font-bold flex items-center justify-center shrink-0">
              M
            </div>
            <span className="text-xs text-[#999]">Marco</span>
          </div>
          <div className="pl-10 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold flex items-center justify-center text-[#999]">A</div>
            <div className="w-6 h-6 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold flex items-center justify-center text-[#999]">B</div>
            <div className="w-6 h-6 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold flex items-center justify-center text-[#999]">C</div>
            <span className="text-xs text-[#BDBDBD]">team di Marco → visibile a te</span>
          </div>
        </div>
        <p className="text-xs text-[#999]">
          Visibilità a senso unico: tu vedi il team di Marco, Marco non vede il tuo.
        </p>
      </div>
    ),
  },
  {
    icon: CheckCircle2,
    title: "Tutto pronto!",
    renderContent: () => (
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-14 h-14 rounded-2xl bg-[#111] flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="font-bold text-[#111] text-base">Sei pronto a iniziare</p>
          <p className="text-xs text-[#999] mt-0.5">Ecco i passi consigliati</p>
        </div>
        <div className="w-full space-y-2 text-left">
          {[
            "Aggiungi i dipendenti del tuo team",
            "Se hai referenti, crea i loro account e collegali al profilo",
            "Apri le schede e compila le valutazioni step by step",
            "Inserisci i dati economics e la proposta di aumento",
          ].map((label, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2 rounded-xl bg-[#F7F7F7]">
              <div className="w-5 h-5 rounded-full bg-[#111] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <span className="text-xs text-[#555]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

interface Props {
  onClose: () => void;
}

export default function OnboardingWizard({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<"fwd" | "bwd">("fwd");
  const [animKey, setAnimKey] = useState(0);

  const isLast = step === STEPS.length - 1;
  const { icon: Icon, title, renderContent } = STEPS[step];

  const go = (next: number) => {
    setAnimDir(next > step ? "fwd" : "bwd");
    setAnimKey((k) => k + 1);
    setStep(next);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (step < STEPS.length - 1) go(step + 1);
        else onClose();
      }
      if (e.key === "ArrowLeft" && step > 0) go(step - 1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] w-full max-w-md flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#F3F3F3]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F5F5F5] rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#555]" />
              </div>
              <p className="font-bold text-[#111] text-sm leading-snug">{title}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-center text-[#BDBDBD] hover:text-[#111] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div
            key={animKey}
            style={{
              animation: `${animDir === "fwd" ? "slideInRight" : "slideInLeft"} 180ms ease both`,
            }}
            className="px-6 py-5 min-h-[260px]"
          >
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#F3F3F3] flex items-center justify-between gap-4">
            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => i <= step && i !== step && go(i)}
                  className={`rounded-full transition-all ${
                    i === step
                      ? "w-4 h-1.5 bg-[#111]"
                      : i < step
                      ? "w-1.5 h-1.5 bg-[#BDBDBD] cursor-pointer hover:bg-[#999]"
                      : "w-1.5 h-1.5 bg-[#E5E5E5] cursor-default"
                  }`}
                />
              ))}
              <span className="text-[10px] text-[#BDBDBD] ml-1 font-medium">
                {step + 1} / {STEPS.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => go(step - 1)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#666] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Indietro
                </button>
              )}
              <button
                onClick={() => isLast ? onClose() : go(step + 1)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#111] hover:bg-[#333] text-white rounded-xl transition-colors"
              >
                {isLast ? "Inizia" : "Avanti"}
                {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
