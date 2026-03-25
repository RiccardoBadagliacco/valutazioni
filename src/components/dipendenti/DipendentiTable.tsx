"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserX } from "lucide-react";
import { Dipendente } from "@/types/dipendente";

interface Props {
  dipendenti: Dipendente[];
  onEdit: (dipendente: Dipendente) => void;
  onDelete: (dipendente: Dipendente) => void;
}

const SEDE_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  Milano:  { dot: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700" },
  Roma:    { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  Torino:  { dot: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
  Napoli:  { dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
  Bologna: { dot: "bg-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700" },
  Firenze: { dot: "bg-pink-500",   bg: "bg-pink-50",   text: "text-pink-700" },
  Palermo: { dot: "bg-red-500",    bg: "bg-red-50",    text: "text-red-700" },
  Remote:  { dot: "bg-slate-400",  bg: "bg-slate-100", text: "text-slate-600" },
};

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-teal-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function DipendentiTable({ dipendenti, onEdit, onDelete }: Props) {
  if (dipendenti.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <UserX className="w-12 h-12 mb-3 opacity-40" />
        <p className="font-medium text-slate-500">Nessun dipendente trovato</p>
        <p className="text-sm mt-1">Aggiungi il primo dipendente con il pulsante in alto</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dipendente
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Job Profile
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sede
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dipendenti.map((d) => {
            const initials = `${d.nome[0]}${d.cognome[0]}`.toUpperCase();
            const avatarColor = getAvatarColor(d.nome + d.cognome);
            const sede = SEDE_STYLES[d.sede] ?? SEDE_STYLES["Remote"];

            return (
              <tr key={d.id} className="hover:bg-slate-50/80 transition-colors group">
                {/* Dipendente */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {d.nome} {d.cognome}
                      </p>
                      <p className="text-xs text-slate-400">#{d.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>

                {/* Job Profile */}
                <td className="px-6 py-4">
                  <span className="text-slate-700 font-medium">{d.jobprofile}</span>
                </td>

                {/* Sede */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sede.bg} ${sede.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sede.dot}`} />
                    {d.sede}
                  </span>
                </td>

                {/* Azioni */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(d)}
                      className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                      title="Modifica"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(d)}
                      className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                      title="Elimina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
