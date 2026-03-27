"use client";

import { useState } from "react";
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
      <div className="space-y-3 text-sm text-[#555] leading-relaxed">
        <p>
          Questo strumento è pensato per gestire le{" "}
          <strong className="text-[#111]">valutazioni annuali</strong> dei dipendenti Lipari —
          dai dati anagrafici agli economics, dall&apos;autovalutazione alla proposta di aumento.
        </p>
        <p>
          Il flusso è organizzato in{" "}
          <strong className="text-[#111]">schede individuali</strong>: ogni dipendente ha un
          percorso in 7 step che puoi compilare liberamente nel tempo.
        </p>
      </div>
    ),
  },
  {
    icon: UserPlus,
    title: "Aggiungi i tuoi dipendenti",
    renderContent: () => (
      <div className="space-y-3 text-sm text-[#555] leading-relaxed">
        <p>
          Dal pulsante <strong className="text-[#111]">&quot;Nuovo dipendente&quot;</strong> aggiungi
          ogni membro del team con nome, cognome, sede e job profile.
        </p>
        <div className="bg-[#F7F7F7] rounded-xl p-4 space-y-2">
          {["Junior", "C1 / C2", "SC1 / SC2 / SC3"].map((jp) => (
            <div key={jp} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#BDBDBD]" />
              <span className="text-xs text-[#666]">{jp}</span>
            </div>
          ))}
        </div>
        <p>
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
          <strong className="text-[#111]">7 step</strong>:
        </p>
        <div className="bg-[#F7F7F7] rounded-xl p-4 space-y-2">
          {[
            "Sommario — note generali",
            "Autovalutazione — percezione del dipendente",
            "Valutazione cliente — feedback del progetto",
            "Scheda riassuntiva — hard/soft skill",
            "Skill matrix — competenze tecniche",
            "Economics — RAL, indennità e proposta aumento",
            "Riepilogo — visione d'insieme",
          ].map((label, i) => (
            <div key={i} className="flex items-start gap-2.5">
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
  {
    icon: ShieldCheck,
    title: "Gli account valutatori",
    renderContent: () => (
      <div className="space-y-3 text-sm text-[#555] leading-relaxed">
        <p>
          Ogni account è un <strong className="text-[#111]">valutatore</strong> e vede solo i
          dipendenti del proprio team.
        </p>
        <p>
          Puoi <strong className="text-[#111]">collegare un account valutatore a un dipendente</strong>:
          vai in modifica del dipendente e seleziona l&apos;account dalla lista. Questo serve a
          costruire la gerarchia.
        </p>
        <div className="bg-[#F7F7F7] rounded-xl px-4 py-3 text-xs text-[#666]">
          Esempio: Marco è nel tuo team ed è anche lui un valutatore con il suo account. Colleghi
          l&apos;account di Marco al suo profilo dipendente.
        </div>
      </div>
    ),
  },
  {
    icon: GitBranch,
    title: "Referenti di secondo livello",
    renderContent: () => (
      <div className="space-y-3 text-sm text-[#555] leading-relaxed">
        <p>
          Collegando un valutatore a un tuo dipendente, quel dipendente diventa un{" "}
          <strong className="text-[#111]">referente di secondo livello</strong>: vedi anche il suo team.
        </p>
        <div className="bg-[#F7F7F7] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#111] text-white text-xs font-bold flex items-center justify-center">Tu</div>
            <div className="flex-1 h-px border-t border-dashed border-[#BDBDBD]" />
            <div className="w-7 h-7 rounded-lg bg-[#E4E4E4] text-xs font-bold flex items-center justify-center">M</div>
            <span className="text-xs text-[#999]">Marco (referente)</span>
          </div>
          <div className="pl-9 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#F0F0F0] text-[10px] font-bold flex items-center justify-center">A</div>
            <div className="w-5 h-5 rounded-full bg-[#F0F0F0] text-[10px] font-bold flex items-center justify-center">B</div>
            <span className="text-xs text-[#999]">Team di Marco (visibile a te)</span>
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
      <div className="space-y-3 text-sm text-[#555] leading-relaxed">
        <p>Hai tutto ciò che ti serve. Ecco i passi consigliati:</p>
        <div className="space-y-2">
          {[
            "Aggiungi i dipendenti del tuo team",
            "Se hai referenti, crea i loro account e collegali ai profili dipendente",
            "Apri le schede e compila le valutazioni step by step",
            "Inserisci i dati economics e la proposta di aumento",
          ].map((label, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full border-2 border-[#111] flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
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
  const isLast = step === STEPS.length - 1;
  const { icon: Icon, title, renderContent } = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-2xl border border-[#E8E8E8] w-full max-w-md flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#F3F3F3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#111] rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-white" />
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
        <div className="px-6 py-5 min-h-[220px]">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F3F3] flex items-center justify-between gap-4">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === step
                    ? "w-4 h-1.5 bg-[#111]"
                    : i < step
                    ? "w-1.5 h-1.5 bg-[#BDBDBD]"
                    : "w-1.5 h-1.5 bg-[#E5E5E5]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#666] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Indietro
              </button>
            )}
            <button
              onClick={() => isLast ? onClose() : setStep((s) => s + 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#111] hover:bg-[#333] text-white rounded-xl transition-colors"
            >
              {isLast ? "Inizia" : "Avanti"}
              {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
