"use client";

import { useCallback, useMemo } from "react";
import { useNavigation } from "@/context/NavigationContext";
import { DashboardData, DashboardProvider } from "@/context/DashboardContext";
import ProjectName from "@/components/ProjectName";
import KeyLinks from "@/components/KeyLinks";
import PrimaryContacts from "@/components/PrimaryContacts";
import ProgramStatus from "@/components/ProgramStatus";
import DeliveryDate from "@/components/DeliveryDate";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import Scope from "@/components/Scope";
import Milestones from "@/components/Milestones";
import RaidLog from "@/components/RaidLog";
import ProjectPlan from "@/components/ProjectPlan";

// This component wraps the dashboard with program-specific data from navigation
function ProgramDashboardInner() {
  return (
    <div className="p-8">
      <div className="grid gap-6 max-w-6xl">
        {/* Header: Project Name + Status + Delivery Date + Contacts + Scope + Key Links */}
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1 min-w-0">
                <ProjectName />
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 flex-wrap">
                <ProgramStatus />
                <DeliveryDate />
              </div>
            </div>
            <div className="border-t pt-4 grid gap-4 md:grid-cols-2">
              <PrimaryContacts />
              <Scope />
            </div>
            <div className="border-t pt-4">
              <KeyLinks />
            </div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <ExecutiveSummary />
        </section>

        {/* Milestones & RAID Log */}
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <Milestones />
          </section>
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <RaidLog />
          </section>
        </div>

        {/* Project Plan */}
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <ProjectPlan />
        </section>
      </div>
    </div>
  );
}

export default function ProgramDashboard() {
  const { getCurrentProgram, updateProgramData, currentView } = useNavigation();
  const program = getCurrentProgram();

  // Create a stable key based on the current program to force remount
  const programKey = currentView.type === "program" ? currentView.programId : "none";

  if (!program) {
    return <div className="p-8 text-gray-500">Program not found</div>;
  }

  return (
    <DashboardProvider key={programKey} initialData={program.data} onUpdate={(data) => updateProgramData(program.id, data)}>
      <ProgramDashboardInner />
    </DashboardProvider>
  );
}
