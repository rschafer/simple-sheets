import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import ShareDialog from "@/components/ShareDialog";
import Notifications from "@/components/Notifications";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <MainContent />
      </main>
      <Notifications />
      <ShareDialog />
    </div>
  );
}
