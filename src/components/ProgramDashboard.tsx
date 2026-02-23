"use client";

import { useCallback, useRef, useEffect } from "react";
import { useNavigation } from "@/context/NavigationContext";
import { DashboardData, DashboardProvider } from "@/context/DashboardContext";
import ProjectName from "@/components/ProjectName";
import KeyLinks from "@/components/KeyLinks";
import PrimaryContacts from "@/components/PrimaryContacts";
import { HealthBadge, PhaseSelector } from "@/components/ProgramStatus";
import DeliveryDate from "@/components/DeliveryDate";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import Scope from "@/components/Scope";
import Milestones from "@/components/Milestones";
import RaidLog from "@/components/RaidLog";
import ProjectPlan from "@/components/ProjectPlan";
import ShareDialog from "@/components/ShareDialog";
import Notifications from "@/components/Notifications";

// This component wraps the dashboard with program-specific data from navigation
function ProgramDashboardInner() {
  return (
    <>
    <div className="p-6">
      <div className="grid gap-4 max-w-6xl">
        {/* Header: Project Name + Status + Target Date + Contacts + Scope */}
        <section className="card p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <ProjectName />
                  <HealthBadge />
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                <ShareDialog />
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center gap-6">
              <PhaseSelector />
              <DeliveryDate />
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 grid gap-4 md:grid-cols-2">
              <PrimaryContacts />
              <Scope />
            </div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="card p-5">
          <ExecutiveSummary />
        </section>

        {/* Milestones & RAID Log side-by-side */}
        <div className="grid gap-4 md:grid-cols-2">
          <section className="card p-5">
            <Milestones />
          </section>
          <section className="card p-5">
            <RaidLog />
          </section>
        </div>

        {/* Project Plan + Key Links */}
        <section className="card p-5">
          <ProjectPlan />
          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <KeyLinks />
          </div>
        </section>
      </div>
    </div>
    <Notifications />
    </>
  );
}

export default function ProgramDashboard() {
  const { getCurrentProgram, updateProgramData, currentView } = useNavigation();
  const program = getCurrentProgram();

  // Create a stable key based on the current program to force remount
  const programKey = currentView.type === "program" ? currentView.programId : "none";

  // Use ref to always have latest programId without recreating callback
  const programIdRef = useRef(programKey);
  useEffect(() => {
    programIdRef.current = programKey;
  }, [programKey]);

  // Stable callback that reads from ref
  const handleUpdate = useCallback(
    (data: Partial<DashboardData>) => {
      if (programIdRef.current && programIdRef.current !== "none") {
        updateProgramData(programIdRef.current, data);
      }
    },
    [updateProgramData]
  );

  if (!program) {
    return <div className="p-8 text-gray-500">Program not found</div>;
  }

  return (
    <DashboardProvider key={programKey} initialData={program.data} onUpdate={handleUpdate}>
      <ProgramDashboardInner />
    </DashboardProvider>
  );
}
