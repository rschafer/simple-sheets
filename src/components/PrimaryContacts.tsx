"use client";

import { useState } from "react";
import { useDashboard, Contact } from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function PrimaryContacts() {
  const { data, updateData } = useDashboard();
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editName, setEditName] = useState("");

  const addContact = () => {
    const c: Contact = { id: generateId(), role: "New Role", name: "" };
    updateData({ contacts: [...data.contacts, c] });
    setEditingId(c.id);
    setEditRole(c.role);
    setEditName(c.name);
  };

  const saveEdit = (id: string) => {
    updateData({
      contacts: data.contacts.map((c) =>
        c.id === id ? { ...c, role: editRole.trim() || "Role", name: editName.trim() } : c
      ),
    });
    setEditingId(null);
  };

  const removeContact = (id: string) => {
    updateData({ contacts: data.contacts.filter((c) => c.id !== id) });
    if (editingId === id) setEditingId(null);
  };

  const startEdit = (c: Contact) => {
    setEditingId(c.id);
    setEditRole(c.role);
    setEditName(c.name);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <span className={`transition-transform text-xs ${expanded ? "rotate-90" : ""}`}>&#9654;</span>
          Contacts
          <span className="text-xs text-gray-400 font-normal">({data.contacts.length})</span>
        </button>
        {expanded && (
          <button onClick={addContact} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            + Add Contact
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3">
          {data.contacts.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No contacts added yet. Click &quot;+ Add Contact&quot; to get started.</p>
          ) : (
            <ul className="space-y-2">
              {data.contacts.map((contact) =>
                editingId === contact.id ? (
                  <li key={contact.id} className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      placeholder="Role"
                      className="w-40 rounded border px-2 py-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(contact.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Name"
                      className="flex-1 rounded border px-2 py-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(contact.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button onClick={() => saveEdit(contact.id)} className="text-sm text-green-600 hover:text-green-800">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-gray-400 hover:text-gray-600">
                      Cancel
                    </button>
                  </li>
                ) : (
                  <li key={contact.id} className="flex items-center gap-2 group">
                    <span className="text-sm font-medium text-gray-500 w-40 truncate">{contact.role}</span>
                    <span
                      className="text-sm text-gray-900 cursor-pointer hover:bg-gray-100 rounded px-1 flex-1 truncate"
                      onClick={() => startEdit(contact)}
                    >
                      {contact.name || <span className="text-gray-300 italic">Click to add name</span>}
                    </span>
                    <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(contact)} className="text-xs text-gray-400 hover:text-gray-600">
                        Edit
                      </button>
                      <button onClick={() => removeContact(contact.id)} className="text-xs text-red-400 hover:text-red-600">
                        Remove
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
