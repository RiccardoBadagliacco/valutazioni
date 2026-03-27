export interface DriverValutazione {
  nome: string;
  score: number;
  commento: string;
  categoria?: string;
}

export interface PerformanceDriver {
  nome: string;
  percentuale: number | null;
  commento: string;
}

export interface SchedaRiassuntiva {
  dipendenteId: string;
  templateId?: string;
  hardSkill: DriverValutazione[];
  softSkill: DriverValutazione[];
  crescitaKnowledge: { commento: string } | null;
  performance?: PerformanceDriver[];
}
