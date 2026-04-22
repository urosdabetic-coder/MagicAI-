import { WorkpaperPageClient } from "@/components/workpaper/workpaper-page-client";

interface PageProps {
  params: { id: string };
}

export default function WorkpaperPage({ params }: PageProps) {
  return <WorkpaperPageClient workpaperId={params.id} />;
}
