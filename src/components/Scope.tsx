"use client";

import { useState, useRef, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";

export default function Scope() {
  const { data, updateData } = useDashboard();
  const [expanded, setExpanded] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(false);
  const [editingScope, setEditingScope] = useState(false);
  const [periodDraft, setPeriodDraft] = useState(data.scopePeriod);
  const [scopeDraft, setScopeDraft] = useState(data.scopeText);
  const periodRef = useRef<HTMLInputElement>(null);
  const scopeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingPeriod && periodRef.current) {
      periodRef.current.focus();
      periodRef.current.select();
    }
  }, [editingPeriod]);

  useEffect(() => {
    if (editingScope && scopeRef.current) {
      scopeRef.current.focus();
    }
  }, [editingScope]);

  const savePeriod = () => {
    updateData({ scopePeriod: periodDraft.trim() || "Q1 2026" });
    setEditingPeriod(false);
  };

  const saveScope = () => {
    updateData({ scopeText: scopeDraft });
    setEditingScope(false);
  };

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <span className={`transition-transform text-xs ${expanded ? "rotate-90" : ""}`}>&#9654;</span>
          Scope
        </button>
        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
        {editingPeriod ? (
          <input
            ref={periodRef}
            value={periodDraft}
            onChange={(e) => setPeriodDraft(e.target.value)}
            onBlur={savePeriod}
            onKeyDown={(e) => {
              if (e.key === "Enter") savePeriod();
              if (e.key === "Escape") { setPeriodDraft(data.scopePeriod); setEditingPeriod(false); }
            }}
            className="rounded border px-2 py-0.5 text-sm"
          />
        ) : (
          <span
            onClick={() => { setPeriodDraft(data.scopePeriod); setEditingPeriod(true); }}
            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1"
          >
            {data.scopePeriod}
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-3">
          {editingScope ? (
            <div>
              <textarea
                ref={scopeRef}
                value={scopeDraft}
                onChange={(e) => setScopeDraft(e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={saveScope} className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                  Save
                </button>
                <button onClick={() => { setScopeDraft(data.scopeText); setEditingScope(false); }} className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => { setScopeDraft(data.scopeText); setEditingScope(true); }}
              className="cursor-pointer rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 whitespace-pre-wrap break-all"
            >
              {data.scopeText || <span className="text-gray-500 dark:text-gray-400 italic">Click to add scope...</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
