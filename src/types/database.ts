export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      dipendenti: {
        Row: {
          id: string;
          nome: string;
          cognome: string;
          jobprofile: string;
          sede: string;
        };
        Insert: {
          id: string;
          nome: string;
          cognome: string;
          jobprofile: string;
          sede: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cognome?: string;
          jobprofile?: string;
          sede?: string;
        };
        Relationships: [];
      };
      valutatori: {
        Row: {
          id: string;
          nome: string;
          cognome: string;
          email: string | null;
          dipendenti_ids: string[];
          dipendente_id: string | null;
          password_hash: string | null;
          special_features: boolean;
        };
        Insert: {
          id: string;
          nome: string;
          cognome: string;
          email?: string | null;
          dipendenti_ids?: string[];
          dipendente_id?: string | null;
          password_hash?: string | null;
          special_features?: boolean;
        };
        Update: {
          id?: string;
          nome?: string;
          cognome?: string;
          email?: string | null;
          dipendenti_ids?: string[];
          dipendente_id?: string | null;
          password_hash?: string | null;
          special_features?: boolean;
        };
        Relationships: [];
      };
      valutazioni: {
        Row: {
          id: string;
          dipendente_id: string;
          form_id: number;
          data: string;
          valutatore: string;
          societa: string;
          risposte: Json;
        };
        Insert: {
          id: string;
          dipendente_id: string;
          form_id: number;
          data: string;
          valutatore: string;
          societa: string;
          risposte: Json;
        };
        Update: {
          id?: string;
          dipendente_id?: string;
          form_id?: number;
          data?: string;
          valutatore?: string;
          societa?: string;
          risposte?: Json;
        };
        Relationships: [];
      };
      schede_riassuntive: {
        Row: {
          dipendente_id: string;
          template_id: string | null;
          hard_skill: Json;
          soft_skill: Json;
          crescita_knowledge: Json | null;
          performance: Json | null;
        };
        Insert: {
          dipendente_id: string;
          template_id?: string | null;
          hard_skill?: Json;
          soft_skill?: Json;
          crescita_knowledge?: Json | null;
          performance?: Json | null;
        };
        Update: {
          dipendente_id?: string;
          template_id?: string | null;
          hard_skill?: Json;
          soft_skill?: Json;
          crescita_knowledge?: Json | null;
          performance?: Json | null;
        };
        Relationships: [];
      };
      autovalutazioni: {
        Row: {
          dipendente_id: string;
          data_compilazione: string;
          overview: Json;
          progetto: Json;
          nuovo_progetto: Json;
          attivita_lipari: Json;
          equilibrio: Json;
          sviluppo_professionale: Json;
        };
        Insert: {
          dipendente_id: string;
          data_compilazione: string;
          overview?: Json;
          progetto?: Json;
          nuovo_progetto?: Json;
          attivita_lipari?: Json;
          equilibrio?: Json;
          sviluppo_professionale?: Json;
        };
        Update: {
          dipendente_id?: string;
          data_compilazione?: string;
          overview?: Json;
          progetto?: Json;
          nuovo_progetto?: Json;
          attivita_lipari?: Json;
          equilibrio?: Json;
          sviluppo_professionale?: Json;
        };
        Relationships: [];
      };
      autovalutazione_note: {
        Row: {
          dipendente_id: string;
          note: Json;
        };
        Insert: {
          dipendente_id: string;
          note?: Json;
        };
        Update: {
          dipendente_id?: string;
          note?: Json;
        };
        Relationships: [];
      };
      economics: {
        Row: {
          dipendente_id: string;
          economics_attuale: Json | null;
          proposta_aumento: Json | null;
          bonus: Json | null;
        };
        Insert: {
          dipendente_id: string;
          economics_attuale?: Json | null;
          proposta_aumento?: Json | null;
          bonus?: Json | null;
        };
        Update: {
          dipendente_id?: string;
          economics_attuale?: Json | null;
          proposta_aumento?: Json | null;
          bonus?: Json | null;
        };
        Relationships: [];
      };
      staffing: {
        Row: {
          dipendente_id: string;
          periodi: Json;
          presenze: Json;
        };
        Insert: {
          dipendente_id: string;
          periodi?: Json;
          presenze?: Json;
        };
        Update: {
          dipendente_id?: string;
          periodi?: Json;
          presenze?: Json;
        };
        Relationships: [];
      };
      riepilogo_note: {
        Row: {
          dipendente_id: string;
          nota: string;
          meme_idx: number | null;
        };
        Insert: {
          dipendente_id: string;
          nota?: string;
          meme_idx?: number | null;
        };
        Update: {
          dipendente_id?: string;
          nota?: string;
          meme_idx?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
