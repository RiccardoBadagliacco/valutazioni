"use client";

import { useEffect, useState } from "react";
import { SchedaRiassuntiva } from "@/types/scheda";

interface Props {
  dipendenteId: string;
}

// ─── Category grouping ─────────────────────────────────────────────────────────

const CATEGORY_KEYS = [
  "skill personali",
  "skill relazionali",
  "skill organizzative",
  "skill di leadership",
  "skill di pensiero",
] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

function extractCategory(nome: string): CategoryKey | null {
  const lower = nome.toLowerCase();
  for (const key of CATEGORY_KEYS) {
    if (lower.includes(key)) return key;
  }
  return null;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function buildAxes(scheda: SchedaRiassuntiva) {
  const groups: Record<CategoryKey, number[]> = {
    "skill personali":     [],
    "skill relazionali":   [],
    "skill organizzative": [],
    "skill di leadership": [],
    "skill di pensiero":   [],
  };
  for (const d of scheda.softSkill) {
    const cat = extractCategory(d.nome);
    if (cat) groups[cat].push(d.score);
  }
  return [
    { label: "Hard Skill",           value: average(scheda.hardSkill.map((d) => d.score)) },
    { label: "Skill personali",      value: average(groups["skill personali"]) },
    { label: "Skill relazionali",    value: average(groups["skill relazionali"]) },
    { label: "Skill organizzative",  value: average(groups["skill organizzative"]) },
    { label: "Skill di leadership",  value: average(groups["skill di leadership"]) },
    { label: "Skill di pensiero",    value: average(groups["skill di pensiero"]) },
  ];
}

// ─── SVG radar ────────────────────────────────────────────────────────────────

const CX = 220;
const CY = 200;
const R  = 150;
const N  = 6;
const MAX = 5;

function angleOf(i: number) {
  return (Math.PI * 2 * i) / N - Math.PI / 2;
}

function point(i: number, value: number) {
  const a = angleOf(i);
  const r = (value / MAX) * R;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function polygonPath(values: number[]) {
  return values
    .map((v, i) => {
      const p = point(i, v);
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

function ringPath(level: number) {
  return polygonPath(Array(N).fill(level));
}

// Label anchor: based on angle quadrant
function labelAnchor(i: number): "start" | "middle" | "end" {
  const a = angleOf(i);
  const cos = Math.cos(a);
  if (cos > 0.2)  return "start";
  if (cos < -0.2) return "end";
  return "middle";
}

function labelBaseline(i: number): "auto" | "hanging" | "middle" {
  const a = angleOf(i);
  const sin = Math.sin(a);
  if (sin > 0.2)  return "hanging";
  if (sin < -0.2) return "auto";
  return "middle";
}

function scoreColors(s: number) {
  if (s >= 4.5) return { bg: "#111",       text: "#fff" };
  if (s >= 3.5) return { bg: "#555",       text: "#fff" };
  if (s >= 2.5) return { bg: "#BDBDBD",   text: "#fff" };
  if (s >= 1.5) return { bg: "#FB923C",   text: "#fff" };
  return               { bg: "#F87171",   text: "#fff" };
}

interface RadarProps {
  axes: { label: string; value: number }[];
}

function RadarChart({ axes }: RadarProps) {
  const values    = axes.map((a) => a.value);
  const dataPath  = polygonPath(values);
  const LABEL_PAD = 28;

  return (
    <svg viewBox={`0 0 ${CX * 2} ${CY * 2 + 10}`} className="w-full h-full">

      {/* Reference zones */}
      <path d={`${ringPath(5)} ${ringPath(3.5)}`} fillRule="evenodd" fill="#DCFCE7" fillOpacity={0.9} stroke="none" />
      <path d={`${ringPath(3.5)} ${ringPath(2)}`} fillRule="evenodd" fill="#FEF9C3" fillOpacity={0.9} stroke="none" />
      <path d={ringPath(2)} fill="#FFE4E6" fillOpacity={0.85} stroke="none" />

      {/* Zone boundary strokes */}
      <path d={ringPath(3.5)} fill="none" stroke="#D1FAE5" strokeWidth={1.5} />
      <path d={ringPath(2)}   fill="none" stroke="#FDE68A" strokeWidth={1.5} />

      {/* Grid rings */}
      {[1, 2, 3, 4, 5].map((level) => (
        <path
          key={level}
          d={ringPath(level)}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth={0.75}
        />
      ))}

      {/* Spokes */}
      {axes.map((_, i) => {
        const p = point(i, MAX);
        return (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={p.x.toFixed(2)} y2={p.y.toFixed(2)}
            stroke="#EBEBEB"
            strokeWidth={0.75}
          />
        );
      })}

      {/* Data fill */}
      <path
        d={dataPath}
        fill="#111"
        fillOpacity={0.07}
        stroke="none"
      />

      {/* Data stroke */}
      <path
        d={dataPath}
        fill="none"
        stroke="#111"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Axis labels */}
      {axes.map((axis, i) => {
        const a   = angleOf(i);
        const r   = R + LABEL_PAD;
        const lx  = CX + r * Math.cos(a);
        const ly  = CY + r * Math.sin(a);
        return (
          <text
            key={i}
            x={lx.toFixed(2)}
            y={ly.toFixed(2)}
            textAnchor={labelAnchor(i)}
            dominantBaseline={labelBaseline(i)}
            fontSize={11.5}
            fontWeight={600}
            fill="#1A1A1A"
            fontFamily="inherit"
          >
            {axis.label}
          </text>
        );
      })}

      {/* Score badges at each vertex */}
      {axes.map((axis, i) => {
        const p   = point(i, axis.value);
        const c   = scoreColors(axis.value);
        const W   = 30;
        const H   = 16;
        const a   = angleOf(i);
        const bx  = p.x + Math.cos(a) * 2;
        const by  = p.y + Math.sin(a) * 2;
        return (
          <g key={i}>
            {/* Dot */}
            <circle cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r={4} fill="#111" />
            {/* Pill */}
            <rect
              x={(bx - W / 2).toFixed(2)}
              y={(by - H / 2).toFixed(2)}
              width={W}
              height={H}
              rx={8}
              ry={8}
              fill={c.bg}
            />
            <text
              x={bx.toFixed(2)}
              y={by.toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9.5}
              fontWeight={700}
              fill={c.text}
              fontFamily="inherit"
            >
              {axis.value.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Ring scale labels (right side) */}
      {[1, 2, 3, 4, 5].map((level) => {
        const p = point(0, level); // top vertex
        return (
          <text
            key={level}
            x={(p.x + 6).toFixed(2)}
            y={(p.y + 2).toFixed(2)}
            fontSize={8.5}
            fill="#BDBDBD"
            fontFamily="inherit"
          >
            {level}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Score row ─────────────────────────────────────────────────────────────────

function ScoreRow({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  const c   = scoreColors(value);
  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-[#666] w-40 shrink-0">{label}</p>
      <div className="flex-1 h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-[#111]" style={{ width: `${pct}%` }} />
      </div>
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function SkillMatrixTab({ dipendenteId }: Props) {
  const [scheda, setScheda]   = useState<SchedaRiassuntiva | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/schede?dipendenteId=${dipendenteId}`)
      .then((r) => r.json())
      .then(setScheda)
      .finally(() => setLoading(false));
  }, [dipendenteId]);

  if (loading) return <p className="text-sm text-[#999] py-8 text-center">Caricamento...</p>;

  if (!scheda) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFEFEF] p-8 text-center">
        <p className="text-sm text-[#999]">Skill matrix non disponibile</p>
      </div>
    );
  }

  const axes      = buildAxes(scheda);
  const allScores = scheda.hardSkill.concat(scheda.softSkill).map((d) => d.score);
  const globalAvg = allScores.length ? average(allScores) : null;
  const gc        = globalAvg !== null ? scoreColors(globalAvg) : null;

  return (
    <div className="space-y-4">

      {/* Global banner */}
      {globalAvg !== null && gc && (
        <div className="bg-white rounded-2xl border border-[#EFEFEF] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mb-0.5">
              Media complessiva
            </p>
            <p className="text-sm text-[#666]">{allScores.length} driver valutati</p>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-bold leading-none text-[#111]">
              {globalAvg.toFixed(1)}
            </span>
            <span className="text-base text-[#999] mb-1">/ 5</span>
          </div>
        </div>
      )}

      {/* Radar + breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">

        {/* Radar card */}
        <div className="bg-white rounded-2xl border border-[#EFEFEF] p-6 flex items-center justify-center">
          <div className="w-full max-w-[420px] aspect-square">
            <RadarChart axes={axes} />
          </div>
        </div>

        {/* Breakdown card */}
        <div className="bg-white rounded-2xl border border-[#EFEFEF] px-5 py-6 space-y-4">
          <p className="text-xs font-semibold text-[#999] uppercase tracking-wide">
            Dettaglio assi
          </p>
          <div className="space-y-3">
            {axes.map((axis) => (
              <ScoreRow key={axis.label} label={axis.label} value={axis.value} />
            ))}
          </div>
          <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wide">Zone</p>
            {[
              { color: "#DCFCE7", border: "#D1FAE5", label: "Distintive",         range: "3.5 – 5.0" },
              { color: "#FEF9C3", border: "#FDE68A", label: "In linea col profilo", range: "2.0 – 3.5" },
              { color: "#FFE4E6", border: "#FECDD3", label: "Da potenziare",       range: "< 2.0" },
            ].map(({ color, border, label, range }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0 border" style={{ backgroundColor: color, borderColor: border }} />
                  <span className="text-xs text-[#666]">{label}</span>
                </div>
                <span className="text-xs text-[#BDBDBD]">{range}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
