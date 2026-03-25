export interface PeriodoStaffing {
  tipoContratto: string;
  dataInizio: string;
  dataFine: string;
  mesi: number;
}

export interface PresenzaMese {
  mese: number;         // 1–12
  giorniUfficio: number;
  giorniSmartWorking: number;
  giorniEquivalenti: number; // ufficio + SW*0.5
}

export interface Staffing {
  dipendenteId: string;
  periodi: PeriodoStaffing[];
  presenze: PresenzaMese[];
}
