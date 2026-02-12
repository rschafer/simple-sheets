"use client";

import { useState, useMemo } from "react";
import { useNavigation } from "@/context/NavigationContext";
import { HealthStatus, ProjectPhase } from "@/context/DashboardContext";

const healthColors: Record<HealthStatus, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
};

const healthLabels: Record<HealthStatus, string> = {
  green: "On Track",
  yellow: "At Risk",
  red: "Off Track",
};

export default function ProductAreaSummary() {
  const { getCurrentProductArea, setCurrentView } = useNavigation();
  const productArea = getCurrentProductArea();

  const [healthFilter, setHealthFilter] = useState<HealthStatus | "all">("all");
  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | "all">("all");

  if (!productArea) {
    return <div className="p-8 text-gray-500">Product area not found</div>;
  }

  const healthCounts = productArea.programs.reduce(
    (acc, p) => {
      acc[p.healthStatus]++;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 } as Record<HealthStatus, number>
  );

  const filteredPrograms = productArea.programs.filter((p) => {
    if (healthFilter !== "all" && p.healthStatus !== healthFilter) return false;
    if (phaseFilter !== "all" && p.data.phase !== phaseFilter) return false;
    return true;
  });

  const hasFilters = healthFilter !== "all" || phaseFilter !== "all";

  // Needs attention items for this product area
  const needsAttention = productArea.programs.filter((p) => {
    if (p.healthStatus === "yellow" || p.healthStatus === "red") return true;
    const hasOverdue = p.data.milestones.some(
      (m) => m.status !== "Complete" && m.finishDate && new Date(m.finishDate) < new Date()
    );
    return hasOverdue;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{productArea.name}</h1>

      {/* Health Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setHealthFilter(healthFilter === "green" ? "all" : "green")}
          className={`rounded-lg p-4 border text-left transition-all ${
            healthFilter === "green"
              ? "bg-green-100 border-green-400 ring-2 ring-green-300"
              : "bg-green-50 border-green-200 hover:border-green-300"
          }`}
        >
          <div className="text-3xl font-bold text-green-700">{healthCounts.green}</div>
          <div className="text-sm text-green-600">On Track</div>
        </button>
        <button
          onClick={() => setHealthFilter(healthFilter === "yellow" ? "all" : "yellow")}
          className={`rounded-lg p-4 border text-left transition-all ${
            healthFilter === "yellow"
              ? "bg-yellow-100 border-yellow-400 ring-2 ring-yellow-300"
              : "bg-yellow-50 border-yellow-200 hover:border-yellow-300"
          }`}
        >
          <div className="text-3xl font-bold text-yellow-700">{healthCounts.yellow}</div>
          <div className="text-sm text-yellow-600">At Risk</div>
        </button>
        <button
          onClick={() => setHealthFilter(healthFilter === "red" ? "all" : "red")}
          className={`rounded-lg p-4 border text-left transition-all ${
            healthFilter === "red"
              ? "bg-red-100 border-red-400 ring-2 ring-red-300"
              : "bg-red-50 border-red-200 hover:border-red-300"
          }`}
        >
          <div className="text-3xl font-bold text-red-700">{healthCounts.red}</div>
          <div className="text-sm text-red-600">Off Track</div>
        </button>
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-600">Needs Attention</h2>
          </div>
          <div className="p-3 space-y-1.5">
            {needsAttention.map((program) => {
              const overdueMilestones = program.data.milestones.filter(
                (m) => m.status !== "Complete" && m.finishDate && new Date(m.finishDate) < new Date()
              );
              return (
                <button
                  key={program.id}
                  onClick={() =>
                    setCurrentView({
                      type: "program",
                      productAreaId: productArea.id,
                      programId: program.id,
                    })
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm hover:bg-gray-50 border border-gray-100"
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                      program.healthStatus === "red"
                        ? "bg-red-500"
                        : program.healthStatus === "yellow"
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                    }`}
                  />
                  <span className="font-medium text-gray-800">{program.name}</span>
                  <span className="text-gray-400">-</span>
                  <span className="text-gray-500">
                    {program.healthStatus !== "green" && healthLabels[program.healthStatus]}
                    {overdueMilestones.length > 0 && (
                      <span className="text-orange-600 ml-1">
                        {overdueMilestones.length} overdue milestone{overdueMilestones.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value as ProjectPhase | "all")}
          className={`rounded border px-2 py-1 text-sm ${
            phaseFilter !== "all" ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600"
          }`}
        >
          <option value="all">All Phases</option>
          <option value="Discovery">Discovery</option>
          <option value="Planning">Planning</option>
          <option value="Execution">Execution</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setHealthFilter("all");
              setPhaseFilter("all");
            }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-700">
            Programs
            {filteredPrograms.length !== productArea.programs.length && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({filteredPrograms.length} of {productArea.programs.length})
              </span>
            )}
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Health</th>
              <th className="px-4 py-3">Phase</th>
              <th className="px-4 py-3">Delivery Date</th>
              <th className="px-4 py-3">RAID Items</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map((program) => (
              <tr
                key={program.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  setCurrentView({
                    type: "program",
                    productAreaId: productArea.id,
                    programId: program.id,
                  })
                }
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{program.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      healthColors[program.healthStatus]
                    }`}
                  >
                    {healthLabels[program.healthStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{program.data.phase}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {program.data.deliveryDate || "\u2014"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {program.data.raidItems.length} items
                </td>
              </tr>
            ))}
            {filteredPrograms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No programs match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
