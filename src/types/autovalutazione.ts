export interface Autovalutazione {
  dipendenteId: string;
  dataCompilazione: string;

  // Sezione 1 — Overview
  overview: {
    stimolante: number; // Q3 — 1-5
    percezione: {       // Q4 — 0=non so, 1-5
      performanceProgettuali: number;
      rapportoLipari: number;
      percorsoCrescita: number;
      relazioneColleghi: number;
      partecipazioneCommunity: number;
    };
  };

  // Sezione 2 — Progetto
  progetto: {
    crescitaSkillMatrix: number;          // Q5 — 1-5
    crescitaSkillMatrixCommento: string;  // Q6 — testo libero
    raggiungimentoObiettiviProgetto: number; // Q7 — 1-5
    soddisfazioneEsperienze: number;      // Q8 — 1-5
    soddisfazioneEsperienzeCommento: string; // Q9 — testo libero
  };

  // Sezione 3 — Nuovo Progetto / Cliente
  nuovoProgetto: {
    staffato: boolean;               // Q10
    complessitaAvvio: string | null; // Q11
    supportoRicevuto: string | null; // Q12
    strumentiDisponibili: string | null; // Q13
  };

  // Sezione 4 — Attività Lipari
  attivitaLipari: {
    importanzaCommunity: number; // Q14 — 1-5
    utileCommunity: {            // Q15 — 0=non so, 1-5
      crescitaProfessionale: number;
      comunicazioniOperative: number;
      comunicazioneStrategie: number;
      formazione: number;
      gestioneProblematiche: number;
    };
    ruoloResponsabilita: number | null;        // Q16 — 1-5 o null se nessuna risposta
    ruoloResponsabilitaCommento: string | null; // Q17
    attivitaPiuMotivante: string;               // Q18
    raggiungimentoObiettiviLipari: number;      // Q19 — 1-5
  };

  // Sezione 5 — Equilibrio e benessere professionale
  equilibrio: {
    benessere: string;          // Q20 — opzione scelta
    riferimentiTecnici: string; // Q21
    riferimentiBenessere: string; // Q22
  };

  // Sezione 6 — Sviluppo professionale
  sviluppoProfessionale: {
    puntiDiForza: string;          // Q23
    automiglioramento: string;     // Q24
    necessitaPotenziale: string;   // Q25
    consapevolezzaFuturo: string;  // Q26
    competenzeDaSviluppare: string; // Q27
  };
}
