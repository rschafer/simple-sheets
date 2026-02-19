"use client";

import { useState, useMemo } from "react";
import { useDashboard, ProjectPlanRow } from "@/context/DashboardContext";

const statusColors: Record<string, { bar: string; text: string }> = {
  "Complete": { bar: "#22c55e", text: "text-green-700" },
  "In Progress": { bar: "#3b82f6", text: "text-blue-700" },
  "Blocked": { bar: "#ef4444", text: "text-red-700" },
  "Not Started": { bar: "#9ca3af", text: "text-gray-500" },
};

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function generateConfluenceMarkup(rows: ProjectPlanRow[]): string {
  const lines: string[] = [];
  lines.push('<table>');
  lines.push('<tr><th>Task</th><th>Assignee</th><th>Status</th><th>Start</th><th>End</th></tr>');

  for (const row of rows) {
    const indent = "\u00A0\u00A0\u00A0\u00A0".repeat(row.indent);
    const bold = row.indent === 0;
    const taskCell = bold ? `<strong>${indent}${row.task}</strong>` : `${indent}${row.task}`;

    let statusMacro = row.status;
    if (row.status === "Complete") statusMacro = '<ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">Green</ac:parameter><ac:parameter ac:name="title">Complete</ac:parameter></ac:structured-macro>';
    else if (row.status === "In Progress") statusMacro = '<ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">Blue</ac:parameter><ac:parameter ac:name="title">In Progress</ac:parameter></ac:structured-macro>';
    else if (row.status === "Blocked") statusMacro = '<ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">Red</ac:parameter><ac:parameter ac:name="title">Blocked</ac:parameter></ac:structured-macro>';
    else if (row.status === "Not Started") statusMacro = '<ac:structured-macro ac:name="status"><ac:parameter ac:name="colour">Grey</ac:parameter><ac:parameter ac:name="title">Not Started</ac:parameter></ac:structured-macro>';

    lines.push(`<tr><td>${taskCell}</td><td>${row.assignee || ""}</td><td>${statusMacro}</td><td>${row.startDate || ""}</td><td>${row.endDate || ""}</td></tr>`);
  }

  lines.push('</table>');
  return lines.join("\n");
}

export default function GanttChart() {
  const { data } = useDashboard();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const rows = data.projectPlan;

  // Only show rows that have at least one date
  const rowsWithDates = useMemo(() => rows.filter((r) => r.startDate || r.endDate), [rows]);

  const { minDate, maxDate, totalRange, paddedMin, paddedMax, ticks, nowPct } = useMemo(() => {
    if (rowsWithDates.length === 0) return { minDate: new Date(), maxDate: new Date(), totalRange: 0, paddedMin: new Date(), paddedMax: new Date(), ticks: [] as { date: Date; pct: number }[], nowPct: 0 };

    const now = new Date();
    const allDates: number[] = [];
    for (const r of rowsWithDates) {
      if (r.startDate) allDates.push(new Date(r.startDate).getTime());
      if (r.endDate) allDates.push(new Date(r.endDate).getTime());
    }

    const min = new Date(Math.min(now.getTime(), ...allDates));
    const max = new Date(Math.max(now.getTime(), ...allDates));
    const range = max.getTime() - min.getTime();
    const pMin = new Date(min.getTime() - range * 0.05);
    const pMax = new Date(max.getTime() + range * 0.1);
    const total = pMax.getTime() - pMin.getTime();

    const tickList: { date: Date; pct: number }[] = [];
    const tickStart = new Date(pMin.getFullYear(), pMin.getMonth() + 1, 1);
    for (let d = new Date(tickStart); d <= pMax; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      const pct = ((d.getTime() - pMin.getTime()) / total) * 100;
      if (pct > 1 && pct < 99) {
        tickList.push({ date: new Date(d), pct });
      }
    }

    const nPct = total > 0 ? ((now.getTime() - pMin.getTime()) / total) * 100 : 0;

    return { minDate: min, maxDate: max, totalRange: total, paddedMin: pMin, paddedMax: pMax, ticks: tickList, nowPct: nPct };
  }, [rowsWithDates]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
  };

  const exportConfluence = () => {
    const markup = generateConfluenceMarkup(rows);
    navigator.clipboard.writeText(markup);
    setCopied("confluence");
    setTimeout(() => setCopied(null), 2000);
  };

  if (rows.length === 0) return null;

  const ROW_HEIGHT = 28;
  const LABEL_WIDTH = 220;

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <span className={`transition-transform text-xs ${expanded ? "rotate-90" : ""}`}>{"\u25B6"}</span>
          Gantt Chart
        </button>
        {expanded && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {copied === "link" ? "Copied!" : "Share Link"}
            </button>
            <button
              onClick={exportConfluence}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {copied === "confluence" ? "Copied!" : "Export to Confluence"}
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <>
          {rowsWithDates.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Add start/end dates to tasks to see the Gantt chart.</p>
          ) : (
            <div className="overflow-x-auto">
              {/* Legend */}
              <div className="flex items-center gap-4 mb-3">
                {Object.entries(statusColors).map(([status, { bar }]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: bar }} />
                    <span className="text-[10px] text-gray-500">{status}</span>
                  </div>
                ))}
              </div>

              <div className="flex" style={{ minWidth: "700px" }}>
                {/* Left: Task labels */}
                <div className="flex-shrink-0" style={{ width: `${LABEL_WIDTH}px` }}>
                  <div className="h-6 text-[10px] text-gray-400 uppercase tracking-wider font-medium flex items-end pb-1 px-1">Task</div>
                  {rows.map((row) => {
                    const hasDates = row.startDate || row.endDate;
                    return (
                      <div
                        key={row.id}
                        className={`flex items-center pr-3 ${hoveredRow === row.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                        style={{ height: `${ROW_HEIGHT}px`, paddingLeft: `${row.indent * 16 + 4}px` }}
                        onMouseEnter={() => setHoveredRow(row.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <span
                          className={`text-xs truncate ${
                            row.indent === 0
                              ? "font-semibold text-gray-900 dark:text-gray-100"
                              : "text-gray-600 dark:text-gray-400"
                          } ${!hasDates ? "opacity-40" : ""}`}
                          title={row.task}
                        >
                          {row.task}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Bars area */}
                <div className="flex-1 min-w-0 border-l border-gray-200 dark:border-gray-700">
                  {/* Axis header */}
                  <div className="relative h-6">
                    {ticks.map((tick, i) => (
                      <span
                        key={i}
                        className="absolute -translate-x-1/2 text-[10px] text-gray-400 bottom-1"
                        style={{ left: `${tick.pct}%` }}
                      >
                        {tick.date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                      </span>
                    ))}
                  </div>

                  {/* Rows */}
                  <div className="relative">
                    {/* Grid lines */}
                    {ticks.map((tick, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-gray-100 dark:border-gray-800"
                        style={{ left: `${tick.pct}%` }}
                      />
                    ))}

                    {/* Today line */}
                    {nowPct > 0 && nowPct < 100 && (
                      <div
                        className="absolute top-0 bottom-0 border-l-2 border-blue-400 border-dashed z-10"
                        style={{ left: `${nowPct}%` }}
                      >
                        <span className="absolute -top-5 -translate-x-1/2 text-[9px] text-blue-500 font-medium bg-white dark:bg-gray-900 px-1 rounded">
                          Today
                        </span>
                      </div>
                    )}

                    {rows.map((row) => {
                      const hasDates = row.startDate || row.endDate;
                      if (!hasDates || totalRange <= 0) {
                        return (
                          <div
                            key={row.id}
                            style={{ height: `${ROW_HEIGHT}px` }}
                            className={hoveredRow === row.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                            onMouseEnter={() => setHoveredRow(row.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                          />
                        );
                      }

                      const start = row.startDate ? new Date(row.startDate) : new Date(row.endDate);
                      const end = row.endDate ? new Date(row.endDate) : new Date(row.startDate);
                      const startPct = Math.max(0, ((start.getTime() - paddedMin.getTime()) / totalRange) * 100);
                      const endPct = Math.min(100, ((end.getTime() - paddedMin.getTime()) / totalRange) * 100);
                      const widthPct = Math.max(1, endPct - startPct);

                      const colors = statusColors[row.status] || statusColors["Not Started"];
                      const isPhase = row.indent === 0;

                      return (
                        <div
                          key={row.id}
                          className={`relative flex items-center ${hoveredRow === row.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                          style={{ height: `${ROW_HEIGHT}px` }}
                          onMouseEnter={() => setHoveredRow(row.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <div
                            className={`absolute ${isPhase ? "h-3" : "h-4"} rounded-full group cursor-default`}
                            style={{
                              left: `${startPct}%`,
                              width: `${widthPct}%`,
                              backgroundColor: colors.bar,
                              opacity: isPhase ? 0.5 : 0.8,
                            }}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                              <div className="bg-gray-800 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                <div className="font-medium">{row.task}</div>
                                <div className="text-gray-300 mt-0.5">
                                  {formatDate(row.startDate)} - {formatDate(row.endDate)}
                                </div>
                                <div className="mt-0.5">{row.status}{row.assignee ? ` \u00B7 ${row.assignee}` : ""}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
