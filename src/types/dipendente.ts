export interface Dipendente {
  id: string;
  nome: string;
  cognome: string;
  jobprofile: string;
  sede: string;
}

export type DipendenteInput = Omit<Dipendente, "id">;

export const JOB_PROFILES = [
  "Junior",
  "C1",
  "C2",
  "SC1",
  "SC2",
  "SC3",
] as const;

export const SEDI = [
  "Milano",
  "Palermo",
  "Messina",
] as const;
