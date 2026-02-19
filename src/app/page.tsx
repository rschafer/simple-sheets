import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <MainContent />
      </main>
    </div>
  );
}
