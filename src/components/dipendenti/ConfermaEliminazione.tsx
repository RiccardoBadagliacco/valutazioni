"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Dipendente } from "@/types/dipendente";
import { AlertTriangle } from "lucide-react";

interface Props {
  dipendente?: Dipendente;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export default function ConfermaEliminazione({ dipendente, open, onOpenChange, onConfirm, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Elimina Dipendente</h2>
          <p className="text-sm text-slate-500">
            Sei sicuro di voler eliminare{" "}
            <span className="font-semibold text-slate-700">
              {dipendente?.nome} {dipendente?.cognome}
            </span>
            ?<br />Questa operazione non può essere annullata.
          </p>
        </div>
        <div className="flex border-t border-slate-100">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            {loading ? "Eliminazione..." : "Elimina"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
