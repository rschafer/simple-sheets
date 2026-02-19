"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigation, Program, ProductArea } from "@/context/NavigationContext";
import { HealthStatus, ProjectPhase } from "@/context/DashboardContext";

export const healthLabels: Record<HealthStatus, string> = {
  green: "On Track",
  yellow: "At Risk",
  red: "Off Track",
};

export const healthColors: Record<HealthStatus, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
};

export const healthDotColors: Record<HealthStatus, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

// Simple markdown to HTML (bold + bullet lists + paragraphs)
export function markdownToHtml(md: string): string {
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      const content = trimmed.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      if (trimmed === "") {
        continue;
      }
      const content = trimmed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html.push(`<p>${content}</p>`);
    }
  }

  if (inList) html.push("</ul>");
  return html.join("\n");
}

// --- Donut Chart (pure SVG) ---
export function DonutChart({ counts }: { counts: Record<HealthStatus, number> }) {
  const total = counts.green + counts.yellow + counts.red;
  const [hovered, setHovered] = useState<HealthStatus | null>(null);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-40 h-40">
        <span className="text-gray-400 text-sm">No programs</span>
      </div>
    );
  }

  const radius = 56;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  const allSegments: { color: string; label: string; count: number; key: HealthStatus }[] = [
    { color: "#22c55e", label: "On Track", count: counts.green, key: "green" as const },
    { color: "#eab308", label: "At Risk", count: counts.yellow, key: "yellow" as const },
    { color: "#ef4444", label: "Off Track", count: counts.red, key: "red" as const },
  ];
  const segments = allSegments.filter((s) => s.count > 0);

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.count / total;
    const dashArray = `${pct * circumference} ${circumference}`;
    const dashOffset = -offset * circumference;
    offset += pct;
    return { ...seg, pct, dashArray, dashOffset };
  });

  const hoveredArc = hovered ? arcs.find((a) => a.key === hovered) : null;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={hovered === arc.key ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              opacity={hovered && hovered !== arc.key ? 0.4 : 1}
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHovered(arc.key)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredArc ? (
            <>
              <span className="text-2xl font-bold" style={{ color: hoveredArc.color }}>{Math.round(hoveredArc.pct * 100)}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{hoveredArc.label}</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{total}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Programs</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {seg.count} {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Needs Attention Section ---
export function NeedsAttention({
  allPrograms,
  showProductArea = true,
}: {
  allPrograms: { program: Program; productArea: ProductArea }[];
  showProductArea?: boolean;
}) {
  const { setCurrentView } = useNavigation();

  const items: { type: "overdue" | "at-risk" | "off-track"; label: string; programName: string; productAreaName: string; programId: string; productAreaId: string }[] = [];

  for (const { program, productArea } of allPrograms) {
    if (program.healthStatus === "red") {
      items.push({
        type: "off-track",
        label: "Off Track",
        programName: program.name,
        productAreaName: productArea.name,
        programId: program.id,
        productAreaId: productArea.id,
      });
    } else if (program.healthStatus === "yellow") {
      items.push({
        type: "at-risk",
        label: "At Risk",
        programName: program.name,
        productAreaName: productArea.name,
        programId: program.id,
        productAreaId: productArea.id,
      });
    }

    const overdueMilestones = program.data.milestones.filter(
      (m) => m.status !== "Complete" && m.finishDate && new Date(m.finishDate) < new Date()
    );
    for (const m of overdueMilestones) {
      items.push({
        type: "overdue",
        label: `Overdue milestone: ${m.name || "Unnamed"}`,
        programName: program.name,
        productAreaName: productArea.name,
        programId: program.id,
        productAreaId: productArea.id,
      });
    }
  }

  // Sort: off-track (red) first, then at-risk (yellow), then overdue
  const typePriority: Record<string, number> = { "off-track": 0, "at-risk": 1, overdue: 2 };
  items.sort((a, b) => typePriority[a.type] - typePriority[b.type]);

  if (items.length === 0) return null;

  const typeColors = {
    "off-track": "bg-red-50 border-red-200 text-red-800",
    "at-risk": "bg-yellow-50 border-yellow-200 text-yellow-800",
    overdue: "bg-orange-50 border-orange-200 text-orange-800",
  };

  const typeIcons = {
    "off-track": (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    "at-risk": (
      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    overdue: (
      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Needs Attention</h2>
      </div>
      <div className="p-5 space-y-2">
        {items.slice(0, 8).map((item, i) => (
          <button
            key={i}
            onClick={() =>
              setCurrentView({
                type: "program",
                productAreaId: item.productAreaId,
                programId: item.programId,
              })
            }
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-sm hover:opacity-80 transition-opacity ${typeColors[item.type]}`}
          >
            {typeIcons[item.type]}
            <div className="flex-1 min-w-0">
              <span className="font-medium">{item.label}</span>
              <span className="text-gray-500 mx-1">-</span>
              <span>{item.programName}</span>
              {showProductArea && (
                <span className="text-gray-400 text-xs ml-1">({item.productAreaName})</span>
              )}
            </div>
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
        {items.length > 8 && (
          <p className="text-xs text-gray-400 text-center pt-1">+{items.length - 8} more items</p>
        )}
      </div>
    </div>
  );
}

// --- Filter Bar ---
export type DeliveryFilter = "all" | "this-quarter" | "next-quarter" | "overdue" | "no-date";

export function FilterBar({
  healthFilter,
  setHealthFilter,
  phaseFilter,
  setPhaseFilter,
  deliveryFilter,
  setDeliveryFilter,
}: {
  healthFilter: HealthStatus | "all";
  setHealthFilter: (v: HealthStatus | "all") => void;
  phaseFilter: ProjectPhase | "all";
  setPhaseFilter: (v: ProjectPhase | "all") => void;
  deliveryFilter: DeliveryFilter;
  setDeliveryFilter: (v: DeliveryFilter) => void;
}) {
  const hasFilters = healthFilter !== "all" || phaseFilter !== "all" || deliveryFilter !== "all";

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Filters</span>
      <select
        value={healthFilter}
        onChange={(e) => setHealthFilter(e.target.value as HealthStatus | "all")}
        className={`rounded border px-2 py-1 text-sm ${healthFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600"}`}
      >
        <option value="all">All Health</option>
        <option value="green">On Track</option>
        <option value="yellow">At Risk</option>
        <option value="red">Off Track</option>
      </select>
      <select
        value={phaseFilter}
        onChange={(e) => setPhaseFilter(e.target.value as ProjectPhase | "all")}
        className={`rounded border px-2 py-1 text-sm ${phaseFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600"}`}
      >
        <option value="all">All Phases</option>
        <option value="Discovery">Discovery</option>
        <option value="Planning">Planning</option>
        <option value="Execution">Execution</option>
      </select>
      <select
        value={deliveryFilter}
        onChange={(e) => setDeliveryFilter(e.target.value as DeliveryFilter)}
        className={`rounded border px-2 py-1 text-sm ${deliveryFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600"}`}
      >
        <option value="all">All Dates</option>
        <option value="this-quarter">This Quarter</option>
        <option value="next-quarter">Next Quarter</option>
        <option value="overdue">Overdue</option>
        <option value="no-date">No Date Set</option>
      </select>
      {hasFilters && (
        <button
          onClick={() => {
            setHealthFilter("all");
            setPhaseFilter("all");
            setDeliveryFilter("all");
          }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function getQuarterRange(offset: number): { start: Date; end: Date } {
  const now = new Date();
  const currentQ = Math.floor(now.getMonth() / 3) + offset;
  const year = now.getFullYear() + Math.floor(currentQ / 4);
  const q = ((currentQ % 4) + 4) % 4;
  const start = new Date(year, q * 3, 1);
  const end = new Date(year, q * 3 + 3, 0);
  return { start, end };
}

export function matchesDeliveryFilter(deliveryDate: string, filter: DeliveryFilter): boolean {
  if (filter === "all") return true;
  if (filter === "no-date") return !deliveryDate;
  if (!deliveryDate) return false;

  const date = new Date(deliveryDate);
  const now = new Date();

  if (filter === "overdue") return date < now;

  const quarterOffset = filter === "this-quarter" ? 0 : 1;
  const { start, end } = getQuarterRange(quarterOffset);
  return date >= start && date <= end;
}

// --- Trend Arrow ---
export function TrendArrow({ program }: { program: Program }) {
  const summaries = program.data.executiveSummaries;
  if (summaries.length < 2) return <span className="text-gray-300 text-xs ml-1" title="Not enough data">-</span>;

  const raidCount = program.data.raidItems.filter((r) => r.status !== "Closed").length;
  const overdueMilestones = program.data.milestones.filter(
    (m) => m.status !== "Complete" && m.finishDate && new Date(m.finishDate) < new Date()
  ).length;

  if (program.healthStatus === "red" || overdueMilestones > 2 || raidCount > 5) {
    return (
      <span className="text-red-500 text-xs ml-1" title="Declining">
        <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </span>
    );
  }

  if (program.healthStatus === "yellow" || overdueMilestones > 0 || raidCount > 2) {
    return (
      <span className="text-yellow-500 text-xs ml-1" title="Stable">
        <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
        </svg>
      </span>
    );
  }

  return (
    <span className="text-green-500 text-xs ml-1" title="Improving">
      <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </span>
  );
}

// --- Timeline Bar ---
export function TimelineBar({ programs }: { programs: { program: Program; productArea: ProductArea }[] }) {
  const withDates = programs.filter((p) => p.program.data.deliveryDate);
  if (withDates.length === 0) return null;

  const now = new Date();
  const dates = withDates.map((p) => new Date(p.program.data.deliveryDate));
  const minDate = new Date(Math.min(now.getTime(), ...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  const rangeMs = maxDate.getTime() - minDate.getTime();
  const paddedMin = new Date(minDate.getTime() - rangeMs * 0.05);
  const paddedMax = new Date(maxDate.getTime() + rangeMs * 0.15);
  const totalRange = paddedMax.getTime() - paddedMin.getTime();

  if (totalRange <= 0) return null;

  const nowPct = ((now.getTime() - paddedMin.getTime()) / totalRange) * 100;

  // Generate month tick marks for the horizontal axis
  const ticks: { date: Date; pct: number }[] = [];
  const tickStart = new Date(paddedMin.getFullYear(), paddedMin.getMonth() + 1, 1);
  for (let d = new Date(tickStart); d <= paddedMax; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const pct = ((d.getTime() - paddedMin.getTime()) / totalRange) * 100;
    if (pct > 2 && pct < 98) {
      ticks.push({ date: new Date(d), pct });
    }
  }

  const axisHeight = 24;

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Target Date Timeline</h2>
      </div>
      <div className="p-5">
        <div className="relative" style={{ minHeight: `${withDates.length * 32 + 24 + axisHeight}px` }}>
          {/* Month tick lines */}
          {ticks.map((tick, i) => (
            <div
              key={i}
              className="absolute top-0 border-l border-gray-200 dark:border-gray-700"
              style={{ left: `${tick.pct}%`, height: `${withDates.length * 32 + 24}px` }}
            />
          ))}
          <div
            className="absolute top-0 border-l-2 border-blue-400 border-dashed z-10"
            style={{ left: `${Math.max(0, Math.min(100, nowPct))}%`, height: `${withDates.length * 32 + 24}px` }}
          >
            <span className="absolute -top-1 -translate-x-1/2 text-[10px] text-blue-500 font-medium bg-white dark:bg-gray-800 px-1">
              Today
            </span>
          </div>
          {withDates.map(({ program }, i) => {
            const deliveryDate = new Date(program.data.deliveryDate);
            const endPct = ((deliveryDate.getTime() - paddedMin.getTime()) / totalRange) * 100;
            const startPct = Math.max(0, endPct - 15);

            return (
              <div
                key={program.id}
                className="absolute flex items-center"
                style={{ top: `${i * 32 + 20}px`, left: `${startPct}%`, right: `${100 - endPct}%`, height: "24px" }}
              >
                <div
                  className="h-5 rounded-full w-full"
                  style={{ backgroundColor: healthDotColors[program.healthStatus], opacity: 0.7 }}
                />
                <span className="absolute right-0 translate-x-full pl-2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {program.name}
                </span>
              </div>
            );
          })}
          {/* Horizontal axis with date labels */}
          <div
            className="absolute left-0 right-0 border-t border-gray-300 dark:border-gray-600"
            style={{ top: `${withDates.length * 32 + 24}px` }}
          >
            {ticks.map((tick, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 text-[10px] text-gray-500 dark:text-gray-400 pt-1"
                style={{ left: `${tick.pct}%` }}
              >
                {tick.date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- KPI Cards ---
export function KpiCards({ programs }: { programs: { program: Program; productArea: ProductArea }[] }) {
  const total = programs.length;
  const onTrack = programs.filter(({ program }) => program.healthStatus === "green").length;
  const pctOnTrack = total > 0 ? Math.round((onTrack / total) * 100) : 0;

  const openRaidItems = programs.reduce(
    (count, { program }) => count + program.data.raidItems.filter((r) => r.status !== "Closed").length,
    0
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card p-5">
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{total}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Programs</div>
      </div>
      <div className="card p-5">
        <div className="text-3xl font-bold text-green-600">{pctOnTrack}%</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">On Track</div>
      </div>
      <div className="card p-5">
        <div className="text-3xl font-bold text-orange-600">{openRaidItems}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Open RAID Items</div>
      </div>
    </div>
  );
}

// --- Column Filter Dropdown ---
function ColumnFilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isFiltered = value !== "all";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex items-center gap-1">
      <span>{label}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`inline-flex items-center p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${isFiltered ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
        title={`Filter ${label}`}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 01.707 1.707L11 10.414V17a1 1 0 01-1.447.894l-2-1A1 1 0 017 16v-5.586L1.293 3.707A1 1 0 013 3z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={(e) => { e.stopPropagation(); onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs normal-case tracking-normal hover:bg-gray-100 dark:hover:bg-gray-700 ${
                value === opt.value ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Programs Table ---
export function ProgramsTable({
  programs,
  showProductArea = true,
  totalCount,
  healthFilter,
  setHealthFilter,
  phaseFilter,
  setPhaseFilter,
  deliveryFilter,
  setDeliveryFilter,
}: {
  programs: { program: Program; productArea: ProductArea }[];
  showProductArea?: boolean;
  totalCount: number;
  healthFilter?: HealthStatus | "all";
  setHealthFilter?: (v: HealthStatus | "all") => void;
  phaseFilter?: ProjectPhase | "all";
  setPhaseFilter?: (v: ProjectPhase | "all") => void;
  deliveryFilter?: DeliveryFilter;
  setDeliveryFilter?: (v: DeliveryFilter) => void;
}) {
  const { setCurrentView } = useNavigation();

  const healthOptions = [
    { value: "all", label: "All Health" },
    { value: "green", label: "On Track" },
    { value: "yellow", label: "At Risk" },
    { value: "red", label: "Off Track" },
  ];

  const phaseOptions = [
    { value: "all", label: "All Phases" },
    { value: "Discovery", label: "Discovery" },
    { value: "Planning", label: "Planning" },
    { value: "Execution", label: "Execution" },
  ];

  const deliveryOptions = [
    { value: "all", label: "All Dates" },
    { value: "this-quarter", label: "This Quarter" },
    { value: "next-quarter", label: "Next Quarter" },
    { value: "overdue", label: "Overdue" },
    { value: "no-date", label: "No Date Set" },
  ];

  const hasFilters =
    (healthFilter && healthFilter !== "all") ||
    (phaseFilter && phaseFilter !== "all") ||
    (deliveryFilter && deliveryFilter !== "all");

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          Programs
          {programs.length !== totalCount && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({programs.length} of {totalCount})
            </span>
          )}
        </h2>
        {hasFilters && setHealthFilter && setPhaseFilter && setDeliveryFilter && (
          <button
            onClick={() => { setHealthFilter("all"); setPhaseFilter("all"); setDeliveryFilter("all"); }}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear filters
          </button>
        )}
      </div>
      <div className="overflow-x-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 -mx-1">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-2">Program</th>
              {showProductArea && <th className="px-5 py-2">Product Area</th>}
              <th className="px-5 py-3">
                {setHealthFilter ? (
                  <ColumnFilterDropdown
                    label="Health"
                    value={healthFilter || "all"}
                    options={healthOptions}
                    onChange={(v) => setHealthFilter(v as HealthStatus | "all")}
                  />
                ) : "Health"}
              </th>
              <th className="px-5 py-3">Trend</th>
              <th className="px-5 py-3">
                {setPhaseFilter ? (
                  <ColumnFilterDropdown
                    label="Phase"
                    value={phaseFilter || "all"}
                    options={phaseOptions}
                    onChange={(v) => setPhaseFilter(v as ProjectPhase | "all")}
                  />
                ) : "Phase"}
              </th>
              <th className="px-5 py-3">
                {setDeliveryFilter ? (
                  <ColumnFilterDropdown
                    label="Target Date"
                    value={deliveryFilter || "all"}
                    options={deliveryOptions}
                    onChange={(v) => setDeliveryFilter(v as DeliveryFilter)}
                  />
                ) : "Target Date"}
              </th>
              <th className="px-5 py-3">RAID</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(({ program, productArea }) => {
              const openRaids = program.data.raidItems.filter((r) => r.status !== "Closed").length;

              return (
                <tr
                  key={program.id}
                  className="bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
                  onClick={() =>
                    setCurrentView({
                      type: "program",
                      productAreaId: productArea.id,
                      programId: program.id,
                    })
                  }
                >
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{program.name}</span>
                  </td>
                  {showProductArea && (
                    <td className="px-5 py-3.5 text-sm text-gray-500">{productArea.name}</td>
                  )}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${healthColors[program.healthStatus]}`}>
                      {healthLabels[program.healthStatus]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <TrendArrow program={program} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{program.data.phase}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                    {program.data.deliveryDate || "\u2014"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                    {openRaids > 0 ? (
                      <span className={openRaids > 3 ? "text-orange-600 font-medium" : ""}>
                        {openRaids} open
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {programs.length === 0 && (
              <tr>
                <td colSpan={showProductArea ? 7 : 6} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No programs match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- AI Report Button ---
export function AiReportButton({ allPrograms }: { allPrograms: { program: Program; productArea: ProductArea }[] }) {
  const [report, setReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [open, setOpen] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    setOpen(true);

    try {
      const programSummaries = allPrograms.map(({ program, productArea }) => {
        const openRaids = program.data.raidItems.filter((r) => r.status !== "Closed");
        const overdueMilestones = program.data.milestones.filter(
          (m) => m.status !== "Complete" && m.finishDate && new Date(m.finishDate) < new Date()
        );
        return {
          name: program.name,
          productArea: productArea.name,
          health: healthLabels[program.healthStatus],
          phase: program.data.phase,
          deliveryDate: program.data.deliveryDate || "Not set",
          openRisks: openRaids.filter((r) => r.type === "Risk").length,
          openIssues: openRaids.filter((r) => r.type === "Issue").length,
          overdueMilestones: overdueMilestones.length,
          latestSummary: program.data.executiveSummaries[0]?.recentProgress || "",
        };
      });

      const response = await fetch("/api/generate-portfolio-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programs: programSummaries }),
      });

      if (!response.ok) throw new Error("Failed to generate report");
      const result = await response.json();
      setReport(result.report);
    } catch (error) {
      console.error("Report generation error:", error);
      setReport("Failed to generate report. Please ensure the API is configured and try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={generateReport}
        disabled={generating}
        className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {generating ? "Generating..." : "AI Report"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">AI Report</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {generating ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                <span className="ml-3 text-gray-500">Analyzing programs...</span>
              </div>
            ) : report ? (
              <>
                <div
                  className="prose prose-sm max-w-none text-gray-700 [&_strong]:text-gray-900 [&_strong]:font-semibold [&_ul]:mt-1 [&_ul]:mb-4 [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(report) }}
                />
                <div className="mt-4 pt-3 border-t text-xs text-gray-400">
                  Generated by Claude AI (Anthropic)
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
