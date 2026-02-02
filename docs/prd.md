# Product Requirements Document: Project Dashboard

**Version:** 1.0
**Date:** 2026-02-02
**Author:** Product Management
**Status:** Draft

---

## Table of Contents

1. [Product Vision and Goals](#1-product-vision-and-goals)
2. [Core Requirements and Features](#2-core-requirements-and-features)
3. [User Personas](#3-user-personas)
4. [User Flows](#4-user-flows)
5. [Acceptance Criteria](#5-acceptance-criteria)
6. [Technical Considerations](#6-technical-considerations)
7. [MVP vs Post-MVP](#7-mvp-vs-post-mvp)
8. [Success Metrics](#8-success-metrics)
9. [Open Questions](#9-open-questions)

---

## 1. Product Vision and Goals

### Vision

Replace fragmented project management dashboards (specifically Smartsheet) with a single-page, inline-editable project dashboard that feels as natural as Google Docs. Every piece of project information lives on one page. Users never leave the dashboard to update data.

### Problem Statement

Today, teams using Smartsheet must navigate between a dashboard and multiple linked sheets to view or edit project data. The RAID log is a separate sheet. The project plan is a separate sheet. Updating the executive summary means opening another view. This fragmentation wastes time, creates confusion about where the source of truth lives, and discourages regular updates.

### Goals

| Goal | Measure |
|------|---------|
| Eliminate context switching | Zero navigation away from the dashboard to edit any standard field |
| Increase update frequency | Weekly executive summaries completed on time by 80%+ of projects |
| Support 100+ concurrent viewers | Sub-second load time at scale |
| Modern, clean user experience | NPS of 40+ within 6 months of launch |
| Easy onboarding | New project setup in under 10 minutes using templates |

### Non-Goals

- Replacing full-featured project management tools (Jira, Asana) for day-to-day task tracking
- Building a standalone Gantt chart tool (export only)
- Native mobile apps (responsive web is sufficient for MVP)
- Real-time collaborative editing (Google Docs-style cursors) in MVP

---

## 2. Core Requirements and Features

The dashboard consists of 10 sections, plus cross-cutting capabilities for sharing, notifications, and templates.

### 2.1 Project Name

A prominent, inline-editable title at the top of the dashboard. This is the primary identifier for the project across the platform, including portfolio views and notifications.

### 2.2 Key Links

A list of labeled hyperlinks to external or internal resources (e.g., Confluence pages, Figma files, repositories). Each row has an editable label and an editable URL. Users can add, reorder, and remove links inline.

### 2.3 Primary Contacts

A role-based contact list. Each row contains a role label (e.g., "Program Manager," "Engineering Lead") and a person selector. Roles are inline-editable. People are selected from the organization directory.

### 2.4 Program Status

Two components displayed together:

- **Health Indicator** -- a Red / Yellow / Green badge. Can be set manually by the owner or editor, OR auto-calculated based on configurable rules (e.g., overdue milestones trigger Yellow, critical RAID items trigger Red). Both modes must be available; the dashboard owner chooses which mode applies.
- **Phase** -- a labeled badge showing the current project phase. Default phases are Discovery, Planning, and Execution. Phases are customizable per organization through an admin setting.

### 2.5 Delivery Date Target

A single prominent date field showing the target GA or launch date. Inline-editable. Changing this date should be auditable (history preserved).

### 2.6 Executive Summary

The most content-rich section. Designed for weekly updates.

- Rich-text editor supporting headings, bullets, bold, and links
- **Templates** available for structuring the summary. Default template sections: Recent Progress, Next Steps, Risks and Mitigation Plan
- Templates can be defined at the organization level (shared across all projects) or at the user level (personal templates)
- **History**: all past summaries are retained and browsable. MVP retains 1 year of history. Each summary is timestamped and attributed to the author.
- Multiple preset templates ship out of the box

### 2.7 Scope

A text area for defining project scope, typically for a specific time period (e.g., "Q1 2026 Scope"). Inline-editable rich text. Supports versioning so past scope definitions are accessible.

### 2.8 Milestones

A table with the following columns:

| Column | Type |
|--------|------|
| Milestone name | Text |
| Status | Dropdown: Complete, In Progress, Not Started |
| Start date | Date picker |
| Finish date | Date picker |

All cells are inline-editable. Rows can be added, removed, and reordered. Data can be exported to an external Gantt chart view.

### 2.9 RAID Log (Risks, Actions, Issues, Dependencies)

Available in two display modes that the user can toggle between:

1. **Collapsible inline section** on the dashboard itself
2. **Side panel / modal** for a more detailed view

Columns:

| Column | Type |
|--------|------|
| Summary | Text |
| Severity | Dropdown: Critical, High, Medium, Low |
| Type | Dropdown: Risk, Action, Issue, Dependency |
| Status | Dropdown: Open, In Progress, Closed |
| Assigned To | Person selector |
| Update / Next Steps | Text |

Supports filtering by any column and sorting by any column. All cells are inline-editable.

### 2.10 Project Plan

Not displayed directly on the main dashboard surface. Accessed via a button or expandable section that opens a spreadsheet-like editing experience (similar to Google Sheets). Multiple preset project plan templates are available for initial setup. Full inline editing within the expanded view.

### 2.11 Sharing and Access Control

Four access levels:

| Level | Capabilities |
|-------|-------------|
| **Owner** | Full control. Can edit all fields, manage access, delete the dashboard, configure auto-health rules, manage templates. One owner per dashboard. |
| **Editor** | Can edit all content fields. Cannot manage access or delete the dashboard. |
| **Commenter** | Can view all content and add comments. Cannot edit fields. |
| **Viewer** | Read-only access. Can view and export but cannot modify or comment. |

**Portfolio Integration**: Dashboard data can be embedded or linked into portfolio-level or parent-level views, enabling executives to see rolled-up status across multiple projects without opening each dashboard.

**Scale**: The system must support 100+ users accessing a single dashboard concurrently.

### 2.12 Notifications and Subscriptions

Users subscribe to notification events on a per-dashboard basis.

**Channels**: Outlook email, Slack

**MVP Triggers**:
- Health status changes (Red/Yellow/Green transitions)

**Post-MVP Triggers**:
- Milestone due dates approaching or passed
- New comments added

**Frequency Options** (user-selectable per subscription):
- Real-time
- Daily digest
- Weekly digest

---

## 3. User Personas

### 3.1 Program Manager (Owner)

**Role**: Owns one or more project dashboards. Responsible for weekly updates and overall project health reporting.

**Key behaviors**:
- Updates the executive summary every week
- Sets the health indicator and phase
- Manages milestones and RAID items
- Configures who has access to the dashboard
- Needs the update process to be fast so it does not become a burden

**Pain points with current tools**:
- Spends too long navigating between sheets to compile updates
- Formatting in Smartsheet is rigid and dated
- Sharing settings are confusing

### 3.2 Executive Stakeholder (Viewer)

**Role**: Reviews project status across a portfolio of projects. Rarely edits. Needs information at a glance.

**Key behaviors**:
- Checks health indicators and executive summaries weekly
- Uses portfolio views to scan multiple projects
- Subscribes to notifications for health status changes
- Reads on both desktop and mobile

**Pain points with current tools**:
- Hard to get a quick read on project health
- Must click through multiple sheets to understand status
- No reliable notification when things change

### 3.3 Team Lead / Contributor (Editor)

**Role**: Contributes to specific sections of the dashboard, such as milestones or RAID items, without owning the overall dashboard.

**Key behaviors**:
- Updates milestone statuses and dates
- Adds and manages RAID items assigned to them
- References the project plan
- Needs editing to be quick and not disrupt their workflow

**Pain points with current tools**:
- Unsure which sheet to edit
- Afraid of breaking linked formulas
- Inline editing is not available, requiring mode switches

### 3.4 Commenter (Commenter)

**Role**: Provides feedback, asks questions, and raises concerns without directly editing content. Typically a cross-functional stakeholder such as someone from Legal, Finance, or Design.

**Key behaviors**:
- Reads the executive summary and RAID log
- Leaves comments on specific items to request clarification or flag concerns
- Needs to be notified when their comments receive replies

**Pain points with current tools**:
- No good way to leave contextual feedback on Smartsheet dashboards
- Ends up sending feedback via email or Slack, disconnected from the source

---

## 4. User Flows

### 4.1 Weekly Update Flow (Program Manager)

1. Program Manager opens the dashboard (single page loads)
2. Reviews current health indicator -- adjusts if needed by clicking the badge and selecting a new color
3. Scrolls to Executive Summary section
4. Clicks into the rich-text area; a template appears with sections for Recent Progress, Next Steps, Risks and Mitigation Plan
5. Types updates directly inline. Formatting toolbar appears on focus.
6. Scrolls to Milestones table, updates statuses and dates by clicking cells directly
7. Checks RAID log, adds a new row for a newly identified risk
8. All changes auto-save. No explicit "Save" button needed.
9. Optionally clicks "Notify subscribers" to trigger an immediate notification

### 4.2 Executive Review Flow (Executive Stakeholder)

1. Executive opens the portfolio view showing all projects they are subscribed to
2. Scans health indicators (Red/Yellow/Green) across projects
3. Clicks into a Yellow-status project dashboard
4. Reads the Executive Summary for the latest weekly update
5. Expands the RAID log to review critical risks
6. Leaves a comment on a specific risk item requesting more detail
7. Returns to portfolio view

### 4.3 Project Setup Flow (Owner)

1. User clicks "New Dashboard"
2. Enters project name
3. Selects a project plan template (or starts blank)
4. Selects an executive summary template
5. System creates the dashboard with all 10 sections pre-populated with template defaults
6. Owner fills in Primary Contacts, Key Links, Delivery Date, and initial Scope
7. Owner configures health indicator mode (manual vs. auto-calculated)
8. Owner invites team members and sets their access levels (Editor, Commenter, Viewer)
9. Dashboard is live and shareable

### 4.4 RAID Triage Flow (Team Lead)

1. Team Lead opens the dashboard
2. Clicks the RAID section header to expand it, or opens the side panel for a full view
3. Filters by "Status = Open" and "Assigned To = Me"
4. Updates the "Next Steps" column for each assigned item
5. Changes status from "Open" to "In Progress" on items being actively worked
6. Adds a new Dependency item with severity "High"
7. All changes save inline

### 4.5 Notification Subscription Flow

1. User opens a dashboard they have access to
2. Clicks a "Subscribe" or bell icon
3. Selects which events to subscribe to (MVP: Health status changes)
4. Selects channel (Outlook, Slack) and frequency (Real-time, Daily, Weekly)
5. Confirms subscription
6. When a trigger event occurs, user receives a notification with a direct link back to the dashboard

---

## 5. Acceptance Criteria

### 5.1 Inline Editing

- **Given** a user with Editor or Owner access, **when** they click on any editable field (text, date, dropdown, person selector), **then** the field becomes editable in place without a page reload or navigation.
- **Given** a user with Viewer or Commenter access, **when** they click on an editable field, **then** no edit affordance appears; the field remains read-only.
- **Given** an Editor is editing a field, **when** they click away or press Escape, **then** the value is auto-saved and the field returns to display mode.

### 5.2 Health Indicator

- **Given** the health indicator is in manual mode, **when** an Owner or Editor clicks the indicator, **then** a color picker (Red, Yellow, Green) appears and the selection is saved immediately.
- **Given** the health indicator is in auto-calculated mode, **when** a milestone becomes overdue, **then** the health indicator recalculates according to the configured rules.
- **Given** any user is subscribed to health status changes, **when** the indicator changes color, **then** a notification is dispatched via the selected channel and frequency.

### 5.3 Executive Summary

- **Given** an Owner or Editor opens the Executive Summary section, **when** they begin typing, **then** a rich-text toolbar appears with formatting options (bold, italic, bullets, headings, links).
- **Given** a template is selected, **when** a new weekly summary is created, **then** the template sections are pre-populated as editable placeholders.
- **Given** a summary was created 11 months ago, **when** a user browses summary history, **then** that summary is visible and readable.
- **Given** a summary was created 13 months ago (beyond 1-year retention), **then** the system's behavior is defined by the retention policy (see Open Questions).

### 5.4 Milestones

- **Given** an Editor viewing the Milestones table, **when** they click "Add Row," **then** a new editable row appears at the bottom of the table.
- **Given** a milestone with Status "Not Started" and a Finish date in the past, **when** the dashboard loads, **then** the row is visually flagged as overdue.
- **Given** milestone data exists, **when** a user clicks "Export to Gantt," **then** a Gantt chart is generated and available for download or viewing in a new tab.

### 5.5 RAID Log

- **Given** the RAID log contains 20 items, **when** a user filters by "Type = Risk" and "Severity = Critical," **then** only matching items are displayed.
- **Given** a user clicks the RAID side panel toggle, **then** the RAID log opens in a slide-out panel with the full table and filtering controls.
- **Given** an Editor adds a new RAID item, **when** they fill in all columns and click away, **then** the item is saved and visible to all users with access.

### 5.6 Project Plan

- **Given** a user clicks the Project Plan expand button, **when** the section opens, **then** a spreadsheet-like interface loads with the project plan data.
- **Given** a user selects a project plan template during setup, **when** the plan section opens, **then** it is pre-populated with the template structure.

### 5.7 Sharing and Access Control

- **Given** an Owner opens the sharing settings, **when** they add a user with "Editor" access, **then** that user can edit all content fields on the dashboard.
- **Given** a Viewer tries to access the sharing settings, **then** the sharing management UI is not available to them.
- **Given** 100 users have the dashboard open simultaneously, **when** an Editor makes a change, **then** all viewers see the updated data within a reasonable refresh interval (see Technical Considerations).

### 5.8 Notifications

- **Given** a user is subscribed to health changes with "Real-time" frequency via Slack, **when** the health indicator changes from Green to Yellow, **then** a Slack message is delivered within 60 seconds containing the project name, old status, new status, and a link to the dashboard.
- **Given** a user is subscribed with "Daily digest" frequency, **when** multiple health changes occur in one day, **then** a single digest is sent at the configured time summarizing all changes.

### 5.9 Portfolio Integration

- **Given** an executive has a portfolio view configured, **when** a project's health indicator changes, **then** the portfolio view reflects the updated status without requiring manual refresh.

---

## 6. Technical Considerations

### 6.1 Architecture

- **Single-page application (SPA)**: The dashboard must load as a single page. All section interactions (editing, expanding RAID, opening the project plan) happen without full page reloads.
- **Auto-save**: All edits persist automatically. No "Save" button. Consider optimistic UI updates with background persistence and conflict resolution.
- **API-first design**: All dashboard data should be accessible via a REST or GraphQL API to support portfolio integration, notifications, and future mobile clients.

### 6.2 Performance

- **Initial load**: The dashboard (excluding the Project Plan section, which lazy-loads) must render in under 2 seconds on a standard broadband connection.
- **Concurrent users**: The system must handle 100+ concurrent readers and a smaller number of concurrent editors on a single dashboard without degradation.
- **Data refresh**: For viewers, data should refresh at a reasonable interval (polling or push) so that changes made by editors appear without manual reload. Target: updates visible within 30 seconds.

### 6.3 Data and Storage

- **History retention**: Executive summaries retained for 1 year in MVP. Consider archival strategy for longer retention post-MVP.
- **Audit trail**: Changes to the health indicator, delivery date, and access control should be logged with timestamp and user attribution.
- **Data export**: Milestones exportable to Gantt chart format. Consider CSV/Excel export for RAID and Milestones tables.

### 6.4 Integrations

- **Outlook**: Email notifications via SMTP or Microsoft Graph API.
- **Slack**: Notifications via Slack Incoming Webhooks or Slack App (bot token).
- **Organization directory**: Person selectors should integrate with the org's identity provider (e.g., Azure AD, Okta) for user lookup.
- **Portfolio views**: Dashboard data must be queryable by parent/portfolio dashboards for aggregation.

### 6.5 Security

- Authentication via the organization's SSO provider.
- Authorization enforced server-side for every API call based on the user's access level.
- All data in transit encrypted (TLS). Data at rest encrypted.

---

## 7. MVP vs Post-MVP

### MVP (Phase 1)

| Area | Scope |
|------|-------|
| Dashboard sections | All 10 sections as described |
| Inline editing | All fields editable inline for Owners and Editors |
| Access control | Owner, Editor, Commenter, Viewer roles |
| Health indicator | Manual mode and auto-calculated mode |
| Executive summary | Rich-text editing, templates (org-level and user-level), 1-year history |
| Milestones | Inline table with add/edit/delete, Gantt export |
| RAID log | Inline collapsible section and side panel, filtering and sorting |
| Project plan | Expandable spreadsheet-like view with templates |
| Notifications | Health status change triggers via Outlook and Slack. Real-time, daily, and weekly digest frequencies. |
| Sharing | Invite users, set access levels, share link |
| Platform | Desktop-first, mobile-responsive web |
| Templates | Preset executive summary and project plan templates |

### Post-MVP (Phase 2+)

| Area | Scope |
|------|-------|
| Notification triggers | Milestone due dates approaching/passed, new comments |
| Portfolio views | Dedicated portfolio dashboard with rolled-up health, progress, and risk indicators across projects |
| Real-time collaboration | Multi-user cursors and live co-editing (Google Docs-style) |
| Advanced auto-health rules | Configurable rules engine with weighted criteria |
| Custom fields | Allow organizations to add custom columns to Milestones and RAID tables |
| Extended history | Configurable retention beyond 1 year; archival and retrieval |
| Native mobile | Dedicated iOS/Android apps for read-heavy use cases |
| Advanced reporting | Charts, trend lines, burndown, and velocity metrics |
| AI-assisted summaries | Auto-generate executive summary drafts from milestone and RAID data |
| Integrations | Jira sync, Confluence embedding, Teams notifications |
| Template marketplace | Community-shared templates across organizations |
| Bulk operations | Multi-select rows in RAID/Milestones for batch status updates |
| Commenting | Threaded comments on any section or field (MVP supports Commenter role but comment UX is minimal) |

---

## 8. Success Metrics

### Adoption

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Active dashboards created | 500+ | 6 months post-launch |
| Weekly active users | 2,000+ | 6 months post-launch |
| Dashboards with 3+ editors | 60% of all dashboards | 6 months post-launch |

### Engagement

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Executive summaries updated weekly | 80% of active dashboards | Ongoing |
| Average time to complete weekly update | Under 10 minutes | Ongoing |
| RAID items actively managed (status changes per week) | 3+ per active dashboard | Ongoing |

### Satisfaction

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Net Promoter Score (NPS) | 40+ | 6 months post-launch |
| System Usability Scale (SUS) | 75+ (Good) | 3 months post-launch |
| Support tickets per 100 users per month | Under 5 | Ongoing |

### Performance

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Dashboard load time (p95) | Under 2 seconds | At launch |
| Auto-save latency (p95) | Under 1 second | At launch |
| Uptime | 99.9% | Ongoing |
| Concurrent users without degradation | 100+ per dashboard | At launch |

### Business Impact

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Reduction in time spent on status reporting | 50% vs. Smartsheet baseline | 6 months post-launch |
| Reduction in "Where do I find X?" support requests | 70% vs. baseline | 6 months post-launch |

---

## 9. Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | What happens to executive summaries older than 1 year? Are they permanently deleted, archived, or exportable before deletion? | Determines data retention architecture and user communication. | Product + Engineering |
| 2 | Should the auto-health calculation rules be configurable per dashboard, or only at the organization level? | Affects settings UI complexity and admin burden. | Product |
| 3 | What is the commenting UX in MVP? Is it threaded per section, per field, or a single comment stream? | Impacts the Commenter persona experience and front-end complexity. | Product + Design |
| 4 | How should conflicts be resolved when two Editors modify the same field simultaneously? Last-write-wins, or merge/lock? | Core architecture decision affecting real-time data layer. | Engineering |
| 5 | Should the portfolio view be part of MVP or deferred? The transcript implies it exists ("share to other dashboards") but does not specify depth. | Significant scope and architectural impact. | Product + Stakeholders |
| 6 | What identity providers must be supported at launch? Azure AD only, or also Okta, Google Workspace, etc.? | Integration timeline and authentication architecture. | Engineering + IT |
| 7 | What are the specific rules for auto-health calculation? E.g., "any Critical RAID item = Red," "any overdue milestone = Yellow." | Must be defined before auto-health can be implemented. | Product + Customers |
| 8 | Is there a limit on the number of rows in Milestones and RAID tables? If so, what is it? | Performance and UX implications for large projects. | Engineering |
| 9 | What Gantt export format is expected? Image, PDF, .mpp, or integration with a specific tool? | Determines export implementation approach. | Product + Design |
| 10 | Should notification digest timing be configurable (e.g., "send daily digest at 8 AM ET") or system-determined? | UX and infrastructure complexity. | Product |
| 11 | What is the transfer-of-ownership flow if a dashboard Owner leaves the organization? | Required for enterprise readiness. | Product + Engineering |
| 12 | Are organization-level templates managed by a specific admin role, or can any Owner create org templates? | Affects template governance and admin UI. | Product |

---

*This document is a living artifact. It will be updated as open questions are resolved and as user feedback is gathered during development and beta testing.*
