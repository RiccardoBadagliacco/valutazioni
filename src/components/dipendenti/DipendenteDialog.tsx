"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import DipendenteForm, { DipendenteFormData } from "./DipendenteForm";
import { Dipendente } from "@/types/dipendente";
import { Valutatore } from "@/types/valutatore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dipendente?: Dipendente;
  onSubmit: (data: DipendenteFormData) => Promise<void>;
  loading: boolean;
  valutatori?: Valutatore[];
  linkedValutatoreId?: string | null;
}

export default function DipendenteDialog({ open, onOpenChange, dipendente, onSubmit, loading, valutatori, linkedValutatoreId }: Props) {
  const isEdit = !!dipendente;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl border border-[#EFEFEF] shadow-none">

        {/* Header */}
        <div className="bg-[#111] px-6 py-5">
          <p className="text-white font-semibold text-base">
            {isEdit ? "Modifica dipendente" : "Nuovo dipendente"}
          </p>
          <p className="text-[#888] text-sm mt-0.5">
            {isEdit
              ? `${dipendente.nome} ${dipendente.cognome}`
              : "Compila i dati per aggiungere un nuovo membro"
            }
          </p>
        </div>

        {/* Form — key forces remount when switching between different dipendenti */}
        <div className="bg-white px-6 py-5">
          <DipendenteForm
            key={dipendente?.id ?? "new"}
            dipendente={dipendente}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            loading={loading}
            valutatori={valutatori}
            linkedValutatoreId={linkedValutatoreId}
          />
        </div>

      </DialogContent>
    </Dialog>
  );
}
