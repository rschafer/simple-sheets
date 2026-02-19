"use client";

import { useState } from "react";
import { useDashboard, ExecutiveSummary as ESType } from "@/context/DashboardContext";
import { useNavigation, ProductAreaTemplate } from "@/context/NavigationContext";

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

const MAX_SENTENCES = 3;

function countSentences(text: string): number {
  if (!text.trim()) return 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences.length;
}

function exceedsLimit(text: string): boolean {
  return countSentences(text) > MAX_SENTENCES;
}

function summarizeText(text: string): string {
  if (!text.trim()) return text;
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  if (sentences.length <= MAX_SENTENCES) return text;
  return sentences.slice(0, MAX_SENTENCES).join(" ");
}

const fallbackTemplate: ProductAreaTemplate = {
  labels: {
    recentProgress: "Recent Progress",
    nextSteps: "Next Steps",
    risksAndMitigation: "Risks and Mitigation",
    impactToOtherPrograms: "Impact to Other Programs",
  },
  defaultContent: {
    recentProgress: "- ",
    nextSteps: "- ",
    risksAndMitigation: "- ",
    impactToOtherPrograms: "- ",
  },
};

function SummaryBullets({ text }: { text: string }) {
  const bullets = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => (line.startsWith("- ") ? line.slice(2) : line));

  if (bullets.length === 0) return null;

  return (
    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
      {bullets.map((bullet, i) => (
        <li key={i}>{bullet}</li>
      ))}
    </ul>
  );
}

function TemplateEditorModal({
  template,
  onSave,
  onClose,
}: {
  template: ProductAreaTemplate;
  onSave: (t: ProductAreaTemplate) => void;
  onClose: () => void;
}) {
  const [labels, setLabels] = useState({ ...template.labels });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Template</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize the section labels for this product area&apos;s executive summary template.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Section 1 Label</label>
            <input
              value={labels.recentProgress}
              onChange={(e) => setLabels({ ...labels, recentProgress: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Section 2 Label</label>
            <input
              value={labels.nextSteps}
              onChange={(e) => setLabels({ ...labels, nextSteps: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Section 3 Label</label>
            <input
              value={labels.risksAndMitigation}
              onChange={(e) => setLabels({ ...labels, risksAndMitigation: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Section 4 Label</label>
            <input
              value={labels.impactToOtherPrograms}
              onChange={(e) => setLabels({ ...labels, impactToOtherPrograms: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => onSave({ ...template, labels })}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Template
          </button>
          <button
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExecutiveSummary() {
  const { data, updateData } = useDashboard();
  const { getCurrentProductArea, isAdmin, updateProductAreaTemplate } = useNavigation();
  const [editing, setEditing] = useState(false);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [aiStartDate, setAiStartDate] = useState("");
  const [aiEndDate, setAiEndDate] = useState("");
  const [generating, setGenerating] = useState(false);

  const currentPA = getCurrentProductArea();
  const template = currentPA?.template || fallbackTemplate;

  const [draft, setDraft] = useState<Omit<ESType, "id" | "date">>({
    recentProgress: template.defaultContent.recentProgress,
    nextSteps: template.defaultContent.nextSteps,
    risksAndMitigation: template.defaultContent.risksAndMitigation,
    impactToOtherPrograms: template.defaultContent.impactToOtherPrograms,
  });

  const startNewEntry = () => {
    setDraft({
      recentProgress: template.defaultContent.recentProgress,
      nextSteps: template.defaultContent.nextSteps,
      risksAndMitigation: template.defaultContent.risksAndMitigation,
      impactToOtherPrograms: template.defaultContent.impactToOtherPrograms,
    });
    setEditing(true);
    setViewingHistoryId(null);
  };

  const generateAiSummary = async () => {
    if (!aiStartDate || !aiEndDate) return;

    setGenerating(true);

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: data.projectName,
          projectPlan: data.projectPlan,
          raidItems: data.raidItems,
          milestones: data.milestones,
          startDate: aiStartDate,
          endDate: aiEndDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const result = await response.json();

      setDraft({
        recentProgress: result.summary.recentProgress,
        nextSteps: result.summary.nextSteps,
        risksAndMitigation: result.summary.risksAndMitigation,
        impactToOtherPrograms: result.summary.impactToOtherPrograms,
      });

      setShowAiModal(false);
      setEditing(true);
    } catch (error) {
      console.error("AI generation error:", error);
      alert("Failed to generate summary. Please try again.");
    } finally {
      setGenerating(false);
    }
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

  const handleSaveTemplate = (newTemplate: ProductAreaTemplate) => {
    if (currentPA) {
      updateProductAreaTemplate(currentPA.id, newTemplate);
    }
    setShowTemplateEditor(false);
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
          {isAdmin && (
            <button
              onClick={() => setShowTemplateEditor(true)}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Edit Template
            </button>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAiModal(true)}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Generate with AI
            </button>
            <span
              className="text-gray-400 hover:text-gray-600 cursor-help"
              title="Uses Claude AI (Anthropic) to analyze your project plan, milestones, and RAID log to generate a natural language executive summary."
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <button
            onClick={startNewEntry}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + New Entry
          </button>
        </div>
      </div>

      {/* Template Editor Modal (Admin only) */}
      {showTemplateEditor && (
        <TemplateEditorModal
          template={template}
          onSave={handleSaveTemplate}
          onClose={() => setShowTemplateEditor(false)}
        />
      )}

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
              <p className="text-xs text-gray-400 mt-3">Powered by Claude AI (Anthropic)</p>
            </div>
          </div>
        </div>
      )}

      {editing ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-600">
                {template.labels.recentProgress}
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${exceedsLimit(draft.recentProgress) ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {countSentences(draft.recentProgress)}/{MAX_SENTENCES} sentences
                </span>
                {exceedsLimit(draft.recentProgress) && (
                  <button
                    onClick={() => setDraft({ ...draft, recentProgress: summarizeText(draft.recentProgress) })}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Summarize with AI
                  </button>
                )}
              </div>
            </div>
            <textarea
              autoFocus
              value={draft.recentProgress}
              onChange={(e) => setDraft({ ...draft, recentProgress: e.target.value })}
              rows={4}
              className={`w-full rounded border px-3 py-2 text-sm text-gray-700 focus:outline-none ${exceedsLimit(draft.recentProgress) ? "border-red-300 focus:border-red-400" : "border-gray-300 focus:border-blue-400"}`}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-600">
                {template.labels.nextSteps}
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${exceedsLimit(draft.nextSteps) ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {countSentences(draft.nextSteps)}/{MAX_SENTENCES} sentences
                </span>
                {exceedsLimit(draft.nextSteps) && (
                  <button
                    onClick={() => setDraft({ ...draft, nextSteps: summarizeText(draft.nextSteps) })}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Summarize with AI
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={draft.nextSteps}
              onChange={(e) => setDraft({ ...draft, nextSteps: e.target.value })}
              rows={4}
              className={`w-full rounded border px-3 py-2 text-sm text-gray-700 focus:outline-none ${exceedsLimit(draft.nextSteps) ? "border-red-300 focus:border-red-400" : "border-gray-300 focus:border-blue-400"}`}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-600">
                {template.labels.risksAndMitigation}
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${exceedsLimit(draft.risksAndMitigation) ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {countSentences(draft.risksAndMitigation)}/{MAX_SENTENCES} sentences
                </span>
                {exceedsLimit(draft.risksAndMitigation) && (
                  <button
                    onClick={() => setDraft({ ...draft, risksAndMitigation: summarizeText(draft.risksAndMitigation) })}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Summarize with AI
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={draft.risksAndMitigation}
              onChange={(e) => setDraft({ ...draft, risksAndMitigation: e.target.value })}
              rows={4}
              className={`w-full rounded border px-3 py-2 text-sm text-gray-700 focus:outline-none ${exceedsLimit(draft.risksAndMitigation) ? "border-red-300 focus:border-red-400" : "border-gray-300 focus:border-blue-400"}`}
            />
          </div>
          {template.labels.impactToOtherPrograms && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-600">
                  {template.labels.impactToOtherPrograms}
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${exceedsLimit(draft.impactToOtherPrograms) ? "text-red-500 font-medium" : "text-gray-400"}`}>
                    {countSentences(draft.impactToOtherPrograms)}/{MAX_SENTENCES} sentences
                  </span>
                  {exceedsLimit(draft.impactToOtherPrograms) && (
                    <button
                      onClick={() => setDraft({ ...draft, impactToOtherPrograms: summarizeText(draft.impactToOtherPrograms) })}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Summarize with AI
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={draft.impactToOtherPrograms}
                onChange={(e) => setDraft({ ...draft, impactToOtherPrograms: e.target.value })}
                rows={4}
                className={`w-full rounded border px-3 py-2 text-sm text-gray-700 focus:outline-none ${exceedsLimit(draft.impactToOtherPrograms) ? "border-red-300 focus:border-red-400" : "border-gray-300 focus:border-blue-400"}`}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            {(exceedsLimit(draft.recentProgress) ||
              exceedsLimit(draft.nextSteps) ||
              exceedsLimit(draft.risksAndMitigation) ||
              (template.labels.impactToOtherPrograms && exceedsLimit(draft.impactToOtherPrograms))) && (
              <span className="text-xs text-red-500">Each section must be 3 sentences or less</span>
            )}
            <button
              onClick={saveEntry}
              disabled={
                exceedsLimit(draft.recentProgress) ||
                exceedsLimit(draft.nextSteps) ||
                exceedsLimit(draft.risksAndMitigation) ||
                Boolean(template.labels.impactToOtherPrograms && exceedsLimit(draft.impactToOtherPrograms))
              }
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
            <h3 className="text-sm font-semibold text-gray-600 mb-1">{template.labels.recentProgress}</h3>
            <SummaryBullets text={displaySummary.recentProgress} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">{template.labels.nextSteps}</h3>
            <SummaryBullets text={displaySummary.nextSteps} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">{template.labels.risksAndMitigation}</h3>
            <SummaryBullets text={displaySummary.risksAndMitigation} />
          </div>
          {displaySummary.impactToOtherPrograms && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">{template.labels.impactToOtherPrograms}</h3>
              <SummaryBullets text={displaySummary.impactToOtherPrograms} />
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
