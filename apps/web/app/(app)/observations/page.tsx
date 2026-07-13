import { requireSession } from "@/lib/session";
import { ButtonLink, PageHeader } from "@/components/ui";
import { LocalObservationsTimeline } from "@/components/local-observations";

export default async function ObservationsPage() {
  const session = await requireSession();
  const recipientName = session.recipient?.preferredName ?? "your person";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Observations"
          eyebrow="Pattern tracker"
          icon="activity"
          lede={`What the family has noticed about ${recipientName} — factual, dated, and in your own words. Patterns matter more than any single day.`}
        />
        <ButtonLink href="/observations/new" icon="plus">
          New observation
        </ButtonLink>
      </div>
      <LocalObservationsTimeline recipientName={recipientName} />
    </div>
  );
}
