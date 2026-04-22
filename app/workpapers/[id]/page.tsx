import { notFound } from "next/navigation";
import { getWorkpaperById } from "@/lib/mock-data";
import { WorkpaperView } from "@/components/workpaper/workpaper-view";

interface PageProps {
  params: { id: string };
}

export default function WorkpaperPage({ params }: PageProps) {
  // For the MVP, default to wp-001 if the id isn't in our mock set, so that
  // navigation from the dashboard always lands on a valid workpaper.
  const workpaper = getWorkpaperById(params.id) ?? getWorkpaperById("wp-001");

  if (!workpaper) {
    notFound();
  }

  return <WorkpaperView workpaper={workpaper} />;
}
