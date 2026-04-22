import { Plus, SlidersHorizontal } from "lucide-react";
import { audits } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "@/components/dashboard/kanban-column";
import { StatsRow } from "@/components/dashboard/stats-row";

export default function DashboardPage() {
  const planning = audits.filter((a) => a.status === "planning");
  const fieldwork = audits.filter((a) => a.status === "fieldwork");
  const review = audits.filter((a) => a.status === "review");
  const reporting = audits.filter((a) => a.status === "reporting");
  const closed = audits.filter((a) => a.status === "closed");

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      {/* Page header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>Audit Universe</span>
            <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50" />
            <span>FY 2026</span>
          </div>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">
            Good afternoon, Sarah.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            You have <span className="font-medium text-foreground">3 workpapers</span> awaiting your
            review and <span className="font-medium text-foreground">2 audits</span> approaching
            their deadline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter</span>
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>New audit</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-10">
        <StatsRow audits={audits} />
      </div>

      {/* Section divider */}
      <div className="mt-12 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Active engagements
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Drag to reprioritize. Click any audit to open its workpapers.
          </p>
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-6 -mx-6 px-6 lg:-mx-10 lg:px-10">
        <div className="flex gap-5 min-w-max">
          <KanbanColumn
            title="Planning"
            status="planning"
            audits={planning}
            accentClass="bg-blue-500"
          />
          <KanbanColumn
            title="Fieldwork"
            status="fieldwork"
            audits={fieldwork}
            accentClass="bg-amber-500"
          />
          <KanbanColumn
            title="In Review"
            status="review"
            audits={review}
            accentClass="bg-violet-500"
          />
          <KanbanColumn
            title="Reporting"
            status="reporting"
            audits={reporting}
            accentClass="bg-emerald-500"
          />
          <KanbanColumn
            title="Closed"
            status="closed"
            audits={closed}
            accentClass="bg-zinc-400"
          />
        </div>
      </div>
    </div>
  );
}
