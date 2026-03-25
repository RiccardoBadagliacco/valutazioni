"use client";

import { useEffect, useRef, useState } from "react";
import { Autovalutazione } from "@/types/autovalutazione";
import { PenLine } from "lucide-react";

interface Props {
  dipendenteId: string;
}

// ─── Score helpers ─────────────────────────────────────────────────────────────

function scoreColors(s: number) {
  if (s === 0)  return { bar: "bg-[#DCDCDC]", text: "text-[#999]" };
  if (s >= 4.5) return { bar: "bg-[#111]",    text: "text-[#111]" };
  if (s >= 3.5) return { bar: "bg-[#555]",    text: "text-[#444]" };
  if (s >= 2.5) return { bar: "bg-[#BDBDBD]", text: "text-[#666]" };
  if (s >= 1.5) return { bar: "bg-orange-400",text: "text-orange-700" };
  return               { bar: "bg-red-400",   text: "text-red-600" };
}

function Stars({ value }: { value: number }) {
  const c = scoreColors(value);
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-5 h-5 ${i < value ? "text-[#111]" : "text-[#E0E0E0]"}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className={`ml-1 text-sm font-bold ${c.text}`}>{value} / 5</span>
    </div>
  );
}

function GridRow({ label, value }: { label: string; value: number }) {
  const c = scoreColors(value);
  const pct = value === 0 ? 0 : (value / 5) * 100;
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-[#F5F5F5] last:border-0">
      <p className="text-sm text-[#555] flex-1">{label}</p>
      <div className="flex items-center gap-3 w-44 shrink-0">
        <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-sm font-bold w-16 text-right ${c.text}`}>
          {value === 0 ? "non so" : `${value} / 5`}
        </span>
      </div>
    </div>
  );
}

// ─── Note tooltip ──────────────────────────────────────────────────────────────

interface NoteProps {
  qKey: string;
  notes: Record<string, string>;
  openNote: string | null;
  setOpenNote: (k: string | null) => void;
  onSave: (key: string, value: string) => void;
}

function NoteTooltip({ qKey, notes, onSave, setOpenNote }: Omit<NoteProps, "openNote">) {
  const [val, setVal] = useState(notes[qKey] ?? "");
  const taRef         = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setVal(notes[qKey] ?? ""); }, [notes, qKey]);
  useEffect(() => { taRef.current?.focus(); },   []);

  const save = () => {
    onSave(qKey, val.trim());
    if (!val.trim()) setOpenNote(null);
  };

  return (
    <div className="absolute right-0 top-8 z-50 w-72 bg-white border border-[#E0E0E0] rounded-2xl shadow-xl p-3">
      {/* caret */}
      <div className="absolute -top-[7px] right-[9px] w-3 h-3 bg-white border-l border-t border-[#E0E0E0] rotate-45" />
      <textarea
        ref={taRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={save}
        placeholder="Scrivi una nota..."
        rows={4}
        className="w-full text-sm text-[#1A1A1A] bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl px-3 py-2.5 resize-none placeholder:text-[#BDBDBD] focus:outline-none focus:border-[#111] transition-colors"
      />
      <p className="text-[10px] text-[#BDBDBD] mt-1.5 text-right">Salvato automaticamente</p>
    </div>
  );
}

// ─── Question header ───────────────────────────────────────────────────────────

function QHeader({ qKey, label, notes, openNote, setOpenNote, onSave }: NoteProps & { label: string }) {
  const hasNote = !!notes[qKey];
  const isOpen  = openNote === qKey;

  return (
    <div className="flex items-start gap-2">
      <span className="text-xs font-bold text-[#BDBDBD] mt-0.5 shrink-0">{qKey}</span>
      <p className="text-xs font-semibold text-[#888] flex-1">{label}</p>
      <div className="relative shrink-0">
        <button
          onClick={() => setOpenNote(isOpen ? null : qKey)}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
            hasNote ? "bg-[#111] text-white" : "text-[#BDBDBD] hover:text-[#666] hover:bg-[#F5F5F5]"
          }`}
        >
          <PenLine className="w-3 h-3" />
        </button>
        {isOpen && (
          <NoteTooltip qKey={qKey} notes={notes} onSave={onSave} setOpenNote={setOpenNote} />
        )}
      </div>
    </div>
  );
}

// ─── TextAnswer ────────────────────────────────────────────────────────────────

function TextAnswer({
  qKey, label, value, notes, openNote, setOpenNote, onSave,
}: {
  qKey: string; label: string; value: string | null;
  notes: Record<string, string>;
  openNote: string | null;
  setOpenNote: (k: string | null) => void;
  onSave: (key: string, value: string) => void;
}) {
  if (!value) return null;
  return (
    <div className="py-4 border-b border-[#F5F5F5] last:border-0">
      <QHeader qKey={qKey} label={label} notes={notes} openNote={openNote} setOpenNote={setOpenNote} onSave={onSave} />
      <p className="text-sm text-[#333] leading-relaxed mt-2">{value}</p>
    </div>
  );
}

// ─── SectionCard ───────────────────────────────────────────────────────────────

function SectionCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
        <span className="text-xs font-bold text-[#BDBDBD]">{number}</span>
        <p className="font-semibold text-[#1A1A1A] text-sm">{title}</p>
      </div>
      <div className="px-6 py-4 space-y-0">{children}</div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AutovalutazioneTab({ dipendenteId }: Props) {
  const [data, setData]         = useState<Autovalutazione | null>(null);
  const [notes, setNotes]       = useState<Record<string, string>>({});
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/autovalutazione?dipendenteId=${dipendenteId}`).then((r) => r.json()),
      fetch(`/api/autovalutazione-note?dipendenteId=${dipendenteId}`).then((r) => r.json()),
    ]).then(([av, noteData]) => {
      setData(av);
      setNotes(noteData?.note ?? {});
    }).finally(() => setLoading(false));
  }, [dipendenteId]);

  const handleSave = (key: string, value: string) => {
    setNotes((prev) => {
      const updated = { ...prev };
      if (value) updated[key] = value;
      else delete updated[key];
      return updated;
    });
    fetch(`/api/autovalutazione-note?dipendenteId=${dipendenteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!value) setOpenNote(null);
  };

  const noteProps = { notes, openNote, setOpenNote, onSave: handleSave };

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFEFEF] p-8 flex flex-col items-center justify-center min-h-52 text-center">
        <p className="text-sm font-semibold text-[#1A1A1A]">Autovalutazione non disponibile</p>
        <p className="text-xs text-[#999] mt-1">Il dipendente non ha ancora compilato il questionario</p>
      </div>
    );
  }

  const { overview, progetto, nuovoProgetto, attivitaLipari, equilibrio, sviluppoProfessionale } = data;

  return (
    <div className="space-y-4">

      {/* ── 1. Overview ── */}
      <SectionCard number="01" title="Overview">
        <div className="py-3 border-b border-[#F5F5F5]">
          <QHeader qKey="Q3" label="Complessivamente quanto ritieni stimolante il tuo lavoro?" {...noteProps} />
          <div className="mt-3"><Stars value={overview.stimolante} /></div>
        </div>

        <div className="pt-3">
          <QHeader qKey="Q4" label="Rispetto ai punti indicati di seguito, quanto la tua percezione è positiva?" {...noteProps} />
          <div className="mt-3">
            <GridRow label="Performance progettuali"                         value={overview.percezione.performanceProgettuali} />
            <GridRow label="Rapporto con la Lipari"                          value={overview.percezione.rapportoLipari} />
            <GridRow label="Percorso di crescita"                            value={overview.percezione.percorsoCrescita} />
            <GridRow label="Relazione coi colleghi"                          value={overview.percezione.relazioneColleghi} />
            <GridRow label="Partecipazione a Community / LdS e iniziative"  value={overview.percezione.partecipazioneCommunity} />
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Progetto ── */}
      <SectionCard number="02" title="Progetto">
        <div className="py-3 border-b border-[#F5F5F5]">
          <QHeader qKey="Q5" label="Quanto le attività progettuali ti stanno facendo crescere rispetto ai driver della Skill Matrix?" {...noteProps} />
          <div className="mt-3"><Stars value={progetto.crescitaSkillMatrix} /></div>
        </div>

        <TextAnswer qKey="Q6" label="Driver su cui sei cresciuto/a maggiormente" value={progetto.crescitaSkillMatrixCommento} {...noteProps} />

        <div className="py-3 border-b border-[#F5F5F5]">
          <QHeader qKey="Q7" label="In quale misura pensi di aver raggiunto gli obiettivi di performance progettuali?" {...noteProps} />
          <div className="mt-3"><Stars value={progetto.raggiungimentoObiettiviProgetto} /></div>
        </div>

        <div className="py-3 border-b border-[#F5F5F5]">
          <QHeader qKey="Q8" label="Quanto sei soddisfatto/a delle esperienze progettuali dello scorso anno?" {...noteProps} />
          <div className="mt-3"><Stars value={progetto.soddisfazioneEsperienze} /></div>
        </div>

        <TextAnswer qKey="Q9" label="Commento sulle esperienze progettuali" value={progetto.soddisfazioneEsperienzeCommento} {...noteProps} />
      </SectionCard>

      {/* ── 3. Nuovo Progetto / Cliente ── */}
      <SectionCard number="03" title="Nuovo Progetto / Cliente">
        <div className="py-3 border-b border-[#F5F5F5]">
          <QHeader qKey="Q10" label="Sei stato/a staffato/a in un nuovo progetto / Cliente nel corso dell'anno precedente?" {...noteProps} />
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${nuovoProgetto.staffato ? "bg-[#111] text-white" : "bg-[#F5F5F5] text-[#666]"}`}>
              {nuovoProgetto.staffato ? "Sì" : "No"}
            </span>
          </div>
        </div>

        {nuovoProgetto.staffato && (
          <>
            <TextAnswer qKey="Q11" label="Elementi di complessità nella fase di avvio"                      value={nuovoProgetto.complessitaAvvio} {...noteProps} />
            <TextAnswer qKey="Q12" label="Hai ricevuto adeguato supporto nella fase iniziale? Da chi?"      value={nuovoProgetto.supportoRicevuto} {...noteProps} />
            <TextAnswer qKey="Q13" label="Hai ricevuto gli strumenti necessari per il percorso lavorativo?" value={nuovoProgetto.strumentiDisponibili} {...noteProps} />
          </>
        )}
      </SectionCard>

      {/* ── 4. Attività Lipari ── */}
      <SectionCard number="04" title="Attività Lipari">
        <div className="py-3 border-b border-[#F5F5F5]">
          <QHeader qKey="Q14" label="Quanto è importante per te l'appartenenza alla Community / Linea di Servizio?" {...noteProps} />
          <div className="mt-3"><Stars value={attivitaLipari.importanzaCommunity} /></div>
        </div>

        <div className="py-3 border-b border-[#F5F5F5]">
          <QHeader qKey="Q15" label="Quanto ritieni utile il ruolo della Community / LdS sui seguenti driver?" {...noteProps} />
          <div className="mt-3">
            <GridRow label="Crescita professionale"                     value={attivitaLipari.utileCommunity.crescitaProfessionale} />
            <GridRow label="Comunicazioni operative interne"            value={attivitaLipari.utileCommunity.comunicazioniOperative} />
            <GridRow label="Comunicazione strategie / nuove iniziative" value={attivitaLipari.utileCommunity.comunicazioneStrategie} />
            <GridRow label="Formazione"                                 value={attivitaLipari.utileCommunity.formazione} />
            <GridRow label="Gestione problematiche progettuali"         value={attivitaLipari.utileCommunity.gestioneProblematiche} />
          </div>
        </div>

        <div className="py-3 border-b border-[#F5F5F5]">
          <QHeader qKey="Q16" label="Qualora avessi un ruolo di responsabilità, quanto ti ha fatto crescere rispetto ai driver della Skill Matrix?" {...noteProps} />
          <div className="mt-3">
            {attivitaLipari.ruoloResponsabilita !== null
              ? <Stars value={attivitaLipari.ruoloResponsabilita} />
              : <p className="text-sm text-[#BDBDBD] italic">Nessuna risposta</p>
            }
          </div>
        </div>

        <TextAnswer qKey="Q17" label="Commento su attività di responsabilità"  value={attivitaLipari.ruoloResponsabilitaCommento} {...noteProps} />
        <TextAnswer qKey="Q18" label="Attività Lipari che ti ha motivato di più" value={attivitaLipari.attivitaPiuMotivante} {...noteProps} />

        <div className="pt-3">
          <QHeader qKey="Q19" label="In quale misura pensi di aver raggiunto gli obiettivi di performance in ambito Lipari?" {...noteProps} />
          <div className="mt-3"><Stars value={attivitaLipari.raggiungimentoObiettiviLipari} /></div>
        </div>
      </SectionCard>

      {/* ── 5. Equilibrio e benessere professionale ── */}
      <SectionCard number="05" title="Equilibrio e benessere professionale">
        <div className="py-3 border-b border-[#F5F5F5]">
          <QHeader qKey="Q20" label="Rispetto al rapporto tra lavoro, crescita professionale e benessere, quale affermazione ti rappresenta?" {...noteProps} />
          <div className="bg-[#F5F5F5] rounded-xl px-4 py-3 mt-3">
            <p className="text-sm text-[#1A1A1A] leading-relaxed">{equilibrio.benessere}</p>
          </div>
        </div>

        <TextAnswer qKey="Q21" label="Punti di riferimento tecnici e per le competenze" value={equilibrio.riferimentiTecnici}   {...noteProps} />
        <TextAnswer qKey="Q22" label="Punti di riferimento per il benessere in azienda" value={equilibrio.riferimentiBenessere} {...noteProps} />
      </SectionCard>

      {/* ── 6. Sviluppo professionale ── */}
      <SectionCard number="06" title="Sviluppo professionale">
        <TextAnswer qKey="Q23" label="Punti di forza consolidati"                               value={sviluppoProfessionale.puntiDiForza}          {...noteProps} />
        <TextAnswer qKey="Q24" label="Percorso di automiglioramento avviato"                    value={sviluppoProfessionale.automiglioramento}      {...noteProps} />
        <TextAnswer qKey="Q25" label="Di cosa necessiti per esprimere il tuo massimo potenziale?" value={sviluppoProfessionale.necessitaPotenziale}  {...noteProps} />
        <TextAnswer qKey="Q26" label="Consapevolezza sul futuro professionale"                  value={sviluppoProfessionale.consapevolezzaFuturo}   {...noteProps} />
        <TextAnswer qKey="Q27" label="Competenze che il mercato richiede e vuoi sviluppare"     value={sviluppoProfessionale.competenzeDaSviluppare} {...noteProps} />
      </SectionCard>

    </div>
  );
}
