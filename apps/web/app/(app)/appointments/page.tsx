import { requireSession } from "@/lib/session";
import { Card, Chip, Empty, IconBadge, PageHeader, SectionTitle } from "@/components/ui";
import { fmtDateTime } from "@/lib/labels";
import { getAppointmentsData, usingFixtureData } from "@/lib/data";
import { AppointmentPrep } from "@/components/appointment-prep";

export default async function AppointmentsPage() {
  const session = await requireSession();
  const { upcoming, past } = await getAppointmentsData(session);
  const fixtureMode = usingFixtureData();

  return (
    <div>
      <PageHeader
        title="Appointments"
        eyebrow="Visit prep"
        icon="calendar"
        lede="Keep visits organized: who, when, and the questions you don't want to forget to ask."
      />
      <SectionTitle icon="calendar">Upcoming</SectionTitle>
      <div className="space-y-4">
        {upcoming.length ? (
          upcoming.map((a) => (
            <Card key={a.id} tint>
              <div className="flex items-start gap-3">
                <IconBadge icon="calendar" tone="teal" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-xl font-semibold">
                      {a.clinicianName ?? "Appointment"}
                      {a.specialty ? <span className="text-mist"> · {a.specialty}</span> : null}
                    </p>
                    <span className="flex items-center gap-2">
                      {fixtureMode ? <Chip>Demo appointment</Chip> : null}
                      <p className="font-bold">{fmtDateTime(a.startsAt)}</p>
                    </span>
                  </div>
                  <p className="text-mist">
                    {a.location}
                    {a.purpose ? ` — ${a.purpose}` : ""}
                  </p>
                  <AppointmentPrep appointmentId={a.id} />
                </div>
              </div>
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
              <li key={a.id} className="rounded-lg border border-line bg-card/95 p-4 shadow-[0_14px_45px_rgba(27,42,65,0.05)]">
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
