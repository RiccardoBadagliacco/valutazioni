"use client";

import { Pencil, Trash2, MapPin, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dipendente } from "@/types/dipendente";
import { Economics } from "@/types/economics";

interface Props {
  dipendente: Dipendente;
  economics?: Economics;
  onEdit: () => void;
  onDelete: () => void;
}

function getInitials(nome: string, cognome: string) {
  return `${nome[0]}${cognome[0]}`.toUpperCase();
}

function getAvatarIndex(s: string) {
  let hash = 0;
  for (const c of s) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return Math.abs(hash) % 4;
}

const AVATAR_BG = ["bg-[#F0F0F0]", "bg-[#EAEAEA]", "bg-[#E8E8E8]", "bg-[#EDEDED]"];

const LEVEL_BADGE: Record<string, string> = {
  Junior: "bg-[#F5F5F5] text-[#666]",
  C1:     "bg-[#F5F5F5] text-[#444]",
  C2:     "bg-[#EFEFEF] text-[#333]",
  SC1:    "bg-[#111] text-white",
  SC2:    "bg-[#111] text-white",
  SC3:    "bg-[#111] text-white",
};

function formatEur(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export default function DipendenteCard({ dipendente: d, economics: eco, onEdit, onDelete }: Props) {
  const router     = useRouter();
  const initials   = getInitials(d.nome, d.cognome);
  const avatarBg   = AVATAR_BG[getAvatarIndex(d.nome + d.cognome)];
  const levelStyle = LEVEL_BADGE[d.jobprofile] ?? LEVEL_BADGE["Junior"];

  const ea = eco?.economicsAttuale ?? null;
  const pa = eco?.propostaAumento  ?? null;

  const ralPct = ea && pa?.nuovaRal && pa.nuovaRal > ea.ral
    ? ((pa.nuovaRal - ea.ral) / ea.ral) * 100
    : null;

  return (
    <div
      onClick={() => router.push(`/dipendenti/${d.id}`)}
      className="bg-white rounded-2xl border border-[#EFEFEF] p-5 flex flex-col gap-4 group hover:border-[#DCDCDC] transition-colors cursor-pointer"
    >
      {/* Top: avatar + actions */}
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${avatarBg} flex items-center justify-center text-sm font-semibold text-[#1A1A1A]`}>
          {initials}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-7 h-7 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-center text-[#999] hover:text-[#111] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 rounded-lg hover:bg-[#FEF2F2] flex items-center justify-center text-[#999] hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <p className="font-semibold text-[#1A1A1A] text-sm leading-snug">
          {d.nome} {d.cognome}
        </p>
        {ea && (
          <p className="text-xs text-[#999] mt-1">{formatEur(ea.ral)}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F5F5F5]">
        <div className="flex items-center gap-1.5 text-xs text-[#999]">
          <MapPin className="w-3.5 h-3.5" />
          {d.sede}
        </div>
        <div className="flex items-center gap-1.5">
          {ralPct !== null && (
            <span className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
              <TrendingUp className="w-3 h-3" />
              +{ralPct.toFixed(1)}%
            </span>
          )}
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${levelStyle}`}>
            {d.jobprofile}
          </span>
        </div>
      </div>
    </div>
  );
}
