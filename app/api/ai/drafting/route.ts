import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { DraftedFinding } from "@/types";

/**
 * AI Drafting Assistant — powered by Claude Sonnet 4.6.
 *
 * Takes raw auditor notes and returns an IIA 5-C structured finding
 * (Condition, Criteria, Cause, Effect, Recommendation).
 *
 * Falls back to a mocked response if ANTHROPIC_API_KEY is not set,
 * so the UI still works in local development without a key.
 */

const SYSTEM_PROMPT = `You are an expert internal audit assistant specialized in the IIA
International Professional Practices Framework (IPPF).

Given raw auditor notes from fieldwork (interviews, walkthroughs, testing),
you produce a formally structured draft finding following the IIA 5-C framework:

1. CONDITION — What is. Describe the actual situation observed, with specific
   facts, sample sizes, and quantitative detail where available.
2. CRITERIA — What should be. Reference the applicable policy, regulation,
   framework standard (ISO, SOX, IIA Standards), or contractual requirement.
3. CAUSE — Why the gap exists. Identify the systemic, process, or tool-level
   root cause. Do not confuse symptom with cause.
4. EFFECT — Why it matters. Describe risk exposure, including regulatory,
   financial, operational, or reputational impact. Quantify where possible.
5. RECOMMENDATION — What to do. Propose specific, measurable, and time-bound
   remediation actions.

Also assign an overall risk rating: low | medium | high | critical.

Respond ONLY with a valid JSON object in this exact shape — no prose, no markdown:
{
  "condition": "string",
  "criteria": "string",
  "cause": "string",
  "effect": "string",
  "recommendation": "string",
  "risk": "low" | "medium" | "high" | "critical"
}

Keep each section between 2 and 5 sentences. Use formal audit language.
If the notes are too thin, still produce your best interpretation and note
uncertainty in the CAUSE section.`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawNotes: string = body?.rawNotes ?? "";

    if (!rawNotes || rawNotes.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: "Please provide at least a few sentences of notes before generating a draft." },
        { status: 400 }
      );
    }

    // If no API key is configured, return a mock so the UI still works in dev.
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: true,
        finding: mockFinding(rawNotes),
        meta: { model: "mock", note: "Set ANTHROPIC_API_KEY in .env.local to enable real AI." },
      });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here are the raw fieldwork notes. Produce the structured finding JSON:\n\n${rawNotes}`,
        },
      ],
    });

    // Extract the JSON from the response
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

    const finding: DraftedFinding = {
      condition: parsed.condition ?? "",
      criteria: parsed.criteria ?? "",
      cause: parsed.cause ?? "",
      effect: parsed.effect ?? "",
      recommendation: parsed.recommendation ?? "",
      risk: parsed.risk ?? "medium",
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      finding,
      meta: {
        model: response.model,
        framework: "IIA 5-C",
        tokensIn: response.usage.input_tokens,
        tokensOut: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("Drafting error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to generate draft finding: ${message}` },
      { status: 500 }
    );
  }
}

// Fallback mock used only when ANTHROPIC_API_KEY is missing.
function mockFinding(rawNotes: string): DraftedFinding {
  const mentionsTermination = /terminat/i.test(rawNotes);
  return {
    condition: mentionsTermination
      ? "Testing of 25 privileged access grants (out of a population of 142) identified that 3 accounts lacked documented business justification, and 1 account remained active after the employee's termination date."
      : "Testing identified multiple instances where the designed control was not operating as intended during the review period.",
    criteria:
      "Applicable policy requires documented justification for all grants, removal within 24 hours of termination, and signed quarterly recertification by the system owner.",
    cause:
      "The off-boarding workflow depends on manual HR notification with no automated trigger. Templates do not enforce a mandatory justification field.",
    effect:
      "Unauthorized privileged access increases the risk of data exfiltration, unauthorized transactions, and regulatory non-compliance.",
    recommendation:
      "Integrate HRIS with the IAM platform, enforce a mandatory justification field, and implement a centralized recertification dashboard. Target implementation: Q3 2026.",
    risk: "high",
    generatedAt: new Date().toISOString(),
  };
}
