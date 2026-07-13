import { requireSession } from "@/lib/session";
import { Card, Chip, Empty, SectionTitle, PageHeader } from "@/components/ui";
import { fmtDate, fmtDateTime, observationCategoryLabels, titleize } from "@/lib/labels";
import Link from "next/link";
import { getDashboardData } from "@/lib/data";

export default async function Dashboard() {
  const session = await requireSession();
  const { nextAppt, openTasks, recentObs, update } = await getDashboardData(session);

  const first = session.user.displayName.split(" ")[0];
  const who = session.recipient?.preferredName ?? "your family";

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${first}`}
        lede={`Here is where things stand for ${who} today.`}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Card tint>
          <SectionTitle>Next appointment</SectionTitle>
          {nextAppt ? (
            <div>
              <p className="font-display text-xl">{nextAppt.clinicianName ?? "Appointment"}</p>
              <p className="text-mist">
                {nextAppt.specialty} · {nextAppt.location}
              </p>
              <p className="mt-2 font-bold">{fmtDateTime(nextAppt.startsAt)}</p>
              <Link href="/appointments" className="mt-3 inline-block text-teal-deep underline underline-offset-4">
                Prepare for this visit
              </Link>
            </div>
          ) : (
            <Empty>No upcoming appointments yet.</Empty>
          )}
        </Card>
        <Card>
          <SectionTitle>Open tasks</SectionTitle>
          {openTasks.length ? (
            <ul className="space-y-2">
              {openTasks.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-3">
                  <span>{t.title}</span>
                  <Chip tone={t.priority === "high" ? "amber" : "neutral"}>
                    {t.dueOn ? fmtDate(t.dueOn) : titleize(t.priority)}
                  </Chip>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing on the list. Add a task when something comes up.</Empty>
          )}
        </Card>
        <Card>
          <div className="flex items-baseline justify-between">
            <SectionTitle>Recent observations</SectionTitle>
            <Link href="/observations/new" className="text-[0.9rem] text-teal-deep underline underline-offset-4">
              Record one
            </Link>
          </div>
          {recentObs.length ? (
            <ul className="space-y-3">
              {recentObs.map((o) => (
                <li key={o.id}>
                  <Chip tone={o.category === "positive_stable" ? "sage" : "neutral"}>
                    {observationCategoryLabels[o.category] ?? o.category}
                  </Chip>
                  <p className="mt-1">{o.description}</p>
                  <p className="text-[0.85rem] text-mist">{fmtDate(o.observedAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No observations recorded yet.</Empty>
          )}
        </Card>
        <Card>
          <SectionTitle>Latest family update</SectionTitle>
          {update ? (
            <div>
              {update.title ? <p className="font-bold">{update.title}</p> : null}
              <p className="mt-1">{update.body}</p>
              <p className="mt-2 text-[0.85rem] text-mist">
                {update.author} · {fmtDate(update.createdAt)}
              </p>
            </div>
          ) : (
            <Empty>No updates posted yet.</Empty>
          )}
        </Card>
      </div>
    </div>
  );
}
