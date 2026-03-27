"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import DipendenteForm, { DipendenteFormData } from "./DipendenteForm";
import { Dipendente } from "@/types/dipendente";
import { Valutatore } from "@/types/valutatore";
import { UserPlus, Pencil } from "lucide-react";

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
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl border border-[#E8E8E8] shadow-none">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[#F3F3F3]">
          <div className="w-8 h-8 rounded-xl bg-[#111] flex items-center justify-center shrink-0">
            {isEdit
              ? <Pencil className="w-3.5 h-3.5 text-white" />
              : <UserPlus className="w-3.5 h-3.5 text-white" />
            }
          </div>
          <div>
            <p className="font-bold text-[#111] text-sm leading-snug">
              {isEdit ? "Modifica dipendente" : "Nuovo dipendente"}
            </p>
            <p className="text-xs text-[#999] mt-0.5">
              {isEdit
                ? `${dipendente.nome} ${dipendente.cognome}`
                : "Compila i dati per aggiungere un membro"
              }
            </p>
          </div>
        </div>

        {/* Form */}
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
