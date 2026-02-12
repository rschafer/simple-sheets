import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface ProgramSummary {
  name: string;
  productArea: string;
  health: string;
  phase: string;
  deliveryDate: string;
  openRisks: number;
  openIssues: number;
  overdueMilestones: number;
  latestSummary: string;
}

export async function POST(request: NextRequest) {
  try {
    const { programs }: { programs: ProgramSummary[] } = await request.json();

    const totalPrograms = programs.length;
    const onTrack = programs.filter((p) => p.health === "On Track").length;
    const atRisk = programs.filter((p) => p.health === "At Risk").length;
    const offTrack = programs.filter((p) => p.health === "Off Track").length;
    const totalOpenRisks = programs.reduce((s, p) => s + p.openRisks, 0);
    const totalOpenIssues = programs.reduce((s, p) => s + p.openIssues, 0);
    const totalOverdue = programs.reduce((s, p) => s + p.overdueMilestones, 0);

    const programDetails = programs
      .map(
        (p) =>
          `- ${p.name} (${p.productArea}): ${p.health}, Phase: ${p.phase}, Delivery: ${p.deliveryDate}, ` +
          `Open Risks: ${p.openRisks}, Open Issues: ${p.openIssues}, Overdue Milestones: ${p.overdueMilestones}` +
          (p.latestSummary ? `\n  Latest update: ${p.latestSummary}` : "")
      )
      .join("\n");

    const prompt = `You are an executive portfolio analyst. Generate a concise portfolio status report for leadership.

## Portfolio Data
- Total Programs: ${totalPrograms}
- On Track: ${onTrack} | At Risk: ${atRisk} | Off Track: ${offTrack}
- Total Open Risks: ${totalOpenRisks} | Total Open Issues: ${totalOpenIssues}
- Programs with Overdue Milestones: ${totalOverdue}

## Program Details
${programDetails}

## Instructions
Write a concise executive portfolio report (300 words max) in plain English that is easy to scan quickly. Use this exact format:

**Portfolio Health Summary**
- One bullet summarizing overall health (e.g. "X of Y programs are on track...")
- One bullet on the biggest change or trend since last period

**Key Highlights**
- 2-3 bullet points on positive developments. Be specific - name the program and what happened.

**Areas of Concern**
- 2-3 bullet points on risks or issues. Name the program, the problem, and the impact.

**Recommended Actions**
- 2-3 bullet points with concrete next steps for leadership. Each should start with an action verb.

Rules:
- Use **bold** for section headings only
- Use "- " for every bullet point
- Keep each bullet to 1-2 sentences max
- Write in plain, direct English - no jargon or filler
- Reference actual program names and numbers from the data`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    return NextResponse.json({ report: textContent.text });
  } catch (error) {
    console.error("Portfolio report error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate report" },
      { status: 500 }
    );
  }
}
