"use client";

import { useState } from "react";
import {
  useDashboard,
  RaidItem,
  RaidType,
  RaidSeverity,
  RaidStatus,
} from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const raidTypes: RaidType[] = ["Risk", "Action", "Issue", "Dependency"];
const severities: RaidSeverity[] = ["Critical", "High", "Medium", "Low"];
const raidStatuses: RaidStatus[] = ["Open", "In Progress", "Closed"];

const severityColors: Record<RaidSeverity, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-gray-100 text-gray-600",
};

export default function RaidLog() {
  const { data, updateData } = useDashboard();
  const [collapsed, setCollapsed] = useState(false);
  const [panelItem, setPanelItem] = useState<RaidItem | null>(null);
  const [filterType, setFilterType] = useState<RaidType | "">("");
  const [filterSeverity, setFilterSeverity] = useState<RaidSeverity | "">("");
  const [filterStatus, setFilterStatus] = useState<RaidStatus | "">("");
  const [sortField, setSortField] = useState<keyof RaidItem>("summary");
  const [sortAsc, setSortAsc] = useState(true);

  const addItem = () => {
    const item: RaidItem = {
      id: generateId(),
      summary: "",
      severity: "Medium",
      type: "Risk",
      status: "Open",
      assignedTo: "",
      nextSteps: "",
    };
    updateData({ raidItems: [...data.raidItems, item] });
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

  const filtered = data.raidItems
    .filter((r) => (!filterType || r.type === filterType))
    .filter((r) => (!filterSeverity || r.severity === filterSeverity))
    .filter((r) => (!filterStatus || r.status === filterStatus));

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    return sortAsc ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const toggleSort = (field: keyof RaidItem) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: keyof RaidItem }) => (
    <span className="ml-1 text-gray-300">{sortField === field ? (sortAsc ? "\u25B2" : "\u25BC") : ""}</span>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-700"
        >
          <span className={`transition-transform ${collapsed ? "" : "rotate-90"}`}>{"\u25B6"}</span>
          RAID Log
          <span className="text-xs text-gray-400 font-normal">({data.raidItems.length} items)</span>
        </button>
        <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          + Add Item
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Filters */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as RaidType | "")} className="rounded border px-2 py-1 text-xs">
              <option value="">All Types</option>
              {raidTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value as RaidSeverity | "")} className="rounded border px-2 py-1 text-xs">
              <option value="">All Severities</option>
              {severities.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as RaidStatus | "")} className="rounded border px-2 py-1 text-xs">
              <option value="">All Statuses</option>
              {raidStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {sorted.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No RAID items. Click &quot;+ Add Item&quot; to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 pr-3 cursor-pointer" onClick={() => toggleSort("summary")}>
                      Summary<SortIcon field="summary" />
                    </th>
                    <th className="pb-2 pr-3 cursor-pointer" onClick={() => toggleSort("severity")}>
                      Severity<SortIcon field="severity" />
                    </th>
                    <th className="pb-2 pr-3 cursor-pointer" onClick={() => toggleSort("type")}>
                      Type<SortIcon field="type" />
                    </th>
                    <th className="pb-2 pr-3 cursor-pointer" onClick={() => toggleSort("status")}>
                      Status<SortIcon field="status" />
                    </th>
                    <th className="pb-2 pr-3 cursor-pointer" onClick={() => toggleSort("assignedTo")}>
                      Assigned To<SortIcon field="assignedTo" />
                    </th>
                    <th className="pb-2 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 group">
                      <td className="py-2 pr-3">
                        <textarea
                          value={item.summary}
                          onChange={(e) => updateItem(item.id, { summary: e.target.value })}
                          placeholder="Enter summary..."
                          rows={2}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 outline-none resize-y min-h-[2.5rem]"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          value={item.severity}
                          onChange={(e) => updateItem(item.id, { severity: e.target.value as RaidSeverity })}
                          className={`rounded px-2 py-1 text-xs font-medium border-0 cursor-pointer ${severityColors[item.severity]}`}
                        >
                          {severities.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(item.id, { type: e.target.value as RaidType })}
                          className="rounded border-0 px-2 py-1 text-xs bg-transparent cursor-pointer"
                        >
                          {raidTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          value={item.status}
                          onChange={(e) => updateItem(item.id, { status: e.target.value as RaidStatus })}
                          className="rounded border-0 px-2 py-1 text-xs bg-transparent cursor-pointer"
                        >
                          {raidStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          value={item.assignedTo}
                          onChange={(e) => updateItem(item.id, { assignedTo: e.target.value })}
                          placeholder="Enter name..."
                          className="w-full border border-gray-200 rounded px-2 py-1 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 outline-none"
                        />
                      </td>
                      <td className="py-2 flex gap-1">
                        <button
                          onClick={() => setPanelItem(item)}
                          className="text-xs text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
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
        </>
      )}

      {/* Side Panel */}
      {panelItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setPanelItem(null)} />
          <div className="relative w-full max-w-md bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">RAID Item Details</h3>
              <button onClick={() => setPanelItem(null)} className="text-gray-400 hover:text-gray-600 text-xl">
                x
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Summary</label>
                <input
                  value={panelItem.summary}
                  onChange={(e) => { updateItem(panelItem.id, { summary: e.target.value }); setPanelItem({ ...panelItem, summary: e.target.value }); }}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <select
                    value={panelItem.type}
                    onChange={(e) => { const v = e.target.value as RaidType; updateItem(panelItem.id, { type: v }); setPanelItem({ ...panelItem, type: v }); }}
                    className="w-full rounded border px-3 py-2 text-sm"
                  >
                    {raidTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Severity</label>
                  <select
                    value={panelItem.severity}
                    onChange={(e) => { const v = e.target.value as RaidSeverity; updateItem(panelItem.id, { severity: v }); setPanelItem({ ...panelItem, severity: v }); }}
                    className="w-full rounded border px-3 py-2 text-sm"
                  >
                    {severities.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={panelItem.status}
                    onChange={(e) => { const v = e.target.value as RaidStatus; updateItem(panelItem.id, { status: v }); setPanelItem({ ...panelItem, status: v }); }}
                    className="w-full rounded border px-3 py-2 text-sm"
                  >
                    {raidStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Assigned To</label>
                  <input
                    value={panelItem.assignedTo}
                    onChange={(e) => { updateItem(panelItem.id, { assignedTo: e.target.value }); setPanelItem({ ...panelItem, assignedTo: e.target.value }); }}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Update / Next Steps</label>
                <textarea
                  value={panelItem.nextSteps}
                  onChange={(e) => { updateItem(panelItem.id, { nextSteps: e.target.value }); setPanelItem({ ...panelItem, nextSteps: e.target.value }); }}
                  rows={4}
                  className="w-full rounded border px-3 py-2 text-sm"
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
