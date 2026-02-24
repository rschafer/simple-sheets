import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface ProgramReportRequest {
  programName: string;
  health: string;
  phase: string;
  deliveryDate: string;
  projectPlan: { task: string; status: string; assignee: string; notes: string }[];
  raidItems: { type: string; summary: string; status: string; nextSteps: string }[];
  milestones: { name: string; status: string; startDate: string; finishDate: string }[];
  latestSummary: string;
}

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body: ProgramReportRequest = await request.json();

    const completedTasks = body.projectPlan.filter((t) => t.status === "Complete");
    const inProgressTasks = body.projectPlan.filter((t) => t.status === "In Progress");
    const blockedTasks = body.projectPlan.filter((t) => t.status === "Blocked");
    const openRisks = body.raidItems.filter((r) => r.type === "Risk" && r.status !== "Closed");
    const openIssues = body.raidItems.filter((r) => r.type === "Issue" && r.status !== "Closed");
    const openDeps = body.raidItems.filter((r) => r.type === "Dependency" && r.status !== "Closed");
    const completedMilestones = body.milestones.filter((m) => m.status === "Complete");
    const overdueMilestones = body.milestones.filter(
      (m) => m.status !== "Complete" && m.finishDate && new Date(m.finishDate) < new Date()
    );

    const prompt = `You are a program status analyst. Generate a concise status report for the program "${body.programName}".

## Program Data
- Health: ${body.health}
- Phase: ${body.phase}
- Delivery Date: ${body.deliveryDate || "Not set"}
- Total Tasks: ${body.projectPlan.length} (Completed: ${completedTasks.length}, In Progress: ${inProgressTasks.length}, Blocked: ${blockedTasks.length})
- Milestones: ${body.milestones.length} total (Completed: ${completedMilestones.length}, Overdue: ${overdueMilestones.length})
- Open Risks: ${openRisks.length} | Open Issues: ${openIssues.length} | Open Dependencies: ${openDeps.length}

### In Progress Tasks
${inProgressTasks.map((t) => `- ${t.task}${t.assignee ? ` (${t.assignee})` : ""}`).join("\n") || "None"}

### Blocked Tasks
${blockedTasks.map((t) => `- ${t.task}${t.notes ? `: ${t.notes}` : ""}`).join("\n") || "None"}

### Completed Tasks
${completedTasks.slice(0, 5).map((t) => `- ${t.task}`).join("\n") || "None"}

### Overdue Milestones
${overdueMilestones.map((m) => `- ${m.name} (due: ${m.finishDate})`).join("\n") || "None"}

### Open Risks
${openRisks.map((r) => `- ${r.summary}${r.nextSteps ? ` | Mitigation: ${r.nextSteps}` : ""}`).join("\n") || "None"}

### Open Issues
${openIssues.map((r) => `- ${r.summary}${r.nextSteps ? ` | Action: ${r.nextSteps}` : ""}`).join("\n") || "None"}

### Dependencies
${openDeps.map((r) => `- ${r.summary}`).join("\n") || "None"}

${body.latestSummary ? `### Latest Executive Summary\n${body.latestSummary}` : ""}

## Instructions
Respond ONLY in this exact format. Every content line MUST start with "- ". No plain paragraphs allowed.

**Overall Status**
- [one bullet summarizing current program health and progress]
- [one bullet on trajectory or momentum]

**Key Accomplishments**
- [accomplishment 1]
- [accomplishment 2]

**Current Focus & Next Steps**
- [focus area or next step 1]
- [focus area or next step 2]

**Risks & Issues**
- [risk or issue 1]
- [risk or issue 2]

**Recommendations**
- [action verb + recommendation 1]
- [action verb + recommendation 2]

CRITICAL FORMAT RULES:
1. Section headings must be wrapped in ** on both sides
2. EVERY line of content MUST begin with "- " (dash space). No exceptions. No plain text paragraphs.
3. Keep each bullet to 1-2 sentences
4. Write in plain, direct English
5. Reference actual task names, milestone names, and data from above`;

    let message;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        });
        break;
      } catch (err) {
        if (attempt === 2) throw err;
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }

    const textContent = message!.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Post-process: ensure every non-heading, non-empty line starts with "- "
    const enforced = textContent.text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        if (/^\*\*.+\*\*$/.test(trimmed)) return trimmed;
        if (!trimmed.startsWith("- ")) return `- ${trimmed}`;
        return trimmed;
      })
      .join("\n");

    return NextResponse.json({ report: enforced });
  } catch (error) {
    console.error("Program report error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate report" },
      { status: 500 }
    );
  }
}
