"use client";

import { useState } from "react";
import { useDashboard, KeyLink } from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function KeyLinks() {
  const { data, updateData } = useDashboard();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const addLink = () => {
    const newLink: KeyLink = { id: generateId(), label: "New Link", url: "https://" };
    updateData({ keyLinks: [...data.keyLinks, newLink] });
    setEditingId(newLink.id);
    setEditLabel(newLink.label);
    setEditUrl(newLink.url);
  };

  const saveEdit = (id: string) => {
    updateData({
      keyLinks: data.keyLinks.map((l) =>
        l.id === id ? { ...l, label: editLabel.trim() || "Untitled", url: editUrl.trim() } : l
      ),
    });
    setEditingId(null);
  };

  const removeLink = (id: string) => {
    updateData({ keyLinks: data.keyLinks.filter((l) => l.id !== id) });
    if (editingId === id) setEditingId(null);
  };

  const startEdit = (link: KeyLink) => {
    setEditingId(link.id);
    setEditLabel(link.label);
    setEditUrl(link.url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">Key Links</h2>
        <button
          onClick={addLink}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Add Link
        </button>
      </div>
      {data.keyLinks.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No links added yet. Click &quot;+ Add Link&quot; to get started.</p>
      ) : (
        <ul className="space-y-2">
          {data.keyLinks.map((link) =>
            editingId === link.id ? (
              <li key={link.id} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="Label"
                  className="flex-1 rounded border px-2 py-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(link.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="URL"
                  className="flex-[2] rounded border px-2 py-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(link.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <button
                  onClick={() => saveEdit(link.id)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </li>
            ) : (
              <li key={link.id} className="flex items-center gap-2 group">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate"
                >
                  {link.label}
                </a>
                <span className="text-gray-300 text-xs truncate hidden sm:inline">
                  {link.url}
                </span>
                <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(link)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
