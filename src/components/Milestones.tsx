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

export default function Milestones() {
  const { data, updateData } = useDashboard();
  const [editingId, setEditingId] = useState<string | null>(null);

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
  };

  const updateMilestone = (id: string, partial: Partial<Milestone>) => {
    updateData({
      milestones: data.milestones.map((m) => (m.id === id ? { ...m, ...partial } : m)),
    });
  };

  const removeMilestone = (id: string) => {
    updateData({ milestones: data.milestones.filter((m) => m.id !== id) });
    if (editingId === id) setEditingId(null);
  };

  const isOverdue = (m: Milestone) => {
    if (m.status === "Complete" || !m.finishDate) return false;
    return new Date(m.finishDate) < new Date();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">Milestones</h2>
        <button onClick={addMilestone} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          + Add Milestone
        </button>
      </div>

      {data.milestones.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No milestones yet. Click &quot;+ Add Milestone&quot; to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-2 pr-4">Milestone</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Start</th>
                <th className="pb-2 pr-4">Finish</th>
                <th className="pb-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {data.milestones.map((m) => (
                <tr
                  key={m.id}
                  className={`border-b hover:bg-gray-50 group ${isOverdue(m) ? "bg-red-50" : ""}`}
                >
                  <td className="py-2 pr-4">
                    <input
                      value={m.name}
                      onChange={(e) => updateMilestone(m.id, { name: e.target.value })}
                      onFocus={() => setEditingId(m.id)}
                      onBlur={() => setEditingId(null)}
                      placeholder="Milestone name"
                      className="w-full bg-transparent border-0 outline-none text-gray-900 placeholder-gray-300 focus:bg-white focus:ring-1 focus:ring-blue-300 rounded px-1"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <select
                      value={m.status}
                      onChange={(e) => updateMilestone(m.id, { status: e.target.value as MilestoneStatus })}
                      className={`rounded px-2 py-1 text-xs font-medium border-0 cursor-pointer ${statusColors[m.status]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="date"
                      value={m.startDate}
                      onChange={(e) => updateMilestone(m.id, { startDate: e.target.value })}
                      className="bg-transparent border-0 outline-none text-gray-700 text-xs cursor-pointer"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="date"
                      value={m.finishDate}
                      onChange={(e) => updateMilestone(m.id, { finishDate: e.target.value })}
                      className={`bg-transparent border-0 outline-none text-xs cursor-pointer ${isOverdue(m) ? "text-red-600 font-medium" : "text-gray-700"}`}
                    />
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => removeMilestone(m.id)}
                      className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
