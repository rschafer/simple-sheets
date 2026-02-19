"use client";

import { useState, useMemo } from "react";
import { useNavigation, Program, ProductArea } from "@/context/NavigationContext";
import { HealthStatus, ProjectPhase } from "@/context/DashboardContext";
import {
  DonutChart,
  NeedsAttention,
  KpiCards,
  ProgramsTable,
  TimelineBar,
  AiReportButton,
  matchesDeliveryFilter,
  DeliveryFilter,
} from "./DashboardShared";
import { ShareLinkButton } from "./ShareDialog";

export default function PortfolioDashboard() {
  const { productAreas } = useNavigation();

  const [healthFilter, setHealthFilter] = useState<HealthStatus | "all">("all");
  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | "all">("all");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>("all");

  const allPrograms = useMemo(() => {
    const result: { program: Program; productArea: ProductArea }[] = [];
    for (const pa of productAreas) {
      for (const prog of pa.programs) {
        result.push({ program: prog, productArea: pa });
      }
    }
    return result;
  }, [productAreas]);

  const healthCounts = useMemo(() => {
    return allPrograms.reduce(
      (acc, { program }) => {
        acc[program.healthStatus]++;
        return acc;
      },
      { green: 0, yellow: 0, red: 0 } as Record<HealthStatus, number>
    );
  }, [allPrograms]);

  const filteredPrograms = useMemo(() => {
    return allPrograms.filter(({ program }) => {
      if (healthFilter !== "all" && program.healthStatus !== healthFilter) return false;
      if (phaseFilter !== "all" && program.data.phase !== phaseFilter) return false;
      if (!matchesDeliveryFilter(program.data.deliveryDate, deliveryFilter)) return false;
      return true;
    });
  }, [allPrograms, healthFilter, phaseFilter, deliveryFilter]);

  return (
    <div className="p-8">
      <div className="max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Portfolio Overview</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All programs across {productAreas.length} product areas</p>
          </div>
          <div className="flex items-center gap-2">
            <AiReportButton allPrograms={allPrograms} />
            <ShareLinkButton title="Portfolio Overview" />
          </div>
        </div>

        {/* KPI Cards + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 flex items-center justify-center">
            <DonutChart counts={healthCounts} />
          </div>
          <KpiCards programs={allPrograms} />
        </div>

        {/* Needs Attention */}
        <NeedsAttention allPrograms={allPrograms} showProductArea={true} />

        {/* Programs Table with inline column filters */}
        <ProgramsTable
          programs={filteredPrograms}
          showProductArea={true}
          totalCount={allPrograms.length}
          healthFilter={healthFilter}
          setHealthFilter={setHealthFilter}
          phaseFilter={phaseFilter}
          setPhaseFilter={setPhaseFilter}
          deliveryFilter={deliveryFilter}
          setDeliveryFilter={setDeliveryFilter}
        />

        {/* Timeline */}
        <TimelineBar programs={filteredPrograms} />
      </div>
    </div>
  );
}
