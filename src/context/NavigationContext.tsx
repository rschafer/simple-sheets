"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { DashboardData, HealthStatus } from "./DashboardContext";

const NAV_STORAGE_KEY = "navigation-data";
const NAV_DATA_VERSION = "2"; // Bump to force reload with new mock data

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
  addProgram: (productAreaId: string, name: string) => void;
  deleteProgram: (productAreaId: string, programId: string) => void;
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

function createProgram(id: string, name: string, overrides?: Partial<Program>): Program {
  return {
    id,
    name,
    healthStatus: "green",
    data: { ...defaultDashboardData, projectName: name },
    ...overrides,
  };
}

const defaultProductAreas: ProductArea[] = [
  {
    id: "pa1",
    name: "Platform Engineering",
    programs: [
      createProgram("pa1-p1", "API Gateway Modernization", {
        healthStatus: "green",
        data: {
          ...defaultDashboardData,
          projectName: "API Gateway Modernization",
          phase: "Execution",
          deliveryDate: "2026-06-30",
          contacts: [
            { id: "1", role: "Program Manager", name: "Sarah Chen" },
            { id: "2", role: "Product Lead", name: "Mike Rivera" },
            { id: "3", role: "Engineering Lead", name: "Priya Patel" },
            { id: "4", role: "Design Lead", name: "Alex Kim" },
          ],
          keyLinks: [
            { id: "l1", label: "Technical Design Doc", url: "https://docs.example.com/api-gateway" },
            { id: "l2", label: "Jira Board", url: "https://jira.example.com/board/AGM" },
          ],
          scopeText: "Migrate legacy REST APIs to new GraphQL gateway with rate limiting, auth, and observability. Target 50% traffic migration by Q2.",
          scopePeriod: "Q2 2026",
          executiveSummaries: [
            {
              id: "es1", date: "2026-02-14",
              recentProgress: "- Completed authentication middleware integration\n- Load testing passed at 10k RPS\n- Deployed to staging environment",
              nextSteps: "- Begin canary rollout to 5% production traffic\n- Finalize rate limiting policies\n- Update API documentation",
              risksAndMitigation: "- Legacy API deprecation timeline may slip if migration adoption is slow. Mitigation: weekly adoption metrics review with stakeholders.",
              impactToOtherPrograms: "- Auth service changes require coordinated release with Identity Platform team",
            },
          ],
          milestones: [
            { id: "m1", name: "Design review complete", status: "Complete", startDate: "2025-12-01", finishDate: "2025-12-20" },
            { id: "m2", name: "Staging deployment", status: "Complete", startDate: "2026-01-06", finishDate: "2026-02-07" },
            { id: "m3", name: "Canary rollout (5%)", status: "In Progress", startDate: "2026-02-17", finishDate: "2026-03-07" },
            { id: "m4", name: "Full production rollout", status: "Not Started", startDate: "2026-04-01", finishDate: "2026-06-30" },
          ],
          raidItems: [
            { id: "r1", summary: "Third-party rate limiter library lacks IPv6 support", type: "Risk", status: "Open", assignedTo: "Priya Patel", nextSteps: "Evaluate alternative libraries by 2/28" },
            { id: "r2", summary: "Update runbook for on-call team", type: "Action", status: "In Progress", assignedTo: "DevOps Team", nextSteps: "Draft complete, pending review" },
            { id: "r3", summary: "Staging environment intermittent 502 errors", type: "Issue", status: "Closed", assignedTo: "Priya Patel", nextSteps: "Root cause was connection pool exhaustion, fixed in v2.3.1" },
            { id: "r4", summary: "Identity Platform team must deploy auth v3 before gateway launch", type: "Dependency", status: "Open", assignedTo: "Sarah Chen", nextSteps: "Weekly sync scheduled, target deploy 3/15" },
          ],
          projectPlan: [
            { id: "pp1", task: "Phase 1: Foundation", assignee: "", status: "Complete", startDate: "2025-12-01", endDate: "2026-01-31", dependencies: "", notes: "", indent: 0 },
            { id: "pp2", task: "Design review & RFC", assignee: "Priya Patel", status: "Complete", startDate: "2025-12-01", endDate: "2025-12-20", dependencies: "", notes: "", indent: 1 },
            { id: "pp3", task: "Core gateway implementation", assignee: "Backend Team", status: "Complete", startDate: "2025-12-15", endDate: "2026-01-31", dependencies: "pp2", notes: "", indent: 1 },
            { id: "pp4", task: "Phase 2: Testing & Rollout", assignee: "", status: "In Progress", startDate: "2026-02-01", endDate: "2026-06-30", dependencies: "", notes: "", indent: 0 },
            { id: "pp5", task: "Load & integration testing", assignee: "QA Team", status: "Complete", startDate: "2026-02-01", endDate: "2026-02-14", dependencies: "pp3", notes: "", indent: 1 },
            { id: "pp6", task: "Canary rollout", assignee: "DevOps Team", status: "In Progress", startDate: "2026-02-17", endDate: "2026-03-07", dependencies: "pp5", notes: "", indent: 1 },
          ],
        },
      }),
      createProgram("pa1-p2", "Data Pipeline v2", {
        healthStatus: "yellow",
        data: {
          ...defaultDashboardData,
          projectName: "Data Pipeline v2",
          phase: "Execution",
          deliveryDate: "2026-05-15",
          contacts: [
            { id: "1", role: "Program Manager", name: "James Wu" },
            { id: "2", role: "Product Lead", name: "Lisa Thompson" },
            { id: "3", role: "Engineering Lead", name: "Carlos Mendez" },
            { id: "4", role: "Design Lead", name: "" },
          ],
          keyLinks: [
            { id: "l1", label: "Architecture Diagram", url: "https://docs.example.com/data-pipeline-v2" },
          ],
          scopeText: "Replace batch ETL with real-time streaming pipeline using Kafka and Flink. Reduce data latency from 4 hours to under 5 minutes.",
          scopePeriod: "Q2 2026",
          executiveSummaries: [
            {
              id: "es1", date: "2026-02-12",
              recentProgress: "- Kafka cluster provisioned and configured\n- First three data sources migrated to streaming\n- Backfill tooling 70% complete",
              nextSteps: "- Migrate remaining 12 data sources\n- Performance benchmarking under production load\n- Data quality validation framework",
              risksAndMitigation: "- Kafka cluster costs 30% over budget. Mitigation: reviewing partition strategy and retention policies to optimize.",
              impactToOtherPrograms: "- Analytics team needs updated schemas before Q2 reporting cycle",
            },
          ],
          milestones: [
            { id: "m1", name: "Kafka cluster setup", status: "Complete", startDate: "2025-11-15", finishDate: "2026-01-10" },
            { id: "m2", name: "First 3 sources migrated", status: "Complete", startDate: "2026-01-11", finishDate: "2026-02-10" },
            { id: "m3", name: "All sources migrated", status: "In Progress", startDate: "2026-02-11", finishDate: "2026-04-01" },
            { id: "m4", name: "Legacy pipeline decommission", status: "Not Started", startDate: "2026-04-15", finishDate: "2026-05-15" },
          ],
          raidItems: [
            { id: "r1", summary: "Kafka cluster costs exceeding budget by 30%", type: "Risk", status: "Open", assignedTo: "Carlos Mendez", nextSteps: "Optimize partition strategy by 3/1" },
            { id: "r2", summary: "Schema registry migration blocked by legacy format", type: "Issue", status: "In Progress", assignedTo: "Data Team", nextSteps: "Building compatibility layer" },
            { id: "r3", summary: "Analytics team needs new schemas for Q2 reports", type: "Dependency", status: "Open", assignedTo: "Lisa Thompson", nextSteps: "Schema review meeting 2/25" },
          ],
          projectPlan: [
            { id: "pp1", task: "Infrastructure setup", assignee: "DevOps", status: "Complete", startDate: "2025-11-15", endDate: "2026-01-10", dependencies: "", notes: "", indent: 0 },
            { id: "pp2", task: "Source migration (batch 1)", assignee: "Data Team", status: "Complete", startDate: "2026-01-11", endDate: "2026-02-10", dependencies: "pp1", notes: "3 sources", indent: 0 },
            { id: "pp3", task: "Source migration (batch 2)", assignee: "Data Team", status: "In Progress", startDate: "2026-02-11", endDate: "2026-03-15", dependencies: "pp2", notes: "7 sources", indent: 0 },
            { id: "pp4", task: "Source migration (batch 3)", assignee: "Data Team", status: "Not Started", startDate: "2026-03-16", endDate: "2026-04-01", dependencies: "pp3", notes: "5 sources", indent: 0 },
            { id: "pp5", task: "Validation & decommission", assignee: "Carlos Mendez", status: "Not Started", startDate: "2026-04-01", endDate: "2026-05-15", dependencies: "pp4", notes: "", indent: 0 },
          ],
        },
      }),
      createProgram("pa1-p3", "Infrastructure Cost Optimization", {
        healthStatus: "green",
        data: {
          ...defaultDashboardData,
          projectName: "Infrastructure Cost Optimization",
          phase: "Planning",
          deliveryDate: "2026-09-30",
          contacts: [
            { id: "1", role: "Program Manager", name: "Rachel Kim" },
            { id: "2", role: "Product Lead", name: "Tom Harris" },
            { id: "3", role: "Engineering Lead", name: "Devon Clark" },
            { id: "4", role: "Design Lead", name: "" },
          ],
          scopeText: "Reduce cloud infrastructure spend by 25% through right-sizing, reserved instances, and workload optimization.",
          scopePeriod: "Q3 2026",
          executiveSummaries: [
            {
              id: "es1", date: "2026-02-10",
              recentProgress: "- Completed cost audit across all AWS accounts\n- Identified $180K/month in idle resources\n- Started reserved instance planning",
              nextSteps: "- Present findings to leadership for budget approval\n- Begin Phase 1 right-sizing in dev/staging\n- Implement automated cost alerting",
              risksAndMitigation: "- Teams may resist instance downsizing. Mitigation: providing performance benchmarks before and after changes.",
              impactToOtherPrograms: "- All teams will need to update instance types in their deployment configs",
            },
          ],
          milestones: [
            { id: "m1", name: "Cost audit complete", status: "Complete", startDate: "2026-01-06", finishDate: "2026-02-07" },
            { id: "m2", name: "Leadership approval", status: "In Progress", startDate: "2026-02-10", finishDate: "2026-02-28" },
            { id: "m3", name: "Phase 1: Dev/staging optimization", status: "Not Started", startDate: "2026-03-01", finishDate: "2026-05-31" },
            { id: "m4", name: "Phase 2: Production optimization", status: "Not Started", startDate: "2026-06-01", finishDate: "2026-09-30" },
          ],
          raidItems: [
            { id: "r1", summary: "Teams may push back on instance downsizing", type: "Risk", status: "Open", assignedTo: "Rachel Kim", nextSteps: "Prepare performance benchmark data" },
            { id: "r2", summary: "Reserved instance commitments require finance approval", type: "Dependency", status: "Open", assignedTo: "Tom Harris", nextSteps: "Finance review scheduled 3/5" },
          ],
          projectPlan: [
            { id: "pp1", task: "Cost audit & analysis", assignee: "Devon Clark", status: "Complete", startDate: "2026-01-06", endDate: "2026-02-07", dependencies: "", notes: "", indent: 0 },
            { id: "pp2", task: "Optimization plan & approval", assignee: "Rachel Kim", status: "In Progress", startDate: "2026-02-10", endDate: "2026-02-28", dependencies: "pp1", notes: "", indent: 0 },
            { id: "pp3", task: "Dev/staging right-sizing", assignee: "DevOps", status: "Not Started", startDate: "2026-03-01", endDate: "2026-05-31", dependencies: "pp2", notes: "", indent: 0 },
          ],
        },
      }),
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
    name: "Growth & Monetization",
    programs: [
      createProgram("pa2-p1", "Self-Serve Onboarding", {
        healthStatus: "green",
        data: {
          ...defaultDashboardData,
          projectName: "Self-Serve Onboarding",
          phase: "Execution",
          deliveryDate: "2026-04-15",
          contacts: [
            { id: "1", role: "Program Manager", name: "Nina Okafor" },
            { id: "2", role: "Product Lead", name: "David Park" },
            { id: "3", role: "Engineering Lead", name: "Amy Zhang" },
            { id: "4", role: "Design Lead", name: "Jordan Lee" },
          ],
          keyLinks: [
            { id: "l1", label: "Figma Designs", url: "https://figma.com/file/onboarding-v2" },
            { id: "l2", label: "PRD", url: "https://docs.example.com/self-serve-prd" },
          ],
          scopeText: "Build a self-serve onboarding flow that reduces time-to-value from 14 days to under 30 minutes. Target: 40% of new signups complete setup without sales assistance.",
          scopePeriod: "Q1 2026",
          executiveSummaries: [
            {
              id: "es1", date: "2026-02-13",
              recentProgress: "- Interactive product tour implemented and A/B tested\n- Template gallery launched with 15 starter templates\n- Onboarding completion rate up from 23% to 58%",
              nextSteps: "- Add contextual help tooltips\n- Build progress tracking dashboard for new users\n- Launch email nurture sequence for incomplete signups",
              risksAndMitigation: "- Template quality concerns from enterprise customers. Mitigation: adding industry-specific templates in next sprint.",
              impactToOtherPrograms: "- Billing team needs to support new trial-to-paid conversion flow",
            },
          ],
          milestones: [
            { id: "m1", name: "Product tour MVP", status: "Complete", startDate: "2025-12-01", finishDate: "2026-01-15" },
            { id: "m2", name: "Template gallery launch", status: "Complete", startDate: "2026-01-16", finishDate: "2026-02-07" },
            { id: "m3", name: "Progress dashboard", status: "In Progress", startDate: "2026-02-10", finishDate: "2026-03-14" },
            { id: "m4", name: "GA launch", status: "Not Started", startDate: "2026-03-17", finishDate: "2026-04-15" },
          ],
          raidItems: [
            { id: "r1", summary: "Enterprise customers want SSO during onboarding", type: "Risk", status: "Open", assignedTo: "Amy Zhang", nextSteps: "Scoping SSO integration effort" },
            { id: "r2", summary: "Update billing API for trial conversion", type: "Action", status: "In Progress", assignedTo: "Billing Team", nextSteps: "API changes in review, deploy by 3/1" },
            { id: "r3", summary: "Email service provider rate limits during launch", type: "Risk", status: "Open", assignedTo: "Nina Okafor", nextSteps: "Requesting rate limit increase" },
          ],
          projectPlan: [
            { id: "pp1", task: "Product tour", assignee: "Frontend Team", status: "Complete", startDate: "2025-12-01", endDate: "2026-01-15", dependencies: "", notes: "", indent: 0 },
            { id: "pp2", task: "Template gallery", assignee: "Amy Zhang", status: "Complete", startDate: "2026-01-16", endDate: "2026-02-07", dependencies: "", notes: "", indent: 0 },
            { id: "pp3", task: "Progress dashboard", assignee: "Frontend Team", status: "In Progress", startDate: "2026-02-10", endDate: "2026-03-14", dependencies: "pp2", notes: "", indent: 0 },
            { id: "pp4", task: "Email nurture sequence", assignee: "Marketing", status: "Not Started", startDate: "2026-03-01", endDate: "2026-03-28", dependencies: "", notes: "", indent: 0 },
            { id: "pp5", task: "GA launch & rollout", assignee: "Nina Okafor", status: "Not Started", startDate: "2026-03-17", endDate: "2026-04-15", dependencies: "pp3,pp4", notes: "", indent: 0 },
          ],
        },
      }),
      createProgram("pa2-p2", "Enterprise Billing Overhaul", {
        healthStatus: "red",
        data: {
          ...defaultDashboardData,
          projectName: "Enterprise Billing Overhaul",
          phase: "Execution",
          deliveryDate: "2026-03-31",
          contacts: [
            { id: "1", role: "Program Manager", name: "Marcus Johnson" },
            { id: "2", role: "Product Lead", name: "Emily Sato" },
            { id: "3", role: "Engineering Lead", name: "Raj Gupta" },
            { id: "4", role: "Design Lead", name: "Chris Novak" },
          ],
          keyLinks: [
            { id: "l1", label: "Billing API Spec", url: "https://docs.example.com/billing-api-v3" },
          ],
          scopeText: "Replace legacy billing system with usage-based pricing engine supporting multi-currency, volume discounts, and custom contracts.",
          scopePeriod: "Q1 2026",
          executiveSummaries: [
            {
              id: "es1", date: "2026-02-14",
              recentProgress: "- Invoice generation engine rebuilt and deployed\n- Stripe integration complete for card payments\n- 2 of 8 enterprise customers migrated",
              nextSteps: "- Resolve currency conversion discrepancy blocking EU migration\n- Complete ACH/wire transfer support\n- Migrate remaining 6 enterprise accounts",
              risksAndMitigation: "- Currency conversion bug causing $0.01-$0.03 rounding errors on EU invoices. Blocking migration of 4 EU customers. Engineering investigating root cause.",
              impactToOtherPrograms: "- Sales team cannot close Q1 deals requiring custom contract terms until new billing launches",
            },
          ],
          milestones: [
            { id: "m1", name: "Invoice engine rebuild", status: "Complete", startDate: "2025-10-01", finishDate: "2026-01-15" },
            { id: "m2", name: "Stripe integration", status: "Complete", startDate: "2025-11-01", finishDate: "2026-01-31" },
            { id: "m3", name: "Enterprise migration (8 accounts)", status: "In Progress", startDate: "2026-02-01", finishDate: "2026-03-15" },
            { id: "m4", name: "Legacy system decommission", status: "Not Started", startDate: "2026-03-16", finishDate: "2026-03-31" },
          ],
          raidItems: [
            { id: "r1", summary: "Currency conversion rounding errors on EU invoices", type: "Issue", status: "Open", assignedTo: "Raj Gupta", nextSteps: "Root cause analysis in progress, ETA 2/21" },
            { id: "r2", summary: "March 31 deadline at risk if EU bug not resolved by 2/28", type: "Risk", status: "Open", assignedTo: "Marcus Johnson", nextSteps: "Escalation meeting with VP Eng scheduled 2/20" },
            { id: "r3", summary: "ACH/wire transfer support not yet built", type: "Issue", status: "In Progress", assignedTo: "Raj Gupta", nextSteps: "Implementation started, 60% complete" },
            { id: "r4", summary: "Sales team blocked on custom contract deals", type: "Dependency", status: "Open", assignedTo: "Emily Sato", nextSteps: "Providing manual workaround for Q1 deals" },
            { id: "r5", summary: "Compliance review for PCI DSS", type: "Action", status: "In Progress", assignedTo: "Security Team", nextSteps: "Audit scheduled for 3/10" },
          ],
          projectPlan: [
            { id: "pp1", task: "Invoice engine", assignee: "Backend Team", status: "Complete", startDate: "2025-10-01", endDate: "2026-01-15", dependencies: "", notes: "", indent: 0 },
            { id: "pp2", task: "Payment integrations", assignee: "Raj Gupta", status: "In Progress", startDate: "2025-11-01", endDate: "2026-02-28", dependencies: "", notes: "Stripe done, ACH in progress", indent: 0 },
            { id: "pp3", task: "Enterprise migration", assignee: "Migration Team", status: "In Progress", startDate: "2026-02-01", endDate: "2026-03-15", dependencies: "pp1,pp2", notes: "2/8 complete", indent: 0 },
            { id: "pp4", task: "Legacy decommission", assignee: "DevOps", status: "Not Started", startDate: "2026-03-16", endDate: "2026-03-31", dependencies: "pp3", notes: "", indent: 0 },
          ],
        },
      }),
      createProgram("pa2-p3", "Analytics Dashboard 2.0", {
        healthStatus: "yellow",
        data: {
          ...defaultDashboardData,
          projectName: "Analytics Dashboard 2.0",
          phase: "Execution",
          deliveryDate: "2026-07-31",
          contacts: [
            { id: "1", role: "Program Manager", name: "Tanya Brooks" },
            { id: "2", role: "Product Lead", name: "Sam Wilson" },
            { id: "3", role: "Engineering Lead", name: "Yuki Tanaka" },
            { id: "4", role: "Design Lead", name: "Maria Garcia" },
          ],
          keyLinks: [
            { id: "l1", label: "Figma Mockups", url: "https://figma.com/file/analytics-v2" },
            { id: "l2", label: "User Research", url: "https://docs.example.com/analytics-research" },
          ],
          scopeText: "Rebuild analytics dashboard with real-time data, custom report builder, and exportable insights. Goal: increase daily active usage by 3x.",
          scopePeriod: "Q2 2026",
          executiveSummaries: [
            {
              id: "es1", date: "2026-02-11",
              recentProgress: "- Real-time data widgets shipped to beta users\n- Custom report builder UI 80% complete\n- Beta NPS score: 72 (up from 45 on old dashboard)",
              nextSteps: "- Complete export functionality (PDF, CSV, API)\n- Build scheduled report delivery feature\n- Expand beta to 500 users",
              risksAndMitigation: "- Query performance degrades above 1M rows. Mitigation: implementing materialized views and query caching layer.",
              impactToOtherPrograms: "- Data Pipeline v2 must complete source migration before analytics can show real-time data for all metrics",
            },
          ],
          milestones: [
            { id: "m1", name: "Real-time widgets beta", status: "Complete", startDate: "2025-11-01", finishDate: "2026-01-31" },
            { id: "m2", name: "Report builder beta", status: "In Progress", startDate: "2026-01-15", finishDate: "2026-03-15" },
            { id: "m3", name: "Export & scheduling", status: "Not Started", startDate: "2026-03-16", finishDate: "2026-05-31" },
            { id: "m4", name: "GA launch", status: "Not Started", startDate: "2026-06-01", finishDate: "2026-07-31" },
          ],
          raidItems: [
            { id: "r1", summary: "Query performance at scale (>1M rows)", type: "Risk", status: "In Progress", assignedTo: "Yuki Tanaka", nextSteps: "Implementing materialized views" },
            { id: "r2", summary: "Dependency on Data Pipeline v2 for real-time metrics", type: "Dependency", status: "Open", assignedTo: "Tanya Brooks", nextSteps: "Syncing with Data Pipeline team weekly" },
            { id: "r3", summary: "PDF export library licensing review", type: "Action", status: "Open", assignedTo: "Sam Wilson", nextSteps: "Legal review by 3/1" },
          ],
          projectPlan: [
            { id: "pp1", task: "Real-time widgets", assignee: "Frontend Team", status: "Complete", startDate: "2025-11-01", endDate: "2026-01-31", dependencies: "", notes: "", indent: 0 },
            { id: "pp2", task: "Report builder", assignee: "Yuki Tanaka", status: "In Progress", startDate: "2026-01-15", endDate: "2026-03-15", dependencies: "", notes: "", indent: 0 },
            { id: "pp3", task: "Export features", assignee: "Backend Team", status: "Not Started", startDate: "2026-03-16", endDate: "2026-05-31", dependencies: "pp2", notes: "", indent: 0 },
            { id: "pp4", task: "GA rollout", assignee: "Tanya Brooks", status: "Not Started", startDate: "2026-06-01", endDate: "2026-07-31", dependencies: "pp3", notes: "", indent: 0 },
          ],
        },
      }),
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
    name: "Customer Experience",
    programs: [
      createProgram("pa3-p1", "Mobile App Redesign", {
        healthStatus: "green",
        data: {
          ...defaultDashboardData,
          projectName: "Mobile App Redesign",
          phase: "Execution",
          deliveryDate: "2026-05-30",
          contacts: [
            { id: "1", role: "Program Manager", name: "Olivia Martin" },
            { id: "2", role: "Product Lead", name: "Ben Cooper" },
            { id: "3", role: "Engineering Lead", name: "Fatima Ali" },
            { id: "4", role: "Design Lead", name: "Tyler Ross" },
          ],
          keyLinks: [
            { id: "l1", label: "Figma Prototype", url: "https://figma.com/proto/mobile-redesign" },
            { id: "l2", label: "TestFlight", url: "https://testflight.apple.com/app/example" },
          ],
          scopeText: "Complete redesign of iOS and Android apps with new design system, improved navigation, and offline-first architecture.",
          scopePeriod: "Q2 2026",
          executiveSummaries: [
            {
              id: "es1", date: "2026-02-13",
              recentProgress: "- New navigation paradigm shipped to TestFlight beta\n- Design system components 90% complete\n- Crash rate reduced 60% with new architecture",
              nextSteps: "- Complete offline sync engine\n- Submit to App Store review\n- Plan staged rollout (10% -> 50% -> 100%)",
              risksAndMitigation: "- Android parity lagging iOS by 2 weeks. Mitigation: shifting one iOS dev to Android team.",
              impactToOtherPrograms: "- Push notification service needs API update for new deep linking scheme",
            },
          ],
          milestones: [
            { id: "m1", name: "Design system complete", status: "Complete", startDate: "2025-10-15", finishDate: "2026-01-10" },
            { id: "m2", name: "iOS beta on TestFlight", status: "Complete", startDate: "2026-01-13", finishDate: "2026-02-07" },
            { id: "m3", name: "Android beta on Play Store", status: "In Progress", startDate: "2026-02-10", finishDate: "2026-03-07" },
            { id: "m4", name: "App Store submission", status: "Not Started", startDate: "2026-04-01", finishDate: "2026-04-15" },
            { id: "m5", name: "Full rollout", status: "Not Started", startDate: "2026-04-15", finishDate: "2026-05-30" },
          ],
          raidItems: [
            { id: "r1", summary: "Android build lagging iOS by 2 weeks", type: "Risk", status: "In Progress", assignedTo: "Fatima Ali", nextSteps: "Reallocating 1 iOS dev to Android" },
            { id: "r2", summary: "Offline sync conflicts with shared documents", type: "Issue", status: "Open", assignedTo: "Fatima Ali", nextSteps: "Designing conflict resolution UX" },
            { id: "r3", summary: "Push notification API update for deep links", type: "Dependency", status: "Open", assignedTo: "Olivia Martin", nextSteps: "Coordinating with Platform team" },
          ],
          projectPlan: [
            { id: "pp1", task: "Design system", assignee: "Tyler Ross", status: "Complete", startDate: "2025-10-15", endDate: "2026-01-10", dependencies: "", notes: "", indent: 0 },
            { id: "pp2", task: "iOS implementation", assignee: "iOS Team", status: "Complete", startDate: "2025-12-01", endDate: "2026-02-07", dependencies: "pp1", notes: "", indent: 0 },
            { id: "pp3", task: "Android implementation", assignee: "Android Team", status: "In Progress", startDate: "2026-01-05", endDate: "2026-03-07", dependencies: "pp1", notes: "", indent: 0 },
            { id: "pp4", task: "App Store rollout", assignee: "Olivia Martin", status: "Not Started", startDate: "2026-04-01", endDate: "2026-05-30", dependencies: "pp2,pp3", notes: "", indent: 0 },
          ],
        },
      }),
      createProgram("pa3-p2", "Help Center & Knowledge Base", {
        healthStatus: "green",
        data: {
          ...defaultDashboardData,
          projectName: "Help Center & Knowledge Base",
          phase: "Planning",
          deliveryDate: "2026-08-31",
          contacts: [
            { id: "1", role: "Program Manager", name: "Diana Chen" },
            { id: "2", role: "Product Lead", name: "Patrick O'Brien" },
            { id: "3", role: "Engineering Lead", name: "Aisha Patel" },
            { id: "4", role: "Design Lead", name: "Leo Fernandez" },
          ],
          scopeText: "Build AI-powered help center with contextual search, interactive tutorials, and automated ticket deflection. Target: reduce support tickets by 35%.",
          scopePeriod: "Q3 2026",
          executiveSummaries: [
            {
              id: "es1", date: "2026-02-10",
              recentProgress: "- Completed competitive analysis of 8 help center platforms\n- AI search prototype showing 85% relevance accuracy\n- Content audit identified 200+ articles needing updates",
              nextSteps: "- Finalize vendor selection for search infrastructure\n- Begin content migration and refresh\n- Design interactive tutorial framework",
              risksAndMitigation: "- Content team bandwidth limited for 200+ article rewrites. Mitigation: exploring AI-assisted content generation.",
              impactToOtherPrograms: "- Need API access from Mobile Redesign for in-app help integration",
            },
          ],
          milestones: [
            { id: "m1", name: "Research & vendor selection", status: "In Progress", startDate: "2026-01-15", finishDate: "2026-03-01" },
            { id: "m2", name: "Content migration", status: "Not Started", startDate: "2026-03-01", finishDate: "2026-05-31" },
            { id: "m3", name: "AI search integration", status: "Not Started", startDate: "2026-04-01", finishDate: "2026-07-15" },
            { id: "m4", name: "Launch", status: "Not Started", startDate: "2026-07-15", finishDate: "2026-08-31" },
          ],
          raidItems: [
            { id: "r1", summary: "Content team bandwidth for 200+ article rewrites", type: "Risk", status: "Open", assignedTo: "Patrick O'Brien", nextSteps: "Evaluating AI content generation tools" },
            { id: "r2", summary: "Mobile app API needed for in-app help", type: "Dependency", status: "Open", assignedTo: "Diana Chen", nextSteps: "Aligning with Mobile Redesign timeline" },
          ],
          projectPlan: [
            { id: "pp1", task: "Research & planning", assignee: "Diana Chen", status: "In Progress", startDate: "2026-01-15", endDate: "2026-03-01", dependencies: "", notes: "", indent: 0 },
            { id: "pp2", task: "Content migration", assignee: "Content Team", status: "Not Started", startDate: "2026-03-01", endDate: "2026-05-31", dependencies: "pp1", notes: "", indent: 0 },
            { id: "pp3", task: "AI search build", assignee: "Aisha Patel", status: "Not Started", startDate: "2026-04-01", endDate: "2026-07-15", dependencies: "pp1", notes: "", indent: 0 },
            { id: "pp4", task: "Launch", assignee: "Diana Chen", status: "Not Started", startDate: "2026-07-15", endDate: "2026-08-31", dependencies: "pp2,pp3", notes: "", indent: 0 },
          ],
        },
      }),
      createProgram("pa3-p3", "Notification System Revamp", {
        healthStatus: "yellow",
        data: {
          ...defaultDashboardData,
          projectName: "Notification System Revamp",
          phase: "Discovery",
          deliveryDate: "2026-10-31",
          contacts: [
            { id: "1", role: "Program Manager", name: "Kevin Wright" },
            { id: "2", role: "Product Lead", name: "Sofia Reyes" },
            { id: "3", role: "Engineering Lead", name: "Hassan Mohammed" },
            { id: "4", role: "Design Lead", name: "Erin Walsh" },
          ],
          scopeText: "Unified notification system across email, push, in-app, and Slack with user preference controls and smart batching to reduce notification fatigue.",
          scopePeriod: "Q4 2026",
          executiveSummaries: [
            {
              id: "es1", date: "2026-02-12",
              recentProgress: "- User research complete: 78% report notification fatigue\n- Technical RFC drafted for unified notification bus\n- Surveyed 15 enterprise customers on preferences",
              nextSteps: "- Finalize RFC and get architecture approval\n- Build notification preference center prototype\n- Define smart batching algorithm requirements",
              risksAndMitigation: "- Scope may expand if Slack integration requires enterprise Slack plan. Mitigation: scoping Slack as optional Phase 2.",
              impactToOtherPrograms: "- Mobile Redesign deep linking depends on new notification payload format",
            },
          ],
          milestones: [
            { id: "m1", name: "User research & RFC", status: "Complete", startDate: "2026-01-06", finishDate: "2026-02-14" },
            { id: "m2", name: "Architecture approval", status: "In Progress", startDate: "2026-02-17", finishDate: "2026-03-07" },
            { id: "m3", name: "Preference center MVP", status: "Not Started", startDate: "2026-03-10", finishDate: "2026-06-30" },
            { id: "m4", name: "Smart batching & GA", status: "Not Started", startDate: "2026-07-01", finishDate: "2026-10-31" },
          ],
          raidItems: [
            { id: "r1", summary: "Slack integration may require enterprise plan", type: "Risk", status: "Open", assignedTo: "Sofia Reyes", nextSteps: "Scoping as optional Phase 2" },
            { id: "r2", summary: "Mobile deep linking depends on new payload format", type: "Dependency", status: "Open", assignedTo: "Kevin Wright", nextSteps: "Coordinating payload spec with Mobile team" },
            { id: "r3", summary: "GDPR compliance review for notification preferences", type: "Action", status: "Open", assignedTo: "Legal Team", nextSteps: "Review requested, awaiting scheduling" },
          ],
          projectPlan: [
            { id: "pp1", task: "Discovery & research", assignee: "Sofia Reyes", status: "Complete", startDate: "2026-01-06", endDate: "2026-02-14", dependencies: "", notes: "", indent: 0 },
            { id: "pp2", task: "Architecture & RFC", assignee: "Hassan Mohammed", status: "In Progress", startDate: "2026-02-17", endDate: "2026-03-07", dependencies: "pp1", notes: "", indent: 0 },
            { id: "pp3", task: "Preference center", assignee: "Frontend Team", status: "Not Started", startDate: "2026-03-10", endDate: "2026-06-30", dependencies: "pp2", notes: "", indent: 0 },
            { id: "pp4", task: "Smart batching engine", assignee: "Hassan Mohammed", status: "Not Started", startDate: "2026-07-01", endDate: "2026-10-31", dependencies: "pp3", notes: "", indent: 0 },
          ],
        },
      }),
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
    const version = localStorage.getItem(NAV_STORAGE_KEY + "-version");
    if (version !== NAV_DATA_VERSION) {
      localStorage.removeItem(NAV_STORAGE_KEY);
      localStorage.setItem(NAV_STORAGE_KEY + "-version", NAV_DATA_VERSION);
      return defaultNavData;
    }
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

  const addProgram = useCallback((productAreaId: string, name: string) => {
    const newId = `${productAreaId}-p${Date.now()}`;
    setNavData((prev) => ({
      ...prev,
      productAreas: prev.productAreas.map((pa) =>
        pa.id === productAreaId
          ? { ...pa, programs: [...pa.programs, createProgram(newId, name)] }
          : pa
      ),
      currentView: { type: "program", productAreaId, programId: newId },
    }));
  }, []);

  const deleteProgram = useCallback((productAreaId: string, programId: string) => {
    setNavData((prev) => {
      const newProductAreas = prev.productAreas.map((pa) =>
        pa.id === productAreaId
          ? { ...pa, programs: pa.programs.filter((p) => p.id !== programId) }
          : pa
      );
      // If we're currently viewing the deleted program, navigate to the product area
      let newView = prev.currentView;
      if (
        prev.currentView.type === "program" &&
        prev.currentView.programId === programId
      ) {
        newView = { type: "product-area", productAreaId };
      }
      return { ...prev, productAreas: newProductAreas, currentView: newView };
    });
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
        addProgram,
        deleteProgram,
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
