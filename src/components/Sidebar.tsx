"use client";

import { useState } from "react";
import { useNavigation, ProductArea } from "@/context/NavigationContext";
import { HealthStatus } from "@/context/DashboardContext";

const healthColors: Record<HealthStatus, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
};

function HealthDot({ status }: { status: HealthStatus }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${healthColors[status]}`} />;
}

function ProductAreaSection({ productArea, collapsed }: { productArea: ProductArea; collapsed: boolean }) {
  const { currentView, setCurrentView } = useNavigation();
  const [expanded, setExpanded] = useState(true);

  const isProductAreaActive =
    currentView.type === "product-area" && currentView.productAreaId === productArea.id;

  // Get first letter for collapsed view
  const initial = productArea.name.split(" ").pop()?.charAt(0) || "P";

  if (collapsed) {
    return (
      <div className="mb-2">
        <button
          onClick={() => setCurrentView({ type: "product-area", productAreaId: productArea.id })}
          className={`w-full flex items-center justify-center p-2 text-sm font-medium rounded hover:bg-gray-100 ${
            isProductAreaActive ? "bg-blue-50 text-blue-700" : "text-gray-700"
          }`}
          title={productArea.name}
        >
          {initial}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div className="flex items-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <span className={`text-xs transition-transform inline-block ${expanded ? "rotate-90" : ""}`}>
            &#9654;
          </span>
        </button>
        <button
          onClick={() => setCurrentView({ type: "product-area", productAreaId: productArea.id })}
          className={`flex-1 text-left px-2 py-1 text-sm font-medium rounded hover:bg-gray-100 ${
            isProductAreaActive ? "bg-blue-50 text-blue-700" : "text-gray-700"
          }`}
        >
          {productArea.name}
        </button>
      </div>

      {expanded && (
        <div className="ml-6 mt-1 space-y-1">
          {productArea.programs.map((program) => {
            const isActive =
              currentView.type === "program" &&
              currentView.productAreaId === productArea.id &&
              currentView.programId === program.id;

            return (
              <button
                key={program.id}
                onClick={() =>
                  setCurrentView({
                    type: "program",
                    productAreaId: productArea.id,
                    programId: program.id,
                  })
                }
                className={`w-full flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-gray-100 ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-600"
                }`}
              >
                <HealthDot status={program.healthStatus} />
                <span className="truncate">{program.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { productAreas } = useNavigation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-white border-r border-gray-200 h-screen overflow-y-auto flex-shrink-0 transition-all duration-200 ${
        collapsed ? "w-14" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && <h1 className="text-lg font-bold text-gray-800">SimpleSheets</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <nav className={collapsed ? "p-2" : "p-3"}>
        {productAreas.map((pa) => (
          <ProductAreaSection key={pa.id} productArea={pa} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
