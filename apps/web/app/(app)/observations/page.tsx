import Link from "next/link";
import { requireSession } from "@/lib/session";
import { Chip, Empty, PageHeader } from "@/components/ui";
import { fmtDateTime, observationCategoryLabels } from "@/lib/labels";
import { getObservationsData } from "@/lib/data";

export default async function ObservationsPage() {
  const session = await requireSession();
  const { rows, contextsByObservation } = await getObservationsData(session);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Observations"
          lede={`What the family has noticed about ${session.recipient?.preferredName ?? "your person"} — factual, dated, and in your own words. Patterns matter more than any single day.`}
        />
        <Link
          href="/observations/new"
          className="rounded-lg bg-teal px-5 py-2.5 font-bold text-paper hover:bg-teal-deep"
        >
          New observation
        </Link>
      </div>
      {rows.length ? (
        <ol className="relative ml-3 space-y-6 border-l-2 border-sage pl-6">
          {rows.map((o) => {
            const positive = o.category === "positive_stable";
            return (
              <li key={o.id} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full ${positive ? "bg-teal" : "bg-clay"}`}
                />
                <div className={`rounded-xl border border-line p-4 ${positive ? "bg-sage-soft" : "bg-card"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone={positive ? "sage" : "neutral"}>
                      {observationCategoryLabels[o.category] ?? o.category}
                    </Chip>
                    {o.isRecurring ? <Chip tone="amber">Recurring</Chip> : null}
                    {o.includeInBrief ? <Chip tone="teal">In clinician brief</Chip> : null}
                  </div>
                  <p className="mt-2">{o.description}</p>
                  {o.functionalImpact ? (
                    <p className="mt-1 text-[0.9rem] text-mist">Impact: {o.functionalImpact}</p>
                  ) : null}
                  {contextsByObservation.get(o.id)?.length ? (
                    <p className="mt-1 text-[0.9rem] text-mist">
                      Context: {contextsByObservation.get(o.id)!.join(", ")}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[0.85rem] text-mist">
                    {fmtDateTime(o.observedAt)}
                    {o.observer ? ` · noticed by ${o.observer}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <Empty>
          Nothing recorded yet. When you notice something — concerning or reassuring —
          write it down here while it is fresh.
        </Empty>
      )}
    </div>
  );
}
