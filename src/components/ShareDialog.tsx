"use client";

import { useState } from "react";
import { useDashboard, SharedUser, AccessLevel } from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const accessLevels: AccessLevel[] = ["Owner", "Editor", "Commenter", "Viewer"];

const accessDescriptions: Record<AccessLevel, string> = {
  Owner: "Full control, manage access",
  Editor: "Can edit all content",
  Commenter: "Can view and comment",
  Viewer: "Read-only access",
};

export default function ShareDialog() {
  const { data, updateData } = useDashboard();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState<AccessLevel>("Viewer");

  const addUser = () => {
    if (!email.trim()) return;
    const user: SharedUser = {
      id: generateId(),
      email: email.trim(),
      name: name.trim() || email.trim(),
      accessLevel: level,
    };
    updateData({ sharedUsers: [...data.sharedUsers, user] });
    setEmail("");
    setName("");
    setLevel("Viewer");
  };

  const updateAccess = (id: string, accessLevel: AccessLevel) => {
    updateData({
      sharedUsers: data.sharedUsers.map((u) => (u.id === id ? { ...u, accessLevel } : u)),
    });
  };

  const removeUser = (id: string) => {
    updateData({ sharedUsers: data.sharedUsers.filter((u) => u.id !== id) });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        Share
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Share Dashboard</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                x
              </button>
            </div>

            {/* Add User Form */}
            <div className="flex gap-2 mb-4">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 rounded border px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === "Enter" && addUser()}
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="w-32 rounded border px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === "Enter" && addUser()}
              />
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as AccessLevel)}
                className="rounded border px-2 py-2 text-sm"
              >
                {accessLevels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <button
                onClick={addUser}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* User List */}
            {data.sharedUsers.length === 0 ? (
              <p className="text-gray-400 text-sm italic py-4 text-center">
                No users added yet. Add someone above to share this dashboard.
              </p>
            ) : (
              <ul className="divide-y max-h-64 overflow-y-auto">
                {data.sharedUsers.map((user) => (
                  <li key={user.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={user.accessLevel}
                        onChange={(e) => updateAccess(user.id, e.target.value as AccessLevel)}
                        className="rounded border px-2 py-1 text-xs"
                      >
                        {accessLevels.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeUser(user.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Access Level Legend */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 font-medium mb-2">Access Levels</p>
              <div className="grid grid-cols-2 gap-1">
                {accessLevels.map((l) => (
                  <p key={l} className="text-xs text-gray-400">
                    <span className="font-medium text-gray-600">{l}:</span> {accessDescriptions[l]}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
