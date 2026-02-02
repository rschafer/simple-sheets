import ProjectName from "@/components/ProjectName";
import KeyLinks from "@/components/KeyLinks";
import PrimaryContacts from "@/components/PrimaryContacts";
import ProgramStatus from "@/components/ProgramStatus";
import DeliveryDate from "@/components/DeliveryDate";

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
            <h2 className="text-lg font-semibold text-gray-500">Executive Summary</h2>
            <p className="mt-2 text-gray-400 italic">Coming soon</p>
          </section>

          {/* Scope */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-500">Scope</h2>
            <p className="mt-2 text-gray-400 italic">Coming soon</p>
          </section>

          {/* Milestones */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-500">Milestones</h2>
            <p className="mt-2 text-gray-400 italic">Coming soon</p>
          </section>

          {/* RAID Log */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-500">RAID Log</h2>
            <p className="mt-2 text-gray-400 italic">Coming soon</p>
          </section>

          {/* Project Plan */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-500">Project Plan</h2>
            <p className="mt-2 text-gray-400 italic">Coming soon</p>
          </section>
        </div>
      </main>
    </div>
  );
}
