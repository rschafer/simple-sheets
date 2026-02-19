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

  const Toggle = ({ enabled }: { enabled: boolean }) => (
    <span className={`w-9 h-[22px] rounded-full relative transition-colors duration-200 ${enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
      <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? "translate-x-[14px]" : ""}`} />
    </span>
  );

  return (
    <div
      ref={popoverRef}
      className={`absolute bottom-14 ${collapsed ? "left-1" : "left-3 right-3"} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 ${collapsed ? "w-60" : ""}`}
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-[13px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Settings</h3>
      </div>
      <div className="p-1.5 space-y-0.5">
        {/* Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200 transition-colors"
        >
          <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {darkMode ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              )}
            </svg>
          </span>
          <span className="flex-1 text-left font-medium">Dark Mode</span>
          <Toggle enabled={darkMode} />
        </button>
        {/* Compact Mode */}
        <button
          onClick={() => setCompactMode(!compactMode)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200 transition-colors"
        >
          <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </span>
          <span className="flex-1 text-left font-medium">Compact Mode</span>
          <Toggle enabled={compactMode} />
        </button>
        {/* Admin Mode */}
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200 transition-colors"
        >
          <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          <span className="flex-1 text-left font-medium">Admin Mode</span>
          <Toggle enabled={isAdmin} />
        </button>
        {/* Auto-Save */}
        <button
          onClick={() => setAutoSave(!autoSave)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200 transition-colors"
        >
          <span className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </span>
          <span className="flex-1 text-left font-medium">Auto-Save</span>
          <Toggle enabled={autoSave} />
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
