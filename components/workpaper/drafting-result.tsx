import { Sparkles, Check, RotateCcw } from "lucide-react";
import type { DraftedFinding } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DraftingResultProps {
  finding: DraftedFinding;
  onRegenerate?: () => void;
  onAccept?: () => void;
}

const sections: Array<{
  key: keyof Pick<DraftedFinding, "condition" | "criteria" | "cause" | "effect" | "recommendation">;
  label: string;
  description: string;
}> = [
  { key: "condition", label: "Condition", description: "What is" },
  { key: "criteria", label: "Criteria", description: "What should be" },
  { key: "cause", label: "Cause", description: "Why the gap exists" },
  { key: "effect", label: "Effect", description: "Why it matters" },
  { key: "recommendation", label: "Recommendation", description: "What to do" },
];

export function DraftingResult({
  finding,
  onRegenerate,
  onAccept,
}: DraftingResultProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              AI draft ready for review
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Structured to IIA 5-C framework · Generated just now
            </p>
          </div>
        </div>
        <Badge variant="warning" className="capitalize">
          {finding.risk} risk
        </Badge>
      </div>

      {/* Sections */}
      <div className="divide-y divide-border/60">
        {sections.map((section, idx) => (
          <div
            key={section.key}
            className="px-6 py-5 animate-fade-in"
            style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "backwards" }}
          >
            <div className="flex items-baseline gap-3">
              <div className="flex items-baseline gap-2 min-w-[140px]">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground tabular-nums">
                  0{idx + 1}
                </span>
                <h4 className="text-sm font-semibold tracking-tight">
                  {section.label}
                </h4>
              </div>
              <span className="text-[11px] text-muted-foreground italic">
                {section.description}
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">
              {finding[section.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-6 py-3.5">
        <p className="text-[11px] text-muted-foreground">
          Always review AI output. You are responsible for the final finding.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className="gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Regenerate
          </Button>
          <Button size="sm" onClick={onAccept} className="gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Accept draft
          </Button>
        </div>
      </div>
    </div>
  );
}
