export interface Valutatore {
  id: string;
  nome: string;
  cognome: string;
  email?: string | null;
  dipendentiIds: string[];
  dipendenteId?: string | null; // linked employee profile (this evaluator IS this employee)
  passwordHash?: string;
  specialFeatures?: boolean;
}
