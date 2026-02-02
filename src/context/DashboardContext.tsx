"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface DashboardData {
  projectName: string;
}

interface DashboardContextType {
  data: DashboardData;
  updateData: (partial: Partial<DashboardData>) => void;
}

const defaultData: DashboardData = {
  projectName: "Untitled Project",
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>(defaultData);

  const updateData = useCallback((partial: Partial<DashboardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <DashboardContext.Provider value={{ data, updateData }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
