import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface ProjectPlanItem {
  task: string;
  status: string;
  assignee: string;
  startDate: string;
  endDate: string;
  notes: string;
}

interface RaidItem {
  type: string;
  summary: string;
  status: string;
  nextSteps: string;
  assignedTo: string;
}

interface Milestone {
  name: string;
  status: string;
  startDate: string;
  finishDate: string;
}

interface GenerateRequest {
  projectName: string;
  projectPlan: ProjectPlanItem[];
  raidItems: RaidItem[];
  milestones: Milestone[];
  startDate: string;
  endDate: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { projectName, projectPlan, raidItems, milestones, startDate, endDate } = body;

    // Build context for the AI
    const completedTasks = projectPlan.filter(p => p.status === "Complete");
    const inProgressTasks = projectPlan.filter(p => p.status === "In Progress");
    const blockedTasks = projectPlan.filter(p => p.status === "Blocked");
    const upcomingTasks = projectPlan.filter(p => p.status === "Not Started");

    const openRisks = raidItems.filter(r => r.type === "Risk" && r.status !== "Closed");
    const openIssues = raidItems.filter(r => r.type === "Issue" && r.status !== "Closed");
    const dependencies = raidItems.filter(r => r.type === "Dependency" && r.status !== "Closed");

    const completedMilestones = milestones.filter(m => m.status === "Complete");
    const inProgressMilestones = milestones.filter(m => m.status === "In Progress");

    const prompt = `You are a project management assistant helping write an executive summary for "${projectName}".

Based on the following project data from ${startDate} to ${endDate}, generate a concise executive summary.

## Project Data

### Completed Tasks (${completedTasks.length})
${completedTasks.map(t => `- ${t.task}${t.assignee ? ` (${t.assignee})` : ""}`).join("\n") || "None"}

### In Progress Tasks (${inProgressTasks.length})
${inProgressTasks.map(t => `- ${t.task}${t.assignee ? ` (${t.assignee})` : ""}`).join("\n") || "None"}

### Blocked Tasks (${blockedTasks.length})
${blockedTasks.map(t => `- ${t.task}${t.notes ? `: ${t.notes}` : ""}`).join("\n") || "None"}

### Upcoming Tasks (${upcomingTasks.length})
${upcomingTasks.slice(0, 5).map(t => `- ${t.task}`).join("\n") || "None"}

### Milestones
Completed: ${completedMilestones.map(m => m.name).join(", ") || "None"}
In Progress: ${inProgressMilestones.map(m => m.name).join(", ") || "None"}

### Open Risks (${openRisks.length})
${openRisks.map(r => `- ${r.summary}${r.nextSteps ? ` | Mitigation: ${r.nextSteps}` : ""}`).join("\n") || "None"}

### Open Issues (${openIssues.length})
${openIssues.map(r => `- ${r.summary}${r.nextSteps ? ` | Action: ${r.nextSteps}` : ""}`).join("\n") || "None"}

### Dependencies (${dependencies.length})
${dependencies.map(r => `- ${r.summary}`).join("\n") || "None"}

## Instructions

Generate an executive summary with these 4 sections. Each section should be 2-3 sentences max, written in professional but concise language:

1. **Recent Progress**: Highlight key accomplishments and completed work
2. **Next Steps**: What's coming up and current focus areas
3. **Risks and Mitigation**: Key risks/issues and how they're being addressed
4. **Impact to Other Programs**: Any dependencies or impacts on other teams

Respond in JSON format:
{
  "recentProgress": "...",
  "nextSteps": "...",
  "risksAndMitigation": "...",
  "impactToOtherPrograms": "..."
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        { role: "user", content: prompt }
      ],
    });

    // Extract the text content
    const textContent = message.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const summary = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate summary" },
      { status: 500 }
    );
  }
}
