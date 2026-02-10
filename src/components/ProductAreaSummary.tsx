"use client";

import { useNavigation } from "@/context/NavigationContext";
import { HealthStatus } from "@/context/DashboardContext";

const healthColors: Record<HealthStatus, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
};

const healthLabels: Record<HealthStatus, string> = {
  green: "On Track",
  yellow: "At Risk",
  red: "Off Track",
};

export default function ProductAreaSummary() {
  const { getCurrentProductArea, setCurrentView } = useNavigation();
  const productArea = getCurrentProductArea();

  if (!productArea) {
    return <div className="p-8 text-gray-500">Product area not found</div>;
  }

  const healthCounts = productArea.programs.reduce(
    (acc, p) => {
      acc[p.healthStatus]++;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 } as Record<HealthStatus, number>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{productArea.name}</h1>

      {/* Health Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-3xl font-bold text-green-700">{healthCounts.green}</div>
          <div className="text-sm text-green-600">On Track</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-700">{healthCounts.yellow}</div>
          <div className="text-sm text-yellow-600">At Risk</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-3xl font-bold text-red-700">{healthCounts.red}</div>
          <div className="text-sm text-red-600">Off Track</div>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Programs</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Health</th>
              <th className="px-4 py-3">Phase</th>
              <th className="px-4 py-3">Delivery Date</th>
              <th className="px-4 py-3">RAID Items</th>
            </tr>
          </thead>
          <tbody>
            {productArea.programs.map((program) => (
              <tr
                key={program.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  setCurrentView({
                    type: "program",
                    productAreaId: productArea.id,
                    programId: program.id,
                  })
                }
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{program.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      healthColors[program.healthStatus]
                    }`}
                  >
                    {healthLabels[program.healthStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{program.data.phase}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {program.data.deliveryDate || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {program.data.raidItems.length} items
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
