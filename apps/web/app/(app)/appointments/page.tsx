import { requireSession } from "@/lib/session";
import { Card, Chip, Empty, PageHeader, SectionTitle } from "@/components/ui";
import { fmtDateTime } from "@/lib/labels";
import { getAppointmentsData } from "@/lib/data";

export default async function AppointmentsPage() {
  const session = await requireSession();
  const { upcoming, past, questionsByAppointment } = await getAppointmentsData(session);

  return (
    <div>
      <PageHeader
        title="Appointments"
        lede="Keep visits organized: who, when, and the questions you don't want to forget to ask."
      />
      <SectionTitle>Upcoming</SectionTitle>
      <div className="space-y-4">
        {upcoming.length ? (
          upcoming.map((a) => (
            <Card key={a.id} tint>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-xl">
                  {a.clinicianName ?? "Appointment"}
                  {a.specialty ? <span className="text-mist"> · {a.specialty}</span> : null}
                </p>
                <p className="font-bold">{fmtDateTime(a.startsAt)}</p>
              </div>
              <p className="text-mist">
                {a.location}
                {a.purpose ? ` — ${a.purpose}` : ""}
              </p>
              {questionsByAppointment.get(a.id)?.length ? (
                <div className="mt-3">
                  <p className="text-[0.85rem] font-bold uppercase tracking-wide text-mist">
                    Questions to ask
                  </p>
                  <ol className="mt-1 list-decimal space-y-1 pl-5">
                    {questionsByAppointment.get(a.id)!.map((q) => (
                      <li key={q.id}>{q.question}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </Card>
          ))
        ) : (
          <Empty>No upcoming appointments.</Empty>
        )}
      </div>
      <div className="mt-8">
        <SectionTitle>Past</SectionTitle>
        {past.length ? (
          <ul className="space-y-3">
            {past.map((a) => (
              <li key={a.id} className="rounded-xl border border-line bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold">
                    {a.clinicianName ?? "Appointment"}
                    {a.specialty ? <span className="font-normal text-mist"> · {a.specialty}</span> : null}
                  </p>
                  <Chip>{fmtDateTime(a.startsAt)}</Chip>
                </div>
                {a.notes ? <p className="mt-1 text-mist">{a.notes}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No past appointments recorded.</Empty>
        )}
      </div>
    </div>
  );
}
