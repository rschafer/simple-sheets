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
Write a concise executive portfolio report (300 words max) with these sections:

**Portfolio Health Summary** - Overall status in 2-3 sentences

**Key Highlights** - Top 2-3 positive developments (bullet points)

**Areas of Concern** - Top 2-3 risks or issues requiring attention (bullet points)

**Recommendations** - 2-3 actionable next steps for leadership (bullet points)

Write in a professional, direct tone. Be specific - reference actual program names and data. Do not use generic filler.`;

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
