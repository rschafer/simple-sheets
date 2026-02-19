"use client";

import { useState } from "react";
import { useDashboard, KeyLink } from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function KeyLinks() {
  const { data, updateData } = useDashboard();
  const [expanded, setExpanded] = useState(false);
  const [panelLink, setPanelLink] = useState<KeyLink | null>(null);
  const [draft, setDraft] = useState<KeyLink | null>(null);

  const addLink = () => {
    const newLink: KeyLink = { id: generateId(), label: "", url: "https://" };
    updateData({ keyLinks: [...data.keyLinks, newLink] });
    setPanelLink(newLink);
    setDraft({ ...newLink });
  };

  const updateLink = (id: string, partial: Partial<KeyLink>) => {
    updateData({
      keyLinks: data.keyLinks.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    });
  };

  const removeLink = (id: string) => {
    updateData({ keyLinks: data.keyLinks.filter((l) => l.id !== id) });
    if (panelLink?.id === id) setPanelLink(null);
  };

  const openPanel = (link: KeyLink) => {
    setPanelLink(link);
    setDraft({ ...link });
  };

  const closePanel = () => {
    setPanelLink(null);
    setDraft(null);
  };

  const saveDraft = () => {
    if (draft) {
      updateLink(draft.id, { label: draft.label.trim() || "Untitled", url: draft.url.trim() });
      setPanelLink(draft);
    }
    closePanel();
  };

  // Get favicon domain for display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide"
        >
          <span className={`transition-transform text-xs ${expanded ? "rotate-90" : ""}`}>{"\u25B6"}</span>
          Key Links
          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">({data.keyLinks.length})</span>
        </button>
        {expanded && (
          <button onClick={addLink} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            + Add
          </button>
        )}
      </div>

      {expanded && (
        <>
          {data.keyLinks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-xs italic">No links added yet.</p>
          ) : (
            <div className="space-y-1.5">
              {data.keyLinks.map((link) => (
                <div
                  key={link.id}
                  className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => openPanel(link)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className={`font-medium text-gray-900 dark:text-gray-100 truncate ${link.label ? "" : "text-gray-400 italic"}`}>
                        {link.label || "Untitled link"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 ml-5">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                        {getDomain(link.url) || link.url}
                      </span>
                    </div>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-500 hover:text-blue-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open link"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeLink(link.id); }}
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
        </>
      )}

      {/* Side Panel */}
      {panelLink && draft && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={closePanel} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-xl p-6 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Edit Link</h3>
              <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Label</label>
                <input
                  autoFocus
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  placeholder="e.g. Technical Design Doc"
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                  onKeyDown={(e) => { if (e.key === "Enter") saveDraft(); }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label>
                <input
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                  onKeyDown={(e) => { if (e.key === "Enter") saveDraft(); }}
                />
              </div>
              {draft.url && draft.url !== "https://" && (
                <a
                  href={draft.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open link
                </a>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { removeLink(panelLink.id); closePanel(); }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={closePanel}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded border border-gray-300 dark:border-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDraft}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
