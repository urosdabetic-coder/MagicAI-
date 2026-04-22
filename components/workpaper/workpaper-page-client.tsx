"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuditStore } from "@/lib/store";
import { WorkpaperView } from "./workpaper-view";

export function WorkpaperPageClient({ workpaperId }: { workpaperId: string }) {
  const workpaper = useAuditStore((s) => s.workpapers.find((w) => w.id === workpaperId));

  if (!workpaper) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Workpaper <span className="font-mono">{workpaperId}</span> not found.
          </p>
        </div>
      </div>
    );
  }

  return <WorkpaperView workpaper={workpaper} />;
}
