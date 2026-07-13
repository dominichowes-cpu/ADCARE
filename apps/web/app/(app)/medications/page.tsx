import { requireSession } from "@/lib/session";
import { Card, Chip, Empty, IconBadge, PageHeader, SectionTitle } from "@/components/ui";
import { fmtDate, fmtDateTime, titleize } from "@/lib/labels";
import { getMedicationsData } from "@/lib/data";

export default async function MedicationsPage() {
  const session = await requireSession();
  const { meds, events } = await getMedicationsData(session);

  return (
    <div>
      <PageHeader
        title="Medications"
        eyebrow="Medication list"
        icon="pill"
        lede="A shared record of what is being taken, as the family understands it. This list is for coordination and appointment prep — it is not medical advice, and the clinician's list is the authority."
      />
      <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          {meds.length ? (
            meds.map((m) => (
              <Card key={m.id}>
                <div className="flex items-start gap-3">
                  <IconBadge icon="pill" tone="sage" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-lg">{m.name}</p>
                      <Chip tone="neutral">{m.dosageText ?? "dose not recorded"}</Chip>
                    </div>
                    <p className="text-mist">
                      {m.frequencyText ?? "frequency not recorded"}
                      {m.reason ? ` · for ${m.reason}` : ""}
                    </p>
                    <p className="mt-2 text-[0.85rem] text-mist">
                      {m.prescriber ? `Prescribed by ${m.prescriber} · ` : ""}
                      Source: {m.infoSource ?? "not recorded"} · Last confirmed {fmtDate(m.lastConfirmedOn)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Empty>No medications recorded.</Empty>
          )}
        </div>
        <div>
          <SectionTitle icon="activity">Recent events</SectionTitle>
          {events.length ? (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="rounded-lg border border-line bg-card/95 p-4 shadow-[0_14px_45px_rgba(27,42,65,0.05)]">
                  <Chip tone={e.type === "missed_dose" || e.type === "possible_side_effect" ? "clay" : "neutral"}>
                    {titleize(e.type)}
                  </Chip>
                  <p className="mt-1">{e.medication}</p>
                  {e.note ? <p className="text-[0.9rem] text-mist">{e.note}</p> : null}
                  <p className="mt-1 text-[0.85rem] text-mist">{fmtDateTime(e.occurredAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No medication events logged.</Empty>
          )}
        </div>
      </div>
    </div>
  );
}
