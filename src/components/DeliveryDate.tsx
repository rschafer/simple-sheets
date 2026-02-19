"use client";

import { useDashboard } from "@/context/DashboardContext";

export default function DeliveryDate() {
  const { data, updateData } = useDashboard();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">Target:</span>
      <input
        type="date"
        value={data.deliveryDate}
        onChange={(e) => updateData({ deliveryDate: e.target.value })}
        className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 cursor-pointer hover:border-gray-400"
      />
    </div>
  );
}
