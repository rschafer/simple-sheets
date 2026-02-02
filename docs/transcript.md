# Smartsheet Alternative - Product Requirements Transcript

## Project Overview

**Goal:** Create a better, more user-friendly version of Smartsheet with a single-page dashboard that users can easily edit with the simplicity of Google Sheets/Docs.

**Core Pain Point:** Current Smartsheet requires creating separate sheets that link into the dashboard. The new solution should have everything on one page with inline editing—no jumping between sheets.

---

## Reference Analysis

**Current State (Smartsheet):**
- Harsh blue box design that feels dated
- Key Project Links point to separate Smartsheets (Smartsheet Plan, Smartsheet RAID, Program Page)
- Fragmented experience requiring navigation between multiple sheets
- Static feel with limited inline editing

---

## Required Dashboard Sections

### 1. Project Name
- Prominently displayed
- Inline editable

### 2. Key Links
- List of external/internal resource links
- Inline editable labels and URLs

### 3. Primary Contacts
- Role-based contact list (e.g., Program, Product, Engineering)
- Inline editable

### 4. Program Status
- **Health Indicator:** Red, Yellow, or Green
  - Can be manually set OR auto-calculated based on criteria
  - Both options should be available
- **Phase:** Customizable phases
  - Default phases: Discovery, Planning, Execution
  - Should be customizable per organization

### 5. Delivery Date Target
- Key milestone date display
- GA (General Availability) or target launch date

### 6. Executive Summary
- Weekly update section
- **Template Options:**
  - Recent Progress
  - Next Steps
  - Risks & Mitigation Plan
- Templates should be both org-wide AND user-specific
- Historical summaries accessible (1 year for MVP)
- Multiple preset templates available

### 7. Scope
- Allow users to enter scope for a specific time period (e.g., Quarterly Scope)
- Inline editable text area

### 8. Milestones
- Tabular display with columns:
  - Milestone name
  - Status (Complete, In Progress, Not Started)
  - Start date
  - Finish date
- Inline editable
- Export to Gantt chart (outside dashboard)

### 9. RAID (Risks, Actions, Issues, Dependencies)
- **Display Options:** Both collapsible section AND modal/side panel
- **Columns:**
  - Summary
  - Severity
  - Type
  - Status
  - Assigned To
  - Update/Next Steps
- Filtering and sorting capabilities
- Status tracking per item

### 10. Project Plan
- NOT displayed on main dashboard
- Accessible via click/expand
- Opens as Google Sheets-like form
- Multiple preset project plan templates available

---

## Sharing & Access Control

### Access Levels
- Owner
- Editor
- Viewer
- Commenter

### Portfolio Integration
- Dashboard data can be embedded into portfolio/parent views
- Share to other dashboards capability

### Expected Scale
- 100+ users accessing a single dashboard

---

## Notifications & Subscriptions

### Channels
- Outlook
- Slack

### Trigger Events (MVP)
- Health status changes

### Future Triggers (Post-MVP)
- Milestone due dates
- New comments

### Frequency Options
- User selectable: Real-time, Daily digest, or Weekly digest

---

## UX Requirements

### Editing Experience
- **Inline editable** - no edit mode toggle needed
- Everything should feel as easy as Google Sheets/Docs

### Responsiveness
- Desktop-first design
- Mobile-responsive

### Key Differentiator
- Single-page experience
- No need to leave the dashboard
- No separate linked sheets

---

## Technical Notes

### Data Export
- Gantt chart export capability (external to dashboard)

### Templates
- Multiple preset templates for:
  - Executive Summary formats
  - Project Plan structures

### History
- 1-year historical data retention for weekly summaries (MVP)

---

## Summary of Key Improvements Over Smartsheet

| Feature | Smartsheet (Current) | New Solution |
|---------|---------------------|--------------|
| Data Location | Separate linked sheets | All on one page |
| Editing | Navigate to edit | Inline editing |
| Visual Design | Dated blue boxes | Modern, clean UI |
| RAID Log | Separate sheet | Inline + side panel |
| Project Plan | Separate sheet | Expandable section |
| User Experience | Fragmented | Unified dashboard |

---

## Next Steps

1. Build interactive prototype with all sections
2. Implement inline editing for all fields
3. Design notification subscription flow
4. Create template management system
5. Build access control UI
6. Develop portfolio/parent dashboard integration

---

*Document generated from product requirements discussion*
