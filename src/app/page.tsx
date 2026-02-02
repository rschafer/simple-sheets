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
          {/* Project Name */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <ProjectName />
          </section>

          {/* Key Links & Contacts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <KeyLinks />
            </section>
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <PrimaryContacts />
            </section>
          </div>

          {/* Status Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <ProgramStatus />
            </section>
            <section className="rounded-lg border bg-white p-6 shadow-sm">
              <DeliveryDate />
            </section>
          </div>

          {/* Executive Summary */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <ExecutiveSummary />
          </section>

          {/* Scope */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <Scope />
          </section>

          {/* Milestones */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <Milestones />
          </section>

          {/* RAID Log */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <RaidLog />
          </section>

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
