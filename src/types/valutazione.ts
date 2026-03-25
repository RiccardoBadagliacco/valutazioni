export interface RispostaValutazione {
  domanda: string;
  risposta: string;
  commento: string;
}

export interface Valutazione {
  id: string;
  dipendenteId: string;
  formId: number;
  data: string;
  valutatore: string;
  societa: string;
  risposte: RispostaValutazione[];
}
