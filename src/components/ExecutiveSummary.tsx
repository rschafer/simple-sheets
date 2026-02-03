"use client";

import { useState } from "react";
import { useDashboard, ExecutiveSummary as ESType } from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const TEMPLATES = {
  blank: {
    name: "Blank",
    recentProgress: "",
    nextSteps: "",
    risksAndMitigation: "",
    impactToOtherPrograms: "",
  },
  wallace: {
    name: "Wallace",
    recentProgress: "- ",
    nextSteps: "- ",
    risksAndMitigation: "- ",
    impactToOtherPrograms: "- ",
  },
};

export default function ExecutiveSummary() {
  const { data, updateData } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TEMPLATES>("wallace");
  const [draft, setDraft] = useState<Omit<ESType, "id" | "date">>({
    recentProgress: TEMPLATES.wallace.recentProgress,
    nextSteps: TEMPLATES.wallace.nextSteps,
    risksAndMitigation: TEMPLATES.wallace.risksAndMitigation,
    impactToOtherPrograms: TEMPLATES.wallace.impactToOtherPrograms,
  });

  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey];
    setSelectedTemplate(templateKey);
    setDraft({
      recentProgress: template.recentProgress,
      nextSteps: template.nextSteps,
      risksAndMitigation: template.risksAndMitigation,
      impactToOtherPrograms: template.impactToOtherPrograms,
    });
  };

  const startNewEntry = () => {
    applyTemplate(selectedTemplate);
    setEditing(true);
    setViewingHistoryId(null);
  };

  const saveEntry = () => {
    const entry: ESType = {
      id: generateId(),
      date: new Date().toISOString(),
      ...draft,
    };
    updateData({ executiveSummaries: [entry, ...data.executiveSummaries] });
    setEditing(false);
  };

  const latestSummary = data.executiveSummaries[0];
  const viewingSummary = viewingHistoryId
    ? data.executiveSummaries.find((s) => s.id === viewingHistoryId)
    : null;
  const displaySummary = viewingSummary || latestSummary;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Executive Summary</h2>
        <div className="flex gap-2">
          {data.executiveSummaries.length > 0 && (
            <select
              value={viewingHistoryId || ""}
              onChange={(e) => setViewingHistoryId(e.target.value || null)}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600"
            >
              <option value="">Latest</option>
              {data.executiveSummaries.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatDate(s.date)}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={startNewEntry}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + New Entry
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <label className="text-sm text-gray-500">Template:</label>
            <select
              value={selectedTemplate}
              onChange={(e) => applyTemplate(e.target.value as keyof typeof TEMPLATES)}
              className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-600"
            >
              {Object.entries(TEMPLATES).map(([key, template]) => (
                <option key={key} value={key}>{template.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Recent Progress</label>
            <textarea
              autoFocus
              value={draft.recentProgress}
              onChange={(e) => setDraft({ ...draft, recentProgress: e.target.value })}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Next Steps</label>
            <textarea
              value={draft.nextSteps}
              onChange={(e) => setDraft({ ...draft, nextSteps: e.target.value })}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Risks and Mitigation Plan</label>
            <textarea
              value={draft.risksAndMitigation}
              onChange={(e) => setDraft({ ...draft, risksAndMitigation: e.target.value })}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Impact to Other Programs</label>
            <textarea
              value={draft.impactToOtherPrograms}
              onChange={(e) => setDraft({ ...draft, impactToOtherPrograms: e.target.value })}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveEntry}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Summary
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : displaySummary ? (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">{formatDate(displaySummary.date)}</p>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Recent Progress</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{displaySummary.recentProgress}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Next Steps</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{displaySummary.nextSteps}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Risks and Mitigation Plan</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{displaySummary.risksAndMitigation}</p>
          </div>
          {displaySummary.impactToOtherPrograms && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Impact to Other Programs</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{displaySummary.impactToOtherPrograms}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic">
          No summaries yet. Click &quot;+ New Entry&quot; to create your first weekly update.
        </p>
      )}
    </div>
  );
}
