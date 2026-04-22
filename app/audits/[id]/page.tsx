import { AuditDetailView } from "@/components/audit/audit-detail-view";

interface PageProps {
  params: { id: string };
}

export default function AuditDetailPage({ params }: PageProps) {
  // The store lives on the client, so we delegate rendering to a client
  // component. The param is passed through and the store decides whether
  // the audit exists.
  return <AuditDetailView auditId={params.id} />;
}
