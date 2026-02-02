"use client";

import { useState, useRef, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";

export default function ProjectName() {
  const { data, updateData } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(data.projectName);
  }, [data.projectName]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = value.trim() || "Untitled Project";
    updateData({ projectName: trimmed });
    setValue(trimmed);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setValue(data.projectName);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className="w-full border-b-2 border-blue-500 bg-transparent text-3xl font-bold text-gray-900 outline-none"
      />
    );
  }

  return (
    <h1
      onClick={() => setEditing(true)}
      className="cursor-pointer text-3xl font-bold text-gray-900 hover:bg-gray-100 rounded px-1 -mx-1 transition-colors"
      title="Click to edit project name"
    >
      {data.projectName}
    </h1>
  );
}
