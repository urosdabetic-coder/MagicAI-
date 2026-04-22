import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Audit Planning Assistant — suggests objectives, a risk rating, and an audit
 * code from a free-form scope description.
 *
 * Falls back to a heuristic mock when ANTHROPIC_API_KEY is missing so the
 * UI still works locally.
 */

const SYSTEM_PROMPT = `You are an expert internal audit planner trained on the IIA
International Professional Practices Framework (IPPF).

Given a free-form audit scope description plus optional domain/title context,
you produce:

1. 3 to 5 concrete, measurable AUDIT OBJECTIVES. Each objective should start
   with an action verb (Evaluate, Test, Assess, Verify, Confirm …) and be one
   sentence long.

2. An overall INHERENT RISK rating: "low" | "medium" | "high" | "critical",
   based on financial materiality, regulatory exposure, and process complexity
   implied by the scope.

3. A short AUDIT CODE (6–10 characters, uppercase letters + hyphen + digits),
   e.g. "FIN-Q4-26" or "ITS-26-03". If the caller already supplied a code,
   you can still emit one and they will ignore yours.

Respond ONLY with a valid JSON object in this exact shape — no prose, no markdown:
{
  "objectives": ["...", "...", "..."],
  "suggestedRisk": "low" | "medium" | "high" | "critical",
  "suggestedCode": "XXX-YY-NN"
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const scope: string = body?.scope ?? "";
    const title: string = body?.title ?? "";
    const domain: string = body?.domain ?? "";

    if (!scope || scope.trim().length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide at least a short scope description.",
        },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: true,
        ...mockPlan(scope, domain),
        meta: { model: "mock" },
      });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Title: ${title || "(not provided)"}
Domain: ${domain || "(not provided)"}

Scope:
${scope}

Produce the planning JSON.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    const jsonText = textBlock.text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    const parsed = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      objectives: Array.isArray(parsed.objectives) ? parsed.objectives : [],
      suggestedRisk: parsed.suggestedRisk ?? "medium",
      suggestedCode: parsed.suggestedCode ?? undefined,
      meta: {
        model: response.model,
        tokensIn: response.usage.input_tokens,
        tokensOut: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("Audit planning error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Audit planning failed: ${message}` },
      { status: 500 }
    );
  }
}

function mockPlan(scope: string, domain: string) {
  const scopeLower = scope.toLowerCase();

  let risk: "low" | "medium" | "high" | "critical" = "medium";
  if (/critical|fraud|material|privileged|regulatory|sox|gdpr/.test(scopeLower)) {
    risk = "high";
  }
  if (/cyber|breach|fraud investigation/.test(scopeLower)) {
    risk = "critical";
  }

  const objectives = [
    `Evaluate the design and operating effectiveness of the key controls in scope.`,
    `Test a representative sample of transactions to confirm compliance with applicable policies.`,
    `Assess segregation of duties across the end-to-end process.`,
    `Verify that remediation of prior findings has been effectively implemented.`,
  ];

  const domainPrefix = (domain || "GEN").slice(0, 3).toUpperCase();
  const suggestedCode = `${domainPrefix}-26-99`;

  return { objectives, suggestedRisk: risk, suggestedCode };
}
