"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import DipendenteForm from "./DipendenteForm";
import { Dipendente, DipendenteInput } from "@/types/dipendente";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dipendente?: Dipendente;
  onSubmit: (data: DipendenteInput) => Promise<void>;
  loading: boolean;
}

export default function DipendenteDialog({ open, onOpenChange, dipendente, onSubmit, loading }: Props) {
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

        {/* Form */}
        <div className="bg-white px-6 py-5">
          <DipendenteForm
            dipendente={dipendente}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            loading={loading}
          />
        </div>

      </DialogContent>
    </Dialog>
  );
}
