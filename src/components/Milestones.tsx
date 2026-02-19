"use client";

import { useState } from "react";
import { useDashboard, Milestone, MilestoneStatus } from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const statuses: MilestoneStatus[] = ["Not Started", "In Progress", "Complete"];

const statusColors: Record<MilestoneStatus, string> = {
  "Not Started": "bg-gray-100 text-gray-600",
  "In Progress": "bg-blue-100 text-blue-700",
  Complete: "bg-green-100 text-green-700",
};

function formatShortDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Milestones() {
  const { data, updateData } = useDashboard();
  const [expanded, setExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Milestone | null>(null);

  const addMilestone = () => {
    const m: Milestone = {
      id: generateId(),
      name: "",
      status: "Not Started",
      startDate: "",
      finishDate: "",
    };
    updateData({ milestones: [...data.milestones, m] });
    setEditingId(m.id);
    setDraft({ ...m });
  };

  const startEditing = (m: Milestone) => {
    setEditingId(m.id);
    setDraft({ ...m });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveDraft = () => {
    if (draft) {
      updateData({
        milestones: data.milestones.map((m) => (m.id === draft.id ? { ...m, ...draft } : m)),
      });
    }
    setEditingId(null);
    setDraft(null);
  };

  const removeMilestone = (id: string) => {
    updateData({ milestones: data.milestones.filter((m) => m.id !== id) });
    if (editingId === id) {
      setEditingId(null);
      setDraft(null);
    }
  };

  const isOverdue = (m: Milestone) => {
    if (m.status === "Complete" || !m.finishDate) return false;
    return new Date(m.finishDate) < new Date();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide"
        >
          <span className={`transition-transform text-xs ${expanded ? "rotate-90" : ""}`}>{"\u25B6"}</span>
          Milestones
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 normal-case tracking-normal">
            ({data.milestones.length})
          </span>
        </button>
        {expanded && (
          <button onClick={addMilestone} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            + Add
          </button>
        )}
      </div>

      {expanded && (data.milestones.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-xs italic">No milestones yet.</p>
      ) : (
        <div className="space-y-1.5">
          {data.milestones.map((m) => (
            <div
              key={m.id}
              className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                isOverdue(m) ? "bg-red-50 dark:bg-red-900/20" : ""
              }`}
            >
              {editingId === m.id && draft ? (
                <div className="flex-1 space-y-1.5">
                  <input
                    autoFocus
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Milestone name..."
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
                    onKeyDown={(e) => { if (e.key === "Enter") saveDraft(); if (e.key === "Escape") cancelEditing(); }}
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={draft.status}
                      onChange={(e) => setDraft({ ...draft, status: e.target.value as MilestoneStatus })}
                      className={`rounded px-1.5 py-0.5 text-xs font-medium border-0 cursor-pointer ${statusColors[draft.status]}`}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                      type="date"
                      value={draft.finishDate}
                      onChange={(e) => setDraft({ ...draft, finishDate: e.target.value })}
                      className="text-xs border border-gray-300 rounded px-1.5 py-0.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button onClick={cancelEditing} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        Cancel
                      </button>
                      <button onClick={saveDraft} className="text-xs text-white bg-blue-600 hover:bg-blue-700 rounded px-2 py-0.5 font-medium">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startEditing(m)}>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-medium text-gray-900 dark:text-gray-100 truncate ${m.name ? "" : "text-gray-400 italic"}`}>
                        {m.name || "Untitled milestone"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex px-1.5 py-0 rounded text-[10px] font-medium leading-4 ${statusColors[m.status]}`}>
                        {m.status}
                      </span>
                      {m.finishDate && (
                        <span className={`text-[10px] ${isOverdue(m) ? "text-red-600 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                          Due {formatShortDate(m.finishDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeMilestone(m.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
