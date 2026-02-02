"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface KeyLink {
  id: string;
  label: string;
  url: string;
}

export interface Contact {
  id: string;
  role: string;
  name: string;
}

export type HealthStatus = "green" | "yellow" | "red";
export type ProjectPhase = "Discovery" | "Planning" | "Execution";

export interface ExecutiveSummary {
  id: string;
  date: string;
  recentProgress: string;
  nextSteps: string;
  risksAndMitigation: string;
}

export type MilestoneStatus = "Complete" | "In Progress" | "Not Started";

export interface Milestone {
  id: string;
  name: string;
  status: MilestoneStatus;
  startDate: string;
  finishDate: string;
}

export type RaidType = "Risk" | "Action" | "Issue" | "Dependency";
export type RaidSeverity = "Critical" | "High" | "Medium" | "Low";
export type RaidStatus = "Open" | "In Progress" | "Closed";

export interface RaidItem {
  id: string;
  summary: string;
  severity: RaidSeverity;
  type: RaidType;
  status: RaidStatus;
  assignedTo: string;
  nextSteps: string;
}

export interface ProjectPlanRow {
  id: string;
  task: string;
  assignee: string;
  status: string;
  startDate: string;
  endDate: string;
  notes: string;
  indent: number;
}

export type AccessLevel = "Owner" | "Editor" | "Viewer" | "Commenter";

export interface SharedUser {
  id: string;
  email: string;
  name: string;
  accessLevel: AccessLevel;
}

export type NotificationChannel = "Outlook" | "Slack";
export type NotificationFrequency = "Real-time" | "Daily" | "Weekly";

export interface NotificationSubscription {
  id: string;
  channel: NotificationChannel;
  frequency: NotificationFrequency;
  enabled: boolean;
}

export interface DashboardData {
  projectName: string;
  keyLinks: KeyLink[];
  contacts: Contact[];
  healthStatus: HealthStatus;
  phase: ProjectPhase;
  deliveryDate: string;
  executiveSummaries: ExecutiveSummary[];
  scopeText: string;
  scopePeriod: string;
  milestones: Milestone[];
  raidItems: RaidItem[];
  projectPlan: ProjectPlanRow[];
  sharedUsers: SharedUser[];
  notifications: NotificationSubscription[];
}

interface DashboardContextType {
  data: DashboardData;
  updateData: (partial: Partial<DashboardData>) => void;
}

const defaultData: DashboardData = {
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
