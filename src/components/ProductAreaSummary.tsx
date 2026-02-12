"use client";

import { useState } from "react";
import { useNavigation, ProductArea } from "@/context/NavigationContext";
import { HealthStatus, ProjectPhase } from "@/context/DashboardContext";
import {
  DonutChart,
  NeedsAttention,
  FilterBar,
  KpiCards,
  ProgramsTable,
  TimelineBar,
  AiReportButton,
  matchesDeliveryFilter,
  DeliveryFilter,
} from "./DashboardShared";

export default function ProductAreaSummary() {
  const { getCurrentProductArea } = useNavigation();
  const productArea = getCurrentProductArea();

  const [healthFilter, setHealthFilter] = useState<HealthStatus | "all">("all");
  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | "all">("all");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>("all");

  if (!productArea) {
    return <div className="p-8 text-gray-500">Product area not found</div>;
  }

  const allPrograms = productArea.programs.map((program) => ({
    program,
    productArea: productArea as ProductArea,
  }));

  const healthCounts = allPrograms.reduce(
    (acc, { program }) => {
      acc[program.healthStatus]++;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 } as Record<HealthStatus, number>
  );

  const filteredPrograms = allPrograms.filter(({ program }) => {
    if (healthFilter !== "all" && program.healthStatus !== healthFilter) return false;
    if (phaseFilter !== "all" && program.data.phase !== phaseFilter) return false;
    if (!matchesDeliveryFilter(program.data.deliveryDate, deliveryFilter)) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{productArea.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{allPrograms.length} programs</p>
          </div>
          <AiReportButton allPrograms={allPrograms} />
        </div>

        {/* KPI Cards + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6 flex items-center justify-center">
            <DonutChart counts={healthCounts} />
          </div>
          <KpiCards programs={allPrograms} />
        </div>

        {/* Needs Attention */}
        <NeedsAttention allPrograms={allPrograms} showProductArea={false} />

        {/* Filters */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <FilterBar
            healthFilter={healthFilter}
            setHealthFilter={setHealthFilter}
            phaseFilter={phaseFilter}
            setPhaseFilter={setPhaseFilter}
            deliveryFilter={deliveryFilter}
            setDeliveryFilter={setDeliveryFilter}
          />
        </div>

        {/* Programs Table */}
        <ProgramsTable
          programs={filteredPrograms}
          showProductArea={false}
          totalCount={allPrograms.length}
        />

        {/* Timeline */}
        <TimelineBar programs={filteredPrograms} />
      </div>
    </div>
  );
}
