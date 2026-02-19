"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { DashboardData, HealthStatus } from "./DashboardContext";

const NAV_STORAGE_KEY = "navigation-data";

export interface Program {
  id: string;
  name: string;
  healthStatus: HealthStatus;
  data: DashboardData;
}

export interface ProductAreaTemplate {
  labels: {
    recentProgress: string;
    nextSteps: string;
    risksAndMitigation: string;
    impactToOtherPrograms: string;
  };
  defaultContent: {
    recentProgress: string;
    nextSteps: string;
    risksAndMitigation: string;
    impactToOtherPrograms: string;
  };
}

export interface ProductArea {
  id: string;
  name: string;
  programs: Program[];
  template: ProductAreaTemplate;
}

export type ViewType =
  | { type: "portfolio" }
  | { type: "product-area"; productAreaId: string }
  | { type: "program"; productAreaId: string; programId: string };

interface NavigationData {
  productAreas: ProductArea[];
  currentView: ViewType;
  isAdmin: boolean;
  darkMode: boolean;
}

interface NavigationContextType {
  productAreas: ProductArea[];
  currentView: ViewType;
  isAdmin: boolean;
  darkMode: boolean;
  setIsAdmin: (admin: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setCurrentView: (view: ViewType) => void;
  getCurrentProgram: () => Program | null;
  getCurrentProductArea: () => ProductArea | null;
  updateProgramData: (programId: string, data: Partial<DashboardData>) => void;
  updateProgramHealth: (programId: string, health: HealthStatus) => void;
  updateProductAreaTemplate: (productAreaId: string, template: ProductAreaTemplate) => void;
}

const defaultDashboardData: DashboardData = {
  projectName: "Untitled Project",
  keyLinks: [],
  contacts: [
    { id: "1", role: "Program Manager", name: "" },
    { id: "2", role: "Product Lead", name: "" },
    { id: "3", role: "Engineering Lead", name: "" },
    { id: "4", role: "Design Lead", name: "" },
  ],
  healthStatus: "green",
  phase: "Discovery",
  deliveryDate: "",
  executiveSummaries: [],
  scopeText: "",
  scopePeriod: "Q1 2026",
  milestones: [],
  raidItems: [],
  projectPlan: [],
  sharedUsers: [],
  notifications: [],
  generalAccess: "restricted",
  linkAccessLevel: "Viewer",
};

function createProgram(id: string, name: string): Program {
  return {
    id,
    name,
    healthStatus: "green",
    data: { ...defaultDashboardData, projectName: name },
  };
}

const defaultProductAreas: ProductArea[] = [
  {
    id: "pa1",
    name: "Product Area 1",
    programs: [
      createProgram("pa1-p1", "Program 1"),
      createProgram("pa1-p2", "Program 2"),
      createProgram("pa1-p3", "Program 3"),
    ],
    template: {
      labels: {
        recentProgress: "Delivery Milestones",
        nextSteps: "Upcoming Releases",
        risksAndMitigation: "Risks and Mitigation",
        impactToOtherPrograms: "Technical Debt",
      },
      defaultContent: {
        recentProgress: "- ",
        nextSteps: "- ",
        risksAndMitigation: "- ",
        impactToOtherPrograms: "- ",
      },
    },
  },
  {
    id: "pa2",
    name: "Product Area 2",
    programs: [
      createProgram("pa2-p1", "Program 1"),
      createProgram("pa2-p2", "Program 2"),
      createProgram("pa2-p3", "Program 3"),
    ],
    template: {
      labels: {
        recentProgress: "Business Impact & KPIs",
        nextSteps: "Strategic Priorities",
        risksAndMitigation: "Risks and Mitigation",
        impactToOtherPrograms: "Budget & Resource Summary",
      },
      defaultContent: {
        recentProgress: "- ",
        nextSteps: "- ",
        risksAndMitigation: "- ",
        impactToOtherPrograms: "- ",
      },
    },
  },
  {
    id: "pa3",
    name: "Product Area 3",
    programs: [
      createProgram("pa3-p1", "Program 1"),
      createProgram("pa3-p2", "Program 2"),
      createProgram("pa3-p3", "Program 3"),
    ],
    template: {
      labels: {
        recentProgress: "Customer Feedback & Adoption",
        nextSteps: "Roadmap Highlights",
        risksAndMitigation: "Risks and Mitigation",
        impactToOtherPrograms: "Cross-Team Dependencies",
      },
      defaultContent: {
        recentProgress: "- ",
        nextSteps: "- ",
        risksAndMitigation: "- ",
        impactToOtherPrograms: "- ",
      },
    },
  },
];

const defaultNavData: NavigationData = {
  productAreas: defaultProductAreas,
  currentView: { type: "program", productAreaId: "pa1", programId: "pa1-p1" },
  isAdmin: false,
  darkMode: false,
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function loadFromStorage(): NavigationData {
  if (typeof window === "undefined") return defaultNavData;
  try {
    const stored = localStorage.getItem(NAV_STORAGE_KEY);
    if (stored) {
      return { ...defaultNavData, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return defaultNavData;
}

function saveToStorage(data: NavigationData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navData, setNavData] = useState<NavigationData>(defaultNavData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setNavData(loadFromStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage(navData);
  }, [navData, loaded]);

  const setCurrentView = useCallback((view: ViewType) => {
    setNavData((prev) => ({ ...prev, currentView: view }));
  }, []);

  const getCurrentProductArea = useCallback((): ProductArea | null => {
    if (navData.currentView.type === "portfolio") return null;
    const paId = navData.currentView.productAreaId;
    return navData.productAreas.find((pa) => pa.id === paId) || null;
  }, [navData]);

  const getCurrentProgram = useCallback((): Program | null => {
    const view = navData.currentView;
    if (view.type !== "program") return null;
    const pa = getCurrentProductArea();
    if (!pa) return null;
    return pa.programs.find((p) => p.id === view.programId) || null;
  }, [navData, getCurrentProductArea]);

  const updateProgramData = useCallback((programId: string, data: Partial<DashboardData>) => {
    setNavData((prev) => ({
      ...prev,
      productAreas: prev.productAreas.map((pa) => ({
        ...pa,
        programs: pa.programs.map((p) =>
          p.id === programId
            ? {
                ...p,
                name: data.projectName ?? p.name,
                data: { ...p.data, ...data },
                healthStatus: data.healthStatus || p.healthStatus,
              }
            : p
        ),
      })),
    }));
  }, []);

  const updateProgramHealth = useCallback((programId: string, health: HealthStatus) => {
    setNavData((prev) => ({
      ...prev,
      productAreas: prev.productAreas.map((pa) => ({
        ...pa,
        programs: pa.programs.map((p) =>
          p.id === programId ? { ...p, healthStatus: health, data: { ...p.data, healthStatus: health } } : p
        ),
      })),
    }));
  }, []);

  const updateProductAreaTemplate = useCallback((productAreaId: string, template: ProductAreaTemplate) => {
    setNavData((prev) => ({
      ...prev,
      productAreas: prev.productAreas.map((pa) =>
        pa.id === productAreaId ? { ...pa, template } : pa
      ),
    }));
  }, []);

  const setIsAdmin = useCallback((admin: boolean) => {
    setNavData((prev) => ({ ...prev, isAdmin: admin }));
  }, []);

  const setDarkMode = useCallback((dark: boolean) => {
    setNavData((prev) => ({ ...prev, darkMode: dark }));
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
    }
  }, []);

  // Apply dark mode class on load
  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.toggle("dark", navData.darkMode);
  }, [loaded, navData.darkMode]);

  return (
    <NavigationContext.Provider
      value={{
        productAreas: navData.productAreas,
        currentView: navData.currentView,
        isAdmin: navData.isAdmin,
        darkMode: navData.darkMode,
        setIsAdmin,
        setDarkMode,
        setCurrentView,
        getCurrentProgram,
        getCurrentProductArea,
        updateProgramData,
        updateProgramHealth,
        updateProductAreaTemplate,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
