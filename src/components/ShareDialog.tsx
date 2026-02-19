"use client";

import { useState } from "react";
import { useDashboard, SharedUser, AccessLevel, GeneralAccess } from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const accessLevels: AccessLevel[] = ["Admin", "Owner", "Editor", "Commenter", "Viewer"];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500",
  "bg-yellow-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function ShareButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-blue-600 pl-3 pr-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      Share
    </button>
  );
}

function useLocalShareState(storageKey: string) {
  const [state, setState] = useState<{
    sharedUsers: SharedUser[];
    generalAccess: GeneralAccess;
    linkAccessLevel: AccessLevel;
  }>(() => {
    if (typeof window === "undefined") return { sharedUsers: [], generalAccess: "restricted" as GeneralAccess, linkAccessLevel: "Viewer" as AccessLevel };
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          sharedUsers: parsed.sharedUsers || [],
          generalAccess: parsed.generalAccess || "restricted",
          linkAccessLevel: parsed.linkAccessLevel || "Viewer",
        };
      }
    } catch { /* ignore */ }
    return { sharedUsers: [], generalAccess: "restricted" as GeneralAccess, linkAccessLevel: "Viewer" as AccessLevel };
  });

  const save = (next: typeof state) => {
    setState(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
  };

  return {
    ...state,
    addUser: (user: SharedUser) => save({ ...state, sharedUsers: [...state.sharedUsers, user] }),
    removeUser: (id: string) => save({ ...state, sharedUsers: state.sharedUsers.filter((u) => u.id !== id) }),
    updateUserAccess: (id: string, level: AccessLevel) => save({ ...state, sharedUsers: state.sharedUsers.map((u) => (u.id === id ? { ...u, accessLevel: level } : u)) }),
    setGeneralAccess: (access: GeneralAccess) => save({ ...state, generalAccess: access }),
    setLinkAccessLevel: (level: AccessLevel) => save({ ...state, linkAccessLevel: level }),
  };
}

export function ShareLinkButton({ title }: { title: string }) {
  const storageKey = `share-${title.toLowerCase().replace(/\s+/g, "-")}`;
  const share = useLocalShareState(storageKey);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddUser = () => {
    if (!inputValue.trim()) return;
    const isEmail = inputValue.includes("@");
    share.addUser({
      id: generateId(),
      email: isEmail ? inputValue.trim() : `${inputValue.trim().toLowerCase().replace(/\s+/g, ".")}@example.com`,
      name: isEmail ? inputValue.split("@")[0] : inputValue.trim(),
      accessLevel: "Viewer",
    });
    setInputValue("");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <ShareButton onClick={() => setOpen(true)} />
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <h2 className="text-xl font-normal text-gray-800">
                Share &quot;{title}&quot;
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add people input */}
            <div className="px-6 pt-4 pb-3">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                placeholder="Add people, groups, or email addresses"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* People with access */}
            <div className="px-6 pt-2">
              <p className="text-sm font-medium text-gray-700 mb-3">People with access</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {/* Owner (you) */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      RS
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Robert Schafer (you)</p>
                      <p className="text-xs text-gray-500">rdschafer2010@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Owner</span>
                </div>

                {/* Shared users */}
                {share.sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white text-xs font-medium`}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={user.accessLevel}
                        onChange={(e) => share.updateUserAccess(user.id, e.target.value as AccessLevel)}
                        className="text-sm text-gray-600 bg-transparent border-0 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-0 appearance-none"
                        style={{ WebkitAppearance: "none" }}
                      >
                        {accessLevels.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => share.removeUser(user.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General access */}
            <div className="px-6 pt-4 pb-2 border-t mt-3">
              <p className="text-sm font-medium text-gray-700 mb-3">General access</p>
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                  {share.generalAccess === "restricted" ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <button
                      onClick={() => setShowAccessDropdown(!showAccessDropdown)}
                      className="flex items-center gap-1 text-sm text-gray-800 hover:bg-gray-100 rounded px-1 py-0.5"
                    >
                      {share.generalAccess === "restricted" ? "Restricted" : "Anyone with the link"}
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 ml-1">
                      {share.generalAccess === "restricted"
                        ? "Only people with access can open"
                        : `Anyone with the link can ${share.linkAccessLevel === "Viewer" ? "view" : share.linkAccessLevel === "Editor" ? "edit" : "comment"}`}
                    </p>
                  </div>
                </div>

                {share.generalAccess === "anyone-with-link" && (
                  <select
                    value={share.linkAccessLevel}
                    onChange={(e) => share.setLinkAccessLevel(e.target.value as AccessLevel)}
                    className="text-sm text-gray-600 bg-transparent border-0 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 focus:outline-none"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Commenter">Commenter</option>
                    <option value="Editor">Editor</option>
                  </select>
                )}

                {/* Access dropdown */}
                {showAccessDropdown && (
                  <div className="absolute top-0 left-12 z-10 bg-white rounded-lg shadow-xl border py-1 w-52">
                    <button
                      onClick={() => { share.setGeneralAccess("restricted"); setShowAccessDropdown(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50"
                    >
                      {share.generalAccess === "restricted" && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                      <span className={share.generalAccess === "restricted" ? "" : "ml-7"}>Restricted</span>
                    </button>
                    <button
                      onClick={() => { share.setGeneralAccess("anyone-with-link"); setShowAccessDropdown(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50"
                    >
                      {share.generalAccess === "anyone-with-link" && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                      <span className={share.generalAccess === "anyone-with-link" ? "" : "ml-7"}>Anyone with the link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: Copy link + Done */}
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={copyLink}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full px-4 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {copied ? "Link copied!" : "Copy link"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ShareDialog() {
  const { data, updateData } = useDashboard();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);

  const addUser = () => {
    if (!inputValue.trim()) return;
    const isEmail = inputValue.includes("@");
    const user: SharedUser = {
      id: generateId(),
      email: isEmail ? inputValue.trim() : `${inputValue.trim().toLowerCase().replace(/\s+/g, ".")}@example.com`,
      name: isEmail ? inputValue.split("@")[0] : inputValue.trim(),
      accessLevel: "Viewer",
    };
    updateData({ sharedUsers: [...data.sharedUsers, user] });
    setInputValue("");
  };

  const updateAccess = (id: string, accessLevel: AccessLevel) => {
    updateData({
      sharedUsers: data.sharedUsers.map((u) => (u.id === id ? { ...u, accessLevel } : u)),
    });
  };

  const removeUser = (id: string) => {
    updateData({ sharedUsers: data.sharedUsers.filter((u) => u.id !== id) });
  };

  const setGeneralAccess = (access: GeneralAccess) => {
    updateData({ generalAccess: access });
    setShowAccessDropdown(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <>
      {/* Share button in header style */}
      <ShareButton onClick={() => setOpen(true)} />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <h2 className="text-xl font-normal text-gray-800">
                Share &quot;{data.projectName}&quot;
              </h2>
              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"
                  title="Help"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add people input */}
            <div className="px-6 pt-4 pb-3">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addUser()}
                placeholder="Add people, groups, spaces, and calendar events"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* People with access */}
            <div className="px-6 pt-2">
              <p className="text-sm font-medium text-gray-700 mb-3">People with access</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {/* Owner (you) */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      RS
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Robert Schafer (you)</p>
                      <p className="text-xs text-gray-500">rdschafer2010@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Owner</span>
                </div>

                {/* Shared users */}
                {data.sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white text-xs font-medium`}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={user.accessLevel}
                        onChange={(e) => updateAccess(user.id, e.target.value as AccessLevel)}
                        className="text-sm text-gray-600 bg-transparent border-0 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-0 appearance-none"
                        style={{ WebkitAppearance: "none" }}
                      >
                        {accessLevels.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeUser(user.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General access */}
            <div className="px-6 pt-4 pb-2 border-t mt-3">
              <p className="text-sm font-medium text-gray-700 mb-3">General access</p>
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                  {data.generalAccess === "restricted" ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <button
                      onClick={() => setShowAccessDropdown(!showAccessDropdown)}
                      className="flex items-center gap-1 text-sm text-gray-800 hover:bg-gray-100 rounded px-1 py-0.5"
                    >
                      {data.generalAccess === "restricted" ? "Restricted" : "Anyone with the link"}
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 ml-1">
                      {data.generalAccess === "restricted"
                        ? "Only people with access can open"
                        : `Anyone with the link can ${data.linkAccessLevel === "Viewer" ? "view" : data.linkAccessLevel === "Editor" ? "edit" : "comment"}`}
                    </p>
                  </div>
                </div>

                {data.generalAccess === "anyone-with-link" && (
                  <select
                    value={data.linkAccessLevel}
                    onChange={(e) => updateData({ linkAccessLevel: e.target.value as AccessLevel })}
                    className="text-sm text-gray-600 bg-transparent border-0 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 focus:outline-none"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Commenter">Commenter</option>
                    <option value="Editor">Editor</option>
                  </select>
                )}

                {/* Access dropdown */}
                {showAccessDropdown && (
                  <div className="absolute top-0 left-12 z-10 bg-white rounded-lg shadow-xl border py-1 w-52">
                    <button
                      onClick={() => setGeneralAccess("restricted")}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50"
                    >
                      {data.generalAccess === "restricted" && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                      <span className={data.generalAccess === "restricted" ? "" : "ml-7"}>Restricted</span>
                    </button>
                    <button
                      onClick={() => setGeneralAccess("anyone-with-link")}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50"
                    >
                      {data.generalAccess === "anyone-with-link" && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                      <span className={data.generalAccess === "anyone-with-link" ? "" : "ml-7"}>Anyone with the link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: Copy link + Done */}
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={copyLink}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full px-4 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Copy link
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
