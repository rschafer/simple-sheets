"use client";

import { useState } from "react";
import { useDashboard, ProjectPlanRow } from "@/context/DashboardContext";
import GanttChart from "./GanttChart";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const statusOptions = ["Not Started", "In Progress", "Complete", "Blocked"];

export default function ProjectPlan() {
  const { data, updateData } = useDashboard();
  const [expanded, setExpanded] = useState(false);

  const addRow = (indent = 0) => {
    const row: ProjectPlanRow = {
      id: generateId(),
      task: "",
      assignee: "",
      status: "Not Started",
      startDate: "",
      endDate: "",
      dependencies: "",
      notes: "",
      indent,
    };
    updateData({ projectPlan: [...data.projectPlan, row] });
  };

  const updateRow = (id: string, partial: Partial<ProjectPlanRow>) => {
    updateData({
      projectPlan: data.projectPlan.map((r) => (r.id === id ? { ...r, ...partial } : r)),
    });
  };

  const removeRow = (id: string) => {
    updateData({ projectPlan: data.projectPlan.filter((r) => r.id !== id) });
  };

  const indentRow = (id: string, delta: number) => {
    updateData({
      projectPlan: data.projectPlan.map((r) =>
        r.id === id ? { ...r, indent: Math.max(0, Math.min(3, r.indent + delta)) } : r
      ),
    });
  };

  const loadTemplate = () => {
    const template: ProjectPlanRow[] = [
      { id: generateId(), task: "Phase 1: Discovery", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 0 },
      { id: generateId(), task: "Stakeholder interviews", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 1 },
      { id: generateId(), task: "Requirements gathering", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 1 },
      { id: generateId(), task: "Phase 2: Planning", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 0 },
      { id: generateId(), task: "Architecture design", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 1 },
      { id: generateId(), task: "Sprint planning", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 1 },
      { id: generateId(), task: "Phase 3: Execution", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 0 },
      { id: generateId(), task: "Development Sprint 1", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 1 },
      { id: generateId(), task: "Development Sprint 2", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 1 },
      { id: generateId(), task: "QA & Testing", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 1 },
      { id: generateId(), task: "Launch", assignee: "", status: "Not Started", startDate: "", endDate: "", dependencies: "", notes: "", indent: 1 },
    ];
    updateData({ projectPlan: template });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide"
        >
          <span className={`transition-transform ${expanded ? "rotate-90" : ""}`}>{"\u25B6"}</span>
          Project Plan
          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">({data.projectPlan.length} tasks)</span>
        </button>
        {expanded && (
          <div className="flex gap-2">
            {data.projectPlan.length === 0 && (
              <button onClick={loadTemplate} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                Load Template
              </button>
            )}
            <button onClick={() => addRow()} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              + Add Task
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <>
          {data.projectPlan.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">No tasks yet. Load a template or add tasks manually.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <th className="pb-2 pr-3 min-w-[250px]">Task</th>
                    <th className="pb-2 pr-3 w-28">Assignee</th>
                    <th className="pb-2 pr-3 w-28">Status</th>
                    <th className="pb-2 pr-3 w-28">Start</th>
                    <th className="pb-2 pr-3 w-28">End</th>
                    <th className="pb-2 pr-3 w-32">Dependencies</th>
                    <th className="pb-2 pr-3 w-32">Notes</th>
                    <th className="pb-2 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.projectPlan.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50 group">
                      <td className="py-1.5 pr-3">
                        <div className="flex items-center" style={{ paddingLeft: `${row.indent * 20}px` }}>
                          <input
                            value={row.task}
                            onChange={(e) => updateRow(row.id, { task: e.target.value })}
                            placeholder="Task name"
                            className={`w-full bg-transparent border-0 outline-none placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-blue-300 rounded px-1 ${
                              row.indent === 0 ? "font-semibold text-gray-900" : "text-gray-700"
                            }`}
                          />
                        </div>
                      </td>
                      <td className="py-1.5 pr-3">
                        <input
                          value={row.assignee}
                          onChange={(e) => updateRow(row.id, { assignee: e.target.value })}
                          placeholder="Name"
                          className="w-full bg-transparent border-0 outline-none text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-blue-300 rounded px-1 text-xs"
                        />
                      </td>
                      <td className="py-1.5 pr-3">
                        <select
                          value={row.status}
                          onChange={(e) => updateRow(row.id, { status: e.target.value })}
                          className="rounded border-0 px-1 py-0.5 text-xs bg-transparent cursor-pointer"
                        >
                          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-1.5 pr-3">
                        <input
                          type="date"
                          value={row.startDate}
                          onChange={(e) => updateRow(row.id, { startDate: e.target.value })}
                          className="bg-transparent border-0 outline-none text-gray-700 text-xs cursor-pointer"
                        />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input
                          type="date"
                          value={row.endDate}
                          onChange={(e) => updateRow(row.id, { endDate: e.target.value })}
                          className="bg-transparent border-0 outline-none text-gray-700 text-xs cursor-pointer"
                        />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input
                          value={row.dependencies || ""}
                          onChange={(e) => updateRow(row.id, { dependencies: e.target.value })}
                          placeholder="Dependencies"
                          className="w-full bg-transparent border-0 outline-none text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-blue-300 rounded px-1 text-xs"
                        />
                      </td>
                      <td className="py-1.5 pr-3">
                        <input
                          value={row.notes}
                          onChange={(e) => updateRow(row.id, { notes: e.target.value })}
                          placeholder="Notes"
                          className="w-full bg-transparent border-0 outline-none text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-blue-300 rounded px-1 text-xs"
                        />
                      </td>
                      <td className="py-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => indentRow(row.id, 1)} className="text-xs text-gray-400 hover:text-gray-600" title="Indent">
                          {"\u2192"}
                        </button>
                        <button onClick={() => indentRow(row.id, -1)} className="text-xs text-gray-400 hover:text-gray-600" title="Outdent">
                          {"\u2190"}
                        </button>
                        <button onClick={() => removeRow(row.id)} className="text-xs text-red-400 hover:text-red-600">
                          x
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Gantt Chart */}
          <GanttChart />
        </>
      )}
    </div>
  );
}
