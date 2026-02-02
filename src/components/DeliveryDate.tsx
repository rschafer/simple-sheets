"use client";

import { useDashboard } from "@/context/DashboardContext";

export default function DeliveryDate() {
  const { data, updateData } = useDashboard();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Delivery Date</h2>
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={data.deliveryDate}
          onChange={(e) => updateData({ deliveryDate: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:border-gray-400"
        />
        {data.deliveryDate && (
          <span className="text-sm text-gray-500">
            Target: {new Date(data.deliveryDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
        {!data.deliveryDate && (
          <span className="text-sm text-gray-400 italic">No target date set</span>
        )}
      </div>
    </div>
  );
}
