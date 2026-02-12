"use client";

import { useState } from "react";
import { useDashboard, HealthStatus, ProjectPhase } from "@/context/DashboardContext";

const healthColors: Record<HealthStatus, { bg: string; ring: string; label: string }> = {
  green: { bg: "bg-green-500", ring: "ring-green-300", label: "On Track" },
  yellow: { bg: "bg-yellow-400", ring: "ring-yellow-200", label: "At Risk" },
  red: { bg: "bg-red-500", ring: "ring-red-300", label: "Off Track" },
};

const phases: ProjectPhase[] = ["Discovery", "Planning", "Execution"];

export function HealthBadge() {
  const { data, updateData } = useDashboard();
  const [showHealthPicker, setShowHealthPicker] = useState(false);

  const current = healthColors[data.healthStatus];

  return (
    <div className="relative">
      <button
        onClick={() => setShowHealthPicker(!showHealthPicker)}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-white font-medium text-sm ${current.bg} ring-2 ${current.ring} hover:opacity-90 transition-opacity`}
      >
        <span className="w-3 h-3 rounded-full bg-white/30" />
        {current.label}
      </button>
      {showHealthPicker && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-10 flex gap-2">
          {(Object.keys(healthColors) as HealthStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => {
                updateData({ healthStatus: status });
                setShowHealthPicker(false);
              }}
              className={`w-8 h-8 rounded-full ${healthColors[status].bg} hover:ring-2 ${healthColors[status].ring} transition-all ${
                data.healthStatus === status ? "ring-2 ring-offset-2" : ""
              }`}
              title={healthColors[status].label}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PhaseSelector() {
  const { data, updateData } = useDashboard();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Phase:</span>
      <select
        value={data.phase}
        onChange={(e) => updateData({ phase: e.target.value as ProjectPhase })}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm bg-white text-gray-700 cursor-pointer hover:border-gray-400"
      >
        {phases.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ProgramStatus() {
  return (
    <div className="flex items-center gap-4">
      <HealthBadge />
      <PhaseSelector />
    </div>
  );
}
