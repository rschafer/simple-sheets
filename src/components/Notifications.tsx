"use client";

import { useState } from "react";
import {
  useDashboard,
  NotificationSubscription,
  NotificationChannel,
  NotificationFrequency,
} from "@/context/DashboardContext";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const channels: NotificationChannel[] = ["Outlook", "Slack"];
const frequencies: NotificationFrequency[] = ["Real-time", "Daily", "Weekly"];

export default function Notifications() {
  const { data, updateData } = useDashboard();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<NotificationChannel>("Outlook");
  const [frequency, setFrequency] = useState<NotificationFrequency>("Real-time");

  const addSubscription = () => {
    const sub: NotificationSubscription = {
      id: generateId(),
      channel,
      frequency,
      enabled: true,
    };
    updateData({ notifications: [...data.notifications, sub] });
  };

  const toggleSub = (id: string) => {
    updateData({
      notifications: data.notifications.map((n) =>
        n.id === id ? { ...n, enabled: !n.enabled } : n
      ),
    });
  };

  const removeSub = (id: string) => {
    updateData({ notifications: data.notifications.filter((n) => n.id !== id) });
  };

  const activeCount = data.notifications.filter((n) => n.enabled).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-28 rounded-full bg-gray-700 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-gray-800 transition-colors z-40"
        title="Notification subscriptions"
      >
        {"\uD83D\uDD14"} {activeCount > 0 && <span className="ml-1">{activeCount}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Notification Subscriptions</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                x
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Subscribe to health status changes (Green/Yellow/Red transitions).
            </p>

            {/* Add Subscription */}
            <div className="flex gap-2 mb-4">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as NotificationChannel)}
                className="rounded border px-3 py-2 text-sm flex-1"
              >
                {channels.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as NotificationFrequency)}
                className="rounded border px-3 py-2 text-sm flex-1"
              >
                {frequencies.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <button
                onClick={addSubscription}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* Subscription List */}
            {data.notifications.length === 0 ? (
              <p className="text-gray-400 text-sm italic py-4 text-center">
                No subscriptions yet. Add one above.
              </p>
            ) : (
              <ul className="divide-y">
                {data.notifications.map((sub) => (
                  <li key={sub.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSub(sub.id)}
                        className={`w-9 h-5 rounded-full relative transition-colors ${
                          sub.enabled ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            sub.enabled ? "left-4" : "left-0.5"
                          }`}
                        />
                      </button>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {sub.channel} - {sub.frequency}
                        </p>
                        <p className="text-xs text-gray-400">Health status changes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSub(sub.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
