export interface DriverValutazione {
  nome: string;
  score: number;
  commento: string;
}

export interface SchedaRiassuntiva {
  dipendenteId: string;
  hardSkill: DriverValutazione[];
  softSkill: DriverValutazione[];
  crescitaKnowledge: { commento: string } | null;
}
