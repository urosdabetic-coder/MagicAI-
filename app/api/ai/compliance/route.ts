import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ComplianceInsight } from "@/types";

/**
 * AI Compliance Checker — powered by Claude Sonnet 4.6.
 *
 * Reviews a workpaper (notes + drafted finding) against IIA standards
 * and general audit methodology, returning a list of actionable insights.
 *
 * Falls back to a mocked response if ANTHROPIC_API_KEY is not set.
 */

const SYSTEM_PROMPT = `You are a senior internal audit quality reviewer with deep expertise
in the IIA International Professional Practices Framework (IPPF), audit
documentation standards, and common audit methodology failures.

Given a workpaper (the fieldwork notes and optionally a drafted finding),
evaluate the workpaper against these dimensions and produce a list of 3-7
actionable insights:

- Methodology: sampling, testing approach, and documented rationale
- Evidence: cross-references to supporting documents and audit trail
- Root cause analysis: systemic vs symptomatic, multi-factor analysis
- Recommendation: SMART criteria (specific, measurable, achievable, relevant, time-bound)
- Writing quality: clarity, quantification, and audit tone
- Standards alignment: alignment with IIA Standards (2300 series especially)

Each insight must have a severity: "success" (control/documentation operating well),
"warning" (minor gap worth addressing), "error" (significant gap that must be
fixed before sign-off), or "info" (suggestion for improvement).

Respond ONLY with valid JSON in this exact shape — no prose, no markdown:
{
  "insights": [
    {
      "id": "short-slug",
      "severity": "success" | "warning" | "error" | "info",
      "category": "string — one of: Methodology, Evidence, Root cause analysis, Recommendation, Writing quality, Standards",
      "title": "string — one-line headline, max 10 words",
      "description": "string — 1-3 sentence explanation, actionable",
      "reference": "string — IIA standard or methodology reference, optional"
    }
  ]
}

Provide a balanced set: include at least one "success" if anything is done well,
and at least one "error" or "warning" unless the workpaper is truly flawless.`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const workpaperContent: string = body?.workpaperContent ?? "";

    // If no API key is configured, return the mocked response.
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: true,
        insights: mockInsights(),
        summary: summarize(mockInsights()),
        meta: { model: "mock", note: "Set ANTHROPIC_API_KEY in .env.local to enable real AI." },
      });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userContent = workpaperContent.trim().length > 0
      ? `Here is the workpaper content to review:\n\n${workpaperContent}`
      : `Review this privileged-access workpaper:

OBJECTIVE: Evaluate whether privileged access to production systems is granted, monitored, and revoked in accordance with policy ITS-POL-004.

SCOPE: All Tier-1 production systems for the period 01-Jan-2026 to 31-Mar-2026. Population: 142 privileged accounts.

NOTES:
Walkthrough with Platform Security team on 14-Apr-2026.
Tested a sample of 25 privileged account grants from a population of 142. Selected using random sampling.
Findings: 3 of 25 accounts lacked documented business justification in ServiceNow ticket. 1 account belonged to a terminated employee. Quarterly access recertification evidence was inconsistent across the 4 system owners.
Policy requires documented justification, removal within 24h of termination, and quarterly recertification signed by system owner.
Root cause: off-boarding workflow relies on manual HR notification. No automated trigger from HRIS to IAM.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    const jsonText = textBlock.text.trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsed = JSON.parse(jsonText);
    const insights: ComplianceInsight[] = Array.isArray(parsed.insights)
      ? parsed.insights.map((i: any, idx: number) => ({
          id: i.id ?? `c-${idx}`,
          severity: i.severity ?? "info",
          category: i.category ?? "General",
          title: i.title ?? "",
          description: i.description ?? "",
          reference: i.reference,
        }))
      : [];

    return NextResponse.json({
      success: true,
      insights,
      summary: summarize(insights),
      meta: {
        model: response.model,
        tokensIn: response.usage.input_tokens,
        tokensOut: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("Compliance error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to run compliance check: ${message}` },
      { status: 500 }
    );
  }
}

function summarize(insights: ComplianceInsight[]) {
  return {
    total: insights.length,
    success: insights.filter((i) => i.severity === "success").length,
    warnings: insights.filter((i) => i.severity === "warning").length,
    errors: insights.filter((i) => i.severity === "error").length,
    info: insights.filter((i) => i.severity === "info").length,
  };
}

function mockInsights(): ComplianceInsight[] {
  return [
    { id: "c-001", severity: "warning", category: "Methodology", title: "Sample size rationale is not documented", description: "The workpaper references a sample of 25 from a population of 142 but does not disclose confidence level or sampling method.", reference: "IIA 2330.A1" },
    { id: "c-002", severity: "success", category: "Root cause analysis", title: "Root cause follows best practices", description: "The cause section identifies both process and tool-level drivers.", reference: "IIA RCA Practice Guide" },
    { id: "c-003", severity: "error", category: "Evidence", title: "No cross-reference to underlying evidence", description: "Statements about system owners lack references to supporting workpapers.", reference: "Firm Methodology §3.4" },
    { id: "c-004", severity: "info", category: "Writing quality", title: "Consider quantifying the effect", description: "The effect section could be strengthened with a quantitative exposure estimate." },
    { id: "c-005", severity: "success", category: "Recommendation", title: "Recommendation is specific and time-bound", description: "Each sub-recommendation has a clear owner and target date.", reference: "IIA 2410" },
  ];
}
