"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigation, ProductArea } from "@/context/NavigationContext";
import { HealthStatus } from "@/context/DashboardContext";

const MIN_WIDTH = 56; // Collapsed width
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 256;

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
          className={`w-full flex items-center justify-center p-2 text-sm font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            isProductAreaActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
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
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <span className={`text-xs transition-transform inline-block ${expanded ? "rotate-90" : ""}`}>
            &#9654;
          </span>
        </button>
        <button
          onClick={() => setCurrentView({ type: "product-area", productAreaId: productArea.id })}
          className={`flex-1 text-left px-2 py-1 text-sm font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
            isProductAreaActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
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
                className={`w-full flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  isActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
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

function SettingsPopover({ collapsed, onClose }: { collapsed: boolean; onClose: () => void }) {
  const { darkMode, setDarkMode, isAdmin, setIsAdmin } = useNavigation();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [compactMode, setCompactMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("compact-mode") === "true";
  });
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    localStorage.setItem("compact-mode", String(compactMode));
    document.documentElement.classList.toggle("compact", compactMode);
  }, [compactMode]);

  return (
    <div
      ref={popoverRef}
      className={`absolute bottom-14 ${collapsed ? "left-1" : "left-3 right-3"} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 ${collapsed ? "w-56" : ""}`}
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Settings</h3>
      </div>
      <div className="p-2 space-y-1">
        {/* Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {darkMode ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            )}
          </svg>
          <span className="flex-1 text-left">Dark Mode</span>
          <span className={`w-8 h-5 rounded-full relative transition-colors ${darkMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-3" : ""}`} />
          </span>
        </button>
        {/* Compact Mode */}
        <button
          onClick={() => setCompactMode(!compactMode)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="flex-1 text-left">Compact Mode</span>
          <span className={`w-8 h-5 rounded-full relative transition-colors ${compactMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${compactMode ? "translate-x-3" : ""}`} />
          </span>
        </button>
        {/* Admin Mode */}
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="flex-1 text-left">Admin Mode</span>
          <span className={`w-8 h-5 rounded-full relative transition-colors ${isAdmin ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAdmin ? "translate-x-3" : ""}`} />
          </span>
        </button>
        {/* Auto-Save */}
        <button
          onClick={() => setAutoSave(!autoSave)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span className="flex-1 text-left">Auto-Save</span>
          <span className={`w-8 h-5 rounded-full relative transition-colors ${autoSave ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoSave ? "translate-x-3" : ""}`} />
          </span>
        </button>
      </div>
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            if (window.confirm("Reset all data to defaults? This cannot be undone.")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="flex-1 text-left">Reset All Data</span>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { productAreas, currentView, setCurrentView } = useNavigation();
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [showSettings, setShowSettings] = useState(false);
  const isResizing = useRef(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const collapsed = width <= MIN_WIDTH + 20;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${width}px` }}
      className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen flex-shrink-0 relative flex flex-col"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!collapsed && <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">SimpleSheets</h1>}
        <button
          onClick={() => setWidth(collapsed ? DEFAULT_WIDTH : MIN_WIDTH)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex-shrink-0"
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
      <nav className={`flex-1 overflow-y-auto ${collapsed ? "p-2" : "p-3"}`}>
        {/* Portfolio Overview link */}
        {collapsed ? (
          <div className="mb-3">
            <button
              onClick={() => setCurrentView({ type: "portfolio" })}
              className={`w-full flex items-center justify-center p-2 text-sm font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                currentView.type === "portfolio" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
              }`}
              title="Portfolio Overview"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCurrentView({ type: "portfolio" })}
            className={`w-full flex items-center gap-2 px-2 py-2 mb-3 text-sm font-semibold rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
              currentView.type === "portfolio" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Portfolio Overview
          </button>
        )}

        <div className={collapsed ? "" : "border-t border-gray-200 dark:border-gray-700 pt-3"}>
          {productAreas.map((pa) => (
            <ProductAreaSection key={pa.id} productArea={pa} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* Settings button at bottom */}
      <div className="relative border-t border-gray-200 dark:border-gray-700 p-2">
        {showSettings && <SettingsPopover collapsed={collapsed} onClose={() => setShowSettings(false)} />}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"} py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400`}
          title="Settings"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-blue-500 transition-colors"
        title="Drag to resize"
      />
    </aside>
  );
}
