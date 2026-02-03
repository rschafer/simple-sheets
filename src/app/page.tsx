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
import ShareDialog from "@/components/ShareDialog";
import Notifications from "@/components/Notifications";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-8 py-8">
        <div className="grid gap-6">
          {/* Header: Project Name + Status + Delivery Date + Contacts */}
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
                <KeyLinks />
              </div>
            </div>
          </section>

          {/* Executive Summary & Scope */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <ExecutiveSummary />
            </section>
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <Scope />
            </section>
          </div>

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
      </main>
      <Notifications />
      <ShareDialog />
    </div>
  );
}
