"use client";

import { useEffect, useRef, useState } from "react";
import { Autovalutazione } from "@/types/autovalutazione";
import { PenLine, Check, X, Pencil } from "lucide-react";

interface Props {
  dipendenteId: string;
  isEditing?: boolean;
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

// ─── Star picker ───────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 mt-2">
      {[0, 1, 2, 3, 4, 5].map((n) => (
        n === 0 ? (
          <button
            key={n}
            onClick={() => onChange(0)}
            className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
              value === 0 ? "bg-[#111] text-white border-[#111]" : "border-[#E5E5E5] text-[#999] hover:border-[#999]"
            }`}
          >
            non so
          </button>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
              value === n ? "bg-[#111] text-white" : "bg-[#F5F5F5] text-[#666] hover:bg-[#E5E5E5]"
            }`}
          >
            {n}
          </button>
        )
      ))}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-[#F5F5F5] last:border-0">
      <p className="text-xs font-semibold text-[#888]">{label}</p>
      {children}
    </div>
  );
}

function FormTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Scrivi qui..."}
      rows={3}
      className="w-full mt-2 text-sm text-[#1A1A1A] bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-3 py-2.5 resize-none placeholder:text-[#BDBDBD] focus:outline-none focus:border-[#111] transition-colors"
    />
  );
}

// benessere options for Q20
const BENESSERE_OPTIONS = [
  "Il lavoro che svolgo correla positivamente sulla mia crescita professionale e sul mio benessere",
  "Il lavoro che svolgo correla positivamente sulla mia crescita professionale, ma incide negativamente sul mio benessere",
  "Il lavoro che svolgo incide positivamente sul mio benessere, ma non correla positivamente sulla mia crescita professionale",
  "Il lavoro che svolgo non mi soddisfa né professionalmente né in termini di benessere",
];

function CreateAutovalutazioneForm({
  dipendenteId,
  initialData,
  onSaved,
  onCancel,
}: {
  dipendenteId: string;
  initialData?: Autovalutazione;
  onSaved: (data: Autovalutazione) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<Omit<Autovalutazione, "dipendenteId">>(initialData ? (({ dipendenteId: _id, ...rest }) => rest)(initialData) : {
    dataCompilazione: new Date().toISOString().slice(0, 10),
    overview: {
      stimolante: 3,
      percezione: {
        performanceProgettuali: 3,
        rapportoLipari: 3,
        percorsoCrescita: 3,
        relazioneColleghi: 3,
        partecipazioneCommunity: 3,
      },
    },
    progetto: {
      crescitaSkillMatrix: 3,
      crescitaSkillMatrixCommento: "",
      raggiungimentoObiettiviProgetto: 3,
      soddisfazioneEsperienze: 3,
      soddisfazioneEsperienzeCommento: "",
    },
    nuovoProgetto: {
      staffato: false,
      complessitaAvvio: null,
      supportoRicevuto: null,
      strumentiDisponibili: null,
    },
    attivitaLipari: {
      importanzaCommunity: 3,
      utileCommunity: {
        crescitaProfessionale: 3,
        comunicazioniOperative: 3,
        comunicazioneStrategie: 3,
        formazione: 3,
        gestioneProblematiche: 3,
      },
      ruoloResponsabilita: null,
      ruoloResponsabilitaCommento: null,
      attivitaPiuMotivante: "",
      raggiungimentoObiettiviLipari: 3,
    },
    equilibrio: {
      benessere: BENESSERE_OPTIONS[0],
      riferimentiTecnici: "",
      riferimentiBenessere: "",
    },
    sviluppoProfessionale: {
      puntiDiForza: "",
      automiglioramento: "",
      necessitaPotenziale: "",
      consapevolezzaFuturo: "",
      competenzeDaSviluppare: "",
    },
  });
  const [saving, setSaving] = useState(false);

  function setOverview<K extends keyof typeof form.overview>(key: K, val: typeof form.overview[K]) {
    setForm((f) => ({ ...f, overview: { ...f.overview, [key]: val } }));
  }
  function setPercezione(key: keyof typeof form.overview.percezione, val: number) {
    setForm((f) => ({ ...f, overview: { ...f.overview, percezione: { ...f.overview.percezione, [key]: val } } }));
  }
  function setProgetto<K extends keyof typeof form.progetto>(key: K, val: typeof form.progetto[K]) {
    setForm((f) => ({ ...f, progetto: { ...f.progetto, [key]: val } }));
  }
  function setNuovoProgetto<K extends keyof typeof form.nuovoProgetto>(key: K, val: typeof form.nuovoProgetto[K]) {
    setForm((f) => ({ ...f, nuovoProgetto: { ...f.nuovoProgetto, [key]: val } }));
  }
  function setAttivita<K extends keyof typeof form.attivitaLipari>(key: K, val: typeof form.attivitaLipari[K]) {
    setForm((f) => ({ ...f, attivitaLipari: { ...f.attivitaLipari, [key]: val } }));
  }
  function setUtile(key: keyof typeof form.attivitaLipari.utileCommunity, val: number) {
    setForm((f) => ({ ...f, attivitaLipari: { ...f.attivitaLipari, utileCommunity: { ...f.attivitaLipari.utileCommunity, [key]: val } } }));
  }
  function setEquilibrio<K extends keyof typeof form.equilibrio>(key: K, val: typeof form.equilibrio[K]) {
    setForm((f) => ({ ...f, equilibrio: { ...f.equilibrio, [key]: val } }));
  }
  function setSviluppo<K extends keyof typeof form.sviluppoProfessionale>(key: K, val: string) {
    setForm((f) => ({ ...f, sviluppoProfessionale: { ...f.sviluppoProfessionale, [key]: val } }));
  }

  async function save() {
    setSaving(true);
    try {
      const body: Autovalutazione = { dipendenteId, ...form };
      const res = await fetch("/api/autovalutazione", {
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

      {/* ── Sezione 2 — Overview ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
          <span className="text-xs font-bold text-[#BDBDBD]">Sezione 2</span>
          <p className="font-semibold text-[#1A1A1A] text-sm">Overview</p>
        </div>
        <div className="px-6 py-4 space-y-0">
          <FormField label="3. Complessivamente quanto ritieni stimolante il tuo lavoro?">
            <div className="flex items-center justify-between mt-1 mb-1">
              <span className="text-xs text-[#BDBDBD]">Per niente</span>
              <span className="text-xs text-[#BDBDBD]">Moltissimo</span>
            </div>
            <StarPicker value={form.overview.stimolante} onChange={(v) => setOverview("stimolante", v)} />
          </FormField>
          <FormField label="4. Rispetto ai punti indicati di seguito, quanto la tua percezione è positiva?">
            <p className="text-xs text-[#BDBDBD] mt-1 mb-2">Indica un punteggio da 1 a 5, in cui 0 = non so/non ho aderito, 1 = per niente positiva, 5 = pienamente positiva</p>
            {([
              ["performanceProgettuali", "Performance progettuali"],
              ["rapportoLipari",         "Rapporto con la Lipari"],
              ["percorsoCrescita",       "Percorso di crescita"],
              ["relazioneColleghi",      "Relazione coi colleghi"],
              ["partecipazioneCommunity","Partecipazione a Community / LdS e iniziative"],
            ] as const).map(([k, label]) => (
              <div key={k} className="mt-3">
                <p className="text-xs font-medium text-[#555]">{label}</p>
                <StarPicker value={form.overview.percezione[k]} onChange={(v) => setPercezione(k, v)} />
              </div>
            ))}
          </FormField>
        </div>
      </div>

      {/* ── Sezione 3 — Progetto ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
          <span className="text-xs font-bold text-[#BDBDBD]">Sezione 3</span>
          <p className="font-semibold text-[#1A1A1A] text-sm">Progetto</p>
        </div>
        <div className="px-6 py-4 space-y-0">
          <FormField label="5. Quanto le attività progettuali ti stanno facendo crescere professionalmente rispetto ai driver esplicitati nella Skill Matrix ricevuta dal tuo Referente di Community / Linea di Servizio?">
            <div className="flex items-center justify-between mt-1 mb-1">
              <span className="text-xs text-[#BDBDBD]">Per niente</span>
              <span className="text-xs text-[#BDBDBD]">Moltissimo</span>
            </div>
            <StarPicker value={form.progetto.crescitaSkillMatrix} onChange={(v) => setProgetto("crescitaSkillMatrix", v)} />
          </FormField>
          <FormField label="6. Scrivi un breve commento, indicando i principali driver sui quali ritieni di essere cresciuto/a maggiormente">
            <FormTextarea value={form.progetto.crescitaSkillMatrixCommento} onChange={(v) => setProgetto("crescitaSkillMatrixCommento", v)} />
          </FormField>
          <FormField label="7. Facendo riferimento alla scheda «Obiettivi di Performance» ricevuta dal tuo Referente di Community / Linea di Servizio, in quale misura pensi di essere riuscito/a a raggiungere i driver previsti in ambito progettuale?">
            <div className="flex items-center justify-between mt-1 mb-1">
              <span className="text-xs text-[#BDBDBD]">Per niente</span>
              <span className="text-xs text-[#BDBDBD]">Moltissimo</span>
            </div>
            <StarPicker value={form.progetto.raggiungimentoObiettiviProgetto} onChange={(v) => setProgetto("raggiungimentoObiettiviProgetto", v)} />
          </FormField>
          <FormField label="8. Quanto sei soddisfatto/a delle esperienze progettuali che ti hanno coinvolto nello scorso anno?">
            <div className="flex items-center justify-between mt-1 mb-1">
              <span className="text-xs text-[#BDBDBD]">Per niente</span>
              <span className="text-xs text-[#BDBDBD]">Moltissimo</span>
            </div>
            <StarPicker value={form.progetto.soddisfazioneEsperienze} onChange={(v) => setProgetto("soddisfazioneEsperienze", v)} />
          </FormField>
          <FormField label="9. Scrivi un breve commento">
            <FormTextarea value={form.progetto.soddisfazioneEsperienzeCommento} onChange={(v) => setProgetto("soddisfazioneEsperienzeCommento", v)} />
          </FormField>
        </div>
      </div>

      {/* ── Sezione 4 — Nuovo Progetto / Cliente ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
          <span className="text-xs font-bold text-[#BDBDBD]">Sezione 4</span>
          <p className="font-semibold text-[#1A1A1A] text-sm">Nuovo Progetto / Cliente</p>
        </div>
        <div className="px-6 py-4 space-y-0">
          <FormField label="10. Sei stato/a staffato/a in un nuovo progetto / Cliente nel corso dell'anno precedente?">
            <div className="flex gap-2 mt-2">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  onClick={() => setNuovoProgetto("staffato", v)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${
                    form.nuovoProgetto.staffato === v ? "bg-[#111] text-white border-[#111]" : "border-[#E5E5E5] text-[#666] hover:border-[#999]"
                  }`}
                >
                  {v ? "Sì" : "No"}
                </button>
              ))}
            </div>
          </FormField>
        </div>
      </div>

      {/* ── Sezione 5 — Esperienza nel nuovo Progetto / Cliente (condizionale) ── */}
      {form.nuovoProgetto.staffato && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
            <span className="text-xs font-bold text-[#BDBDBD]">Sezione 5</span>
            <p className="font-semibold text-[#1A1A1A] text-sm">Esperienza nel nuovo Progetto / Cliente</p>
          </div>
          <div className="px-6 py-4 space-y-0">
            <FormField label="11. Quali sono stati eventuali elementi di complessità che hanno caratterizzato la fase di avvio progettuale?">
              <FormTextarea value={form.nuovoProgetto.complessitaAvvio ?? ""} onChange={(v) => setNuovoProgetto("complessitaAvvio", v || null)} />
            </FormField>
            <FormField label="12. Ritieni di aver ricevuto adeguato supporto nella fase iniziale della tua attività progettuale? Da chi?">
              <FormTextarea value={form.nuovoProgetto.supportoRicevuto ?? ""} onChange={(v) => setNuovoProgetto("supportoRicevuto", v || null)} />
            </FormField>
            <FormField label="13. Senti di aver ricevuto gli strumenti necessari per affrontare il tuo percorso lavorativo?">
              <FormTextarea value={form.nuovoProgetto.strumentiDisponibili ?? ""} onChange={(v) => setNuovoProgetto("strumentiDisponibili", v || null)} />
            </FormField>
          </div>
        </div>
      )}

      {/* ── Sezione 6 — Attività Lipari ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
          <span className="text-xs font-bold text-[#BDBDBD]">Sezione 6</span>
          <p className="font-semibold text-[#1A1A1A] text-sm">Attività Lipari</p>
        </div>
        <div className="px-6 py-4 space-y-0">
          <FormField label="14. Quanto è importante per te l'appartenenza alla Community / Linea di Servizio?">
            <div className="flex items-center justify-between mt-1 mb-1">
              <span className="text-xs text-[#BDBDBD]">Per niente</span>
              <span className="text-xs text-[#BDBDBD]">Moltissimo</span>
            </div>
            <StarPicker value={form.attivitaLipari.importanzaCommunity} onChange={(v) => setAttivita("importanzaCommunity", v)} />
          </FormField>
          <FormField label="15. Quanto ritieni utile il ruolo della Community / Linea di Servizio sui seguenti driver?">
            <p className="text-xs text-[#BDBDBD] mt-1 mb-2">Indica un punteggio da 1 a 5, in cui 0 = non so/non ho aderito, 1 = per niente positiva, 5 = pienamente positiva</p>
            {([
              ["crescitaProfessionale",  "Crescita professionale"],
              ["comunicazioniOperative", "Comunicazioni operative interne"],
              ["comunicazioneStrategie", "Comunicazione strategie / nuove iniziative"],
              ["formazione",             "Formazione"],
              ["gestioneProblematiche",  "Gestione problematiche progettuali"],
            ] as const).map(([k, label]) => (
              <div key={k} className="mt-3">
                <p className="text-xs font-medium text-[#555]">{label}</p>
                <StarPicker value={form.attivitaLipari.utileCommunity[k]} onChange={(v) => setUtile(k, v)} />
              </div>
            ))}
          </FormField>
          <FormField label="16. Qualora avessi un ruolo di responsabilità o avessi deciso di svolgere attività della Community / Linea di Servizio, quanto ti hanno fatto crescere professionalmente rispetto ai driver esplicitati nella Skill Matrix?">
            <p className="text-xs text-[#BDBDBD] mt-1 mb-1">Facoltativo</p>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#BDBDBD]">Per niente</span>
              <span className="text-xs text-[#BDBDBD]">Moltissimo</span>
            </div>
            <StarPicker
              value={form.attivitaLipari.ruoloResponsabilita ?? 0}
              onChange={(v) => setAttivita("ruoloResponsabilita", v === 0 ? null : v)}
            />
          </FormField>
          <FormField label="17. Scrivi un breve commento, indicando i principali driver sui quali ritieni di essere cresciuto/a maggiormente attraverso tali attività">
            <p className="text-xs text-[#BDBDBD] mt-1 mb-1">Facoltativo</p>
            <FormTextarea value={form.attivitaLipari.ruoloResponsabilitaCommento ?? ""} onChange={(v) => setAttivita("ruoloResponsabilitaCommento", v || null)} />
          </FormField>
          <FormField label="18. Fra le eventuali attività Lipari in cui sei stato coinvolto/a durante l'anno scorso (Community / Linea di Servizio, presenza in ufficio, formazione, attività di destaffing, business, …), quale ti ha motivato di più e hai ritenuto più importanti per la tua crescita?">
            <FormTextarea value={form.attivitaLipari.attivitaPiuMotivante} onChange={(v) => setAttivita("attivitaPiuMotivante", v)} />
          </FormField>
          <FormField label="19. Facendo riferimento alla scheda «Obiettivi di Performance» ricevuta dal tuo Referente di Community / Linea di Servizio, in quale misura pensi di essere riuscito/a a raggiungere i driver previsti in ambito Lipari?">
            <div className="flex items-center justify-between mt-1 mb-1">
              <span className="text-xs text-[#BDBDBD]">Per niente</span>
              <span className="text-xs text-[#BDBDBD]">Moltissimo</span>
            </div>
            <StarPicker value={form.attivitaLipari.raggiungimentoObiettiviLipari} onChange={(v) => setAttivita("raggiungimentoObiettiviLipari", v)} />
          </FormField>
        </div>
      </div>

      {/* ── Sezione 7 — Equilibrio e benessere professionale ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
          <span className="text-xs font-bold text-[#BDBDBD]">Sezione 7</span>
          <p className="font-semibold text-[#1A1A1A] text-sm">Equilibrio e benessere professionale</p>
        </div>
        <div className="px-6 py-4 space-y-0">
          <FormField label="20. Rispetto al rapporto tra lavoro, crescita professionale e benessere, quale delle seguenti affermazioni meglio ti rappresenta">
            <div className="flex flex-col gap-2 mt-2">
              {BENESSERE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setEquilibrio("benessere", opt)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                    form.equilibrio.benessere === opt ? "bg-[#111] text-white border-[#111]" : "border-[#E5E5E5] text-[#555] hover:border-[#999]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="21. Chi sono i tuoi punti di riferimento in termini di strumenti, sviluppo competenze tecniche e supporto nel percorso in consulenza?">
            <FormTextarea value={form.equilibrio.riferimentiTecnici} onChange={(v) => setEquilibrio("riferimentiTecnici", v)} />
          </FormField>
          <FormField label="22. Chi sono i tuoi punti di riferimento per quanto riguarda il tuo benessere al lavoro e in azienda?">
            <FormTextarea value={form.equilibrio.riferimentiBenessere} onChange={(v) => setEquilibrio("riferimentiBenessere", v)} />
          </FormField>
        </div>
      </div>

      {/* ── Sezione 8 — Sviluppo professionale ── */}
      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F0]">
          <span className="text-xs font-bold text-[#BDBDBD]">Sezione 8</span>
          <p className="font-semibold text-[#1A1A1A] text-sm">Sviluppo professionale</p>
        </div>
        <div className="px-6 py-4 space-y-0">
          <FormField label="23. Quali punti di forza di te stesso/a pensi di avere consolidato finora?">
            <FormTextarea value={form.sviluppoProfessionale.puntiDiForza} onChange={(v) => setSviluppo("puntiDiForza", v)} />
          </FormField>
          <FormField label="24. Su quali aspetti hai iniziato (o ti aspetti di dover iniziare) un percorso di automiglioramento?">
            <FormTextarea value={form.sviluppoProfessionale.automiglioramento} onChange={(v) => setSviluppo("automiglioramento", v)} />
          </FormField>
          <FormField label="25. Di cosa necessiti per poter esprimere al massimo il tuo potenziale?">
            <FormTextarea value={form.sviluppoProfessionale.necessitaPotenziale} onChange={(v) => setSviluppo("necessitaPotenziale", v)} />
          </FormField>
          <FormField label="26. Hai maturato maggiore consapevolezza su cosa vuoi diventare nel tuo futuro professionale? Per favore scrivi un breve commento">
            <FormTextarea value={form.sviluppoProfessionale.consapevolezzaFuturo} onChange={(v) => setSviluppo("consapevolezzaFuturo", v)} />
          </FormField>
          <FormField label="27. Quali competenze il mercato richiede e tu vorresti sviluppare?">
            <FormTextarea value={form.sviluppoProfessionale.competenzeDaSviluppare} onChange={(v) => setSviluppo("competenzeDaSviluppare", v)} />
          </FormField>
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

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AutovalutazioneTab({ dipendenteId, isEditing }: Props) {
  const [data, setData]         = useState<Autovalutazione | null>(null);
  const [notes, setNotes]       = useState<Record<string, string>>({});
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);

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

  if (editing || (isEditing && !data)) {
    return (
      <CreateAutovalutazioneForm
        dipendenteId={dipendenteId}
        initialData={data ?? undefined}
        onSaved={(saved) => { setData(saved); setEditing(false); }}
        onCancel={data ? () => setEditing(false) : undefined}
      />
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFEFEF] p-8 flex flex-col items-center justify-center min-h-52 text-center gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1A1A1A]">Autovalutazione non disponibile</p>
          <p className="text-xs text-[#999] mt-1">Il dipendente non ha ancora compilato il questionario</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#444] bg-white border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Inserisci autovalutazione
        </button>
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

      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#444] bg-white border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Modifica autovalutazione
      </button>

    </div>
  );
}
