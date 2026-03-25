export interface EconomicsAttuale {
  tipoContratto: string;
  livello: number;
  dataInizio: string;
  ral: number;
  indennita: number;
  dataPrimoStaffing: string;
  bonusErogato: number;
}

export interface PropostaAumento {
  profilo: string | null;
  sede: string | null;
  jobProfile: string | null;
  nuovaRal: number | null;
  ralMin: number | null;
  ralMax: number | null;
  nuovaIndennita: number | null;
  parametroIndennita: number | null;
  bonusImporto: number | null;
  bonusTipo: "VARIABILE" | "FISSO" | null;
  bonusPercentuale: number | null;
  note: string | null;
}

export interface BonusObiettivo {
  descrizione: string;
  percentualeMassima: number;
  pesoObiettivo: number;
  quotaBonusMassima: number;
}

export interface Bonus {
  obiettivi: BonusObiettivo[];
  bonusMassimale: number | null;
  bonusErogato: number | null;
  bonusErogatoPercentuale: number | null;
  note: string | null;
}

export interface Economics {
  dipendenteId: string;
  economicsAttuale: EconomicsAttuale | null;
  propostaAumento: PropostaAumento | null;
  bonus: Bonus | null;
}
