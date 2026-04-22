import { Sparkles } from "lucide-react";

export function DraftingSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
          <Sparkles className="h-4 w-4 text-background" />
          <span className="absolute -inset-0.5 rounded-lg border border-foreground/20 animate-ping opacity-40" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">
            Structuring notes to IIA standards
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Applying the 5-C framework — Condition, Criteria, Cause, Effect, Recommendation.
          </p>
        </div>
      </div>

      {/* Shimmering lines grouped by section */}
      <div className="mt-6 space-y-5">
        {["Condition", "Criteria", "Cause", "Effect", "Recommendation"].map(
          (label, i) => (
            <div
              key={label}
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 rounded-md shimmer" />
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded-md shimmer" />
                <div className="h-2.5 w-[92%] rounded-md shimmer" />
                <div className="h-2.5 w-[78%] rounded-md shimmer" />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
