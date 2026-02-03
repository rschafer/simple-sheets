"use client";

import { useState } from "react";
import { useDashboard, ExecutiveSummary as ESType, ProjectPlanRow, RaidItem } from "@/context/DashboardContext";

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
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiStartDate, setAiStartDate] = useState("");
  const [aiEndDate, setAiEndDate] = useState("");
  const [generating, setGenerating] = useState(false);

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

  // Filter project plan items by date range
  const getItemsInDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const planItems = data.projectPlan.filter((item: ProjectPlanRow) => {
      if (!item.startDate && !item.endDate) return false;
      const itemStart = item.startDate ? new Date(item.startDate) : null;
      const itemEnd = item.endDate ? new Date(item.endDate) : null;

      // Include if item overlaps with date range
      if (itemStart && itemEnd) {
        return itemStart <= end && itemEnd >= start;
      }
      if (itemStart) return itemStart >= start && itemStart <= end;
      if (itemEnd) return itemEnd >= start && itemEnd <= end;
      return false;
    });

    const raidItems = data.raidItems.filter((item: RaidItem) => {
      // Include open RAID items
      return item.status !== "Closed";
    });

    return { planItems, raidItems };
  };

  // Generate summary from project plan data
  const generateAiSummary = () => {
    if (!aiStartDate || !aiEndDate) return;

    setGenerating(true);

    const { planItems, raidItems } = getItemsInDateRange(aiStartDate, aiEndDate);

    // Build Recent Progress from completed or in-progress items
    const completedItems = planItems.filter((p: ProjectPlanRow) => p.status === "Complete");
    const inProgressItems = planItems.filter((p: ProjectPlanRow) => p.status === "In Progress");

    let recentProgress = "";
    if (completedItems.length > 0) {
      recentProgress += completedItems.map((p: ProjectPlanRow) => `- Completed: ${p.task}`).join("\n");
    }
    if (inProgressItems.length > 0) {
      if (recentProgress) recentProgress += "\n";
      recentProgress += inProgressItems.map((p: ProjectPlanRow) => `- In progress: ${p.task}`).join("\n");
    }
    if (!recentProgress) recentProgress = "- No completed tasks in this period";

    // Build Next Steps from upcoming items
    const upcomingItems = planItems.filter((p: ProjectPlanRow) =>
      p.status === "Not Started" || p.status === "In Progress"
    );
    let nextSteps = upcomingItems.length > 0
      ? upcomingItems.slice(0, 5).map((p: ProjectPlanRow) => `- ${p.task}`).join("\n")
      : "- No upcoming tasks scheduled";

    // Build Risks from RAID items
    const risks = raidItems.filter((r: RaidItem) => r.type === "Risk" || r.type === "Issue");
    let risksAndMitigation = risks.length > 0
      ? risks.map((r: RaidItem) => `- [${r.severity}] ${r.summary}${r.nextSteps ? ` - ${r.nextSteps}` : ""}`).join("\n")
      : "- No open risks or issues";

    // Build Impact from dependencies
    const dependencies = raidItems.filter((r: RaidItem) => r.type === "Dependency");
    let impactToOtherPrograms = dependencies.length > 0
      ? dependencies.map((r: RaidItem) => `- ${r.summary}`).join("\n")
      : "- No dependencies identified";

    setDraft({
      recentProgress,
      nextSteps,
      risksAndMitigation,
      impactToOtherPrograms,
    });

    setGenerating(false);
    setShowAiModal(false);
    setEditing(true);
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
            onClick={() => setShowAiModal(true)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Generate with AI
          </button>
          <button
            onClick={startNewEntry}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + New Entry
          </button>
        </div>
      </div>

      {/* AI Generation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAiModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Summary with AI</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a date range to generate a summary based on your project plan and RAID log.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={aiStartDate}
                  onChange={(e) => setAiStartDate(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={aiEndDate}
                  onChange={(e) => setAiEndDate(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={generateAiSummary}
                  disabled={!aiStartDate || !aiEndDate || generating}
                  className="flex-1 rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {generating ? "Generating..." : "Generate"}
                </button>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
