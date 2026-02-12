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
Respond ONLY in this exact format. Every content line MUST start with "- ". No plain paragraphs allowed.

**Portfolio Health Summary**
- [one bullet summarizing overall health]
- [one bullet on the biggest change or trend]

**Key Highlights**
- [positive development 1]
- [positive development 2]
- [positive development 3]

**Areas of Concern**
- [risk or issue 1]
- [risk or issue 2]

**Recommended Actions**
- [action verb + next step 1]
- [action verb + next step 2]

CRITICAL FORMAT RULES:
1. Section headings must be wrapped in ** on both sides
2. EVERY line of content MUST begin with "- " (dash space). No exceptions. No plain text paragraphs.
3. Keep each bullet to 1-2 sentences
4. Write in plain, direct English
5. Reference actual program names and numbers from the data above`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Post-process: ensure every non-heading, non-empty line starts with "- "
    const enforced = textContent.text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        // Keep heading lines as-is (lines that are just **bold**)
        if (/^\*\*.+\*\*$/.test(trimmed)) return trimmed;
        // Ensure content lines start with "- "
        if (!trimmed.startsWith("- ")) return `- ${trimmed}`;
        return trimmed;
      })
      .join("\n");

    return NextResponse.json({ report: enforced });
  } catch (error) {
    console.error("Portfolio report error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate report" },
      { status: 500 }
    );
  }
}
