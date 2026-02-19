"use client";

import { useState } from "react";
import {
  useDashboard,
  RaidItem,
  RaidType,
  RaidStatus,
} from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const raidTypes: RaidType[] = ["Risk", "Action", "Issue", "Dependency"];
const raidStatuses: RaidStatus[] = ["Open", "In Progress", "Closed"];

const typeColors: Record<RaidType, string> = {
  Risk: "bg-red-100 text-red-700",
  Action: "bg-blue-100 text-blue-700",
  Issue: "bg-orange-100 text-orange-700",
  Dependency: "bg-purple-100 text-purple-700",
};

const statusColors: Record<RaidStatus, string> = {
  Open: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Closed: "bg-gray-100 text-gray-500",
};

export default function RaidLog() {
  const { data, updateData } = useDashboard();
  const [panelItem, setPanelItem] = useState<RaidItem | null>(null);
  const [filterType, setFilterType] = useState<RaidType | "">("");

  const addItem = () => {
    const item: RaidItem = {
      id: generateId(),
      summary: "",
      type: "Risk",
      status: "Open",
      assignedTo: "",
      nextSteps: "",
    };
    updateData({ raidItems: [...data.raidItems, item] });
    setPanelItem(item);
  };

  const updateItem = (id: string, partial: Partial<RaidItem>) => {
    const updated = data.raidItems.map((r) => (r.id === id ? { ...r, ...partial } : r));
    updateData({ raidItems: updated });
    if (panelItem && panelItem.id === id) {
      setPanelItem({ ...panelItem, ...partial });
    }
  };

  const removeItem = (id: string) => {
    updateData({ raidItems: data.raidItems.filter((r) => r.id !== id) });
    if (panelItem?.id === id) setPanelItem(null);
  };

  const filtered = data.raidItems.filter((r) => !filterType || r.type === filterType);
  const openCount = data.raidItems.filter((r) => r.status !== "Closed").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
          RAID
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1 normal-case tracking-normal">
            ({openCount} open)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as RaidType | "")}
            className="rounded border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 text-[10px] dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="">All</option>
            {raidTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={addItem} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            + Add
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-xs italic">No RAID items.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                item.status === "Closed" ? "opacity-50" : ""
              }`}
              onClick={() => setPanelItem(item)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-medium text-gray-900 dark:text-gray-100 truncate ${item.summary ? "" : "text-gray-400 italic"}`}>
                    {item.summary || "Untitled item"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex px-1.5 py-0 rounded text-[10px] font-medium leading-4 ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                  <span className={`inline-flex px-1.5 py-0 rounded text-[10px] font-medium leading-4 ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                  {item.assignedTo && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {item.assignedTo}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Side Panel */}
      {panelItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setPanelItem(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">RAID Item</h3>
              <button onClick={() => setPanelItem(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Summary</label>
                <input
                  value={panelItem.summary}
                  onChange={(e) => { updateItem(panelItem.id, { summary: e.target.value }); setPanelItem({ ...panelItem, summary: e.target.value }); }}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                  <select
                    value={panelItem.type}
                    onChange={(e) => { const v = e.target.value as RaidType; updateItem(panelItem.id, { type: v }); setPanelItem({ ...panelItem, type: v }); }}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                  >
                    {raidTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <select
                    value={panelItem.status}
                    onChange={(e) => { const v = e.target.value as RaidStatus; updateItem(panelItem.id, { status: v }); setPanelItem({ ...panelItem, status: v }); }}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                  >
                    {raidStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Assigned To</label>
                <input
                  value={panelItem.assignedTo}
                  onChange={(e) => { updateItem(panelItem.id, { assignedTo: e.target.value }); setPanelItem({ ...panelItem, assignedTo: e.target.value }); }}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes / Next Steps</label>
                <textarea
                  value={panelItem.nextSteps}
                  onChange={(e) => { updateItem(panelItem.id, { nextSteps: e.target.value }); setPanelItem({ ...panelItem, nextSteps: e.target.value }); }}
                  rows={4}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <button
                onClick={() => { removeItem(panelItem.id); setPanelItem(null); }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete this item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
