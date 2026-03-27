"use client";

import { Pencil, Trash2, MapPin, TrendingUp, ClipboardList, ShieldCheck, ListFilter, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dipendente } from "@/types/dipendente";
import { Economics } from "@/types/economics";

interface Props {
  dipendente: Dipendente;
  economics?: Economics;
  onEdit: () => void;
  onDelete: () => void;
  haScheda?: boolean;
  onCreaValutazione?: () => void;
  isValutatore?: boolean;
  onCardClick?: () => void;
  highlighted?: boolean;
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

export default function DipendenteCard({ dipendente: d, economics: eco, onEdit, onDelete, haScheda, onCreaValutazione, isValutatore, onCardClick, highlighted }: Props) {
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
      className={`rounded-2xl border p-5 flex flex-col gap-4 group hover:border-[#DCDCDC] transition-colors cursor-pointer ${
        isValutatore
          ? `bg-[#F8F8F8] ${highlighted ? "border-[#111]" : "border-[#E4E4E4]"}`
          : `bg-white ${highlighted ? "border-[#111]" : "border-[#EFEFEF]"}`
      }`}
    >
      {/* Top: avatar + actions */}
      <div className="flex items-start justify-between">
        <div className="relative">
          <div className={`w-11 h-11 rounded-xl ${isValutatore ? "bg-[#E4E4E4]" : avatarBg} flex items-center justify-center text-sm font-semibold text-[#1A1A1A]`}>
            {initials}
          </div>
          {isValutatore && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#111] flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          {!isValutatore && haScheda && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onCardClick && (
            <button
              onClick={(e) => { e.stopPropagation(); onCardClick(); }}
              title={highlighted ? "Rimuovi filtro" : "Filtra dipendenti"}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                highlighted
                  ? "bg-[#111] text-white"
                  : "bg-[#EBEBEB] text-[#999] hover:bg-[#DCDCDC] hover:text-[#111]"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-7 h-7 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-center text-[#BDBDBD] hover:text-[#111] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 rounded-lg hover:bg-[#FEF2F2] flex items-center justify-center text-[#BDBDBD] hover:text-red-500 transition-colors"
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
      <div className={`flex items-center justify-between pt-3 border-t ${isValutatore ? "border-[#EBEBEB]" : "border-[#F5F5F5]"}`}>
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

      {/* Crea valutazione CTA */}
      {onCreaValutazione !== undefined && !haScheda && (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/dipendenti/${d.id}?mode=edit`); }}
          className="w-full flex items-center justify-center gap-1.5 mt-1 py-2 text-xs font-semibold text-[#111] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-xl transition-colors border border-[#E5E5E5]"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Crea valutazione
        </button>
      )}
    </div>
  );
}
