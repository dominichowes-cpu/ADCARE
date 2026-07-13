import { requireSession } from "@/lib/session";
import {
  ButtonLink,
  Card,
  CareMapVisual,
  Chip,
  Empty,
  IconBadge,
  IllustrationStrip,
  SectionTitle,
  StatPill,
  TextLink,
} from "@/components/ui";
import { LocalObservationStatPill, LocalRecentObservations } from "@/components/local-observations";
import { fmtDate, fmtDateTime, titleize } from "@/lib/labels";
import { getDashboardData } from "@/lib/data";

export default async function Dashboard() {
  const session = await requireSession();
  const { nextAppt, openTasks, update } = await getDashboardData(session);

  const first = session.user.displayName.split(" ")[0];
  const who = session.recipient?.preferredName ?? "your family";

  return (
    <div>
      <section className="mb-8 overflow-hidden rounded-lg bg-ink-deep text-paper shadow-[0_24px_80px_rgba(17,27,44,0.22)]">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="flex flex-col justify-between gap-7">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/10 px-3 py-1 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-gold-soft">
                <span className="size-2 rounded-full bg-gold" />
                Today&apos;s care picture
              </div>
              <h1 className="max-w-2xl font-display text-[2.4rem] font-semibold leading-none sm:text-[3rem]">
                Welcome back, {first}
              </h1>
              <p className="mt-4 max-w-2xl text-paper/68">
                Here is where things stand for {who} today: visits, notes, tasks, and the details
                that help the family arrive prepared.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/observations/new" icon="plus" variant="secondary">
                  Record observation
                </ButtonLink>
                <ButtonLink href="/appointments" icon="calendar" variant="inverted">
                  Review appointments
                </ButtonLink>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatPill label="Open tasks" value={openTasks.length} />
              <LocalObservationStatPill />
              <StatPill label="Next visit" value={nextAppt ? fmtDate(nextAppt.startsAt) : "None"} />
            </div>
          </div>
          <CareMapVisual />
        </div>
      </section>
      <div className="grid gap-5 md:grid-cols-2">
        <Card tint>
          <IllustrationStrip variant="visit" />
          <div className="mb-4 flex items-start gap-3">
            <IconBadge icon="calendar" tone="teal" />
            <div>
              <SectionTitle>Next appointment</SectionTitle>
              <p className="text-[0.9rem] text-mist">The next visit to prepare for.</p>
            </div>
          </div>
          {nextAppt ? (
            <div>
              <p className="font-display text-xl font-semibold">{nextAppt.clinicianName ?? "Appointment"}</p>
              <p className="text-mist">
                {nextAppt.specialty} · {nextAppt.location}
              </p>
              <p className="mt-2 font-bold">{fmtDateTime(nextAppt.startsAt)}</p>
              <TextLink href="/appointments" icon="chevronRight">
                Prepare for this visit
              </TextLink>
            </div>
          ) : (
            <Empty>No upcoming appointments yet.</Empty>
          )}
        </Card>
        <Card>
          <IllustrationStrip variant="tasks" />
          <div className="mb-4 flex items-start gap-3">
            <IconBadge icon="clipboard" tone="gold" />
            <div>
              <SectionTitle>Open tasks</SectionTitle>
              <p className="text-[0.9rem] text-mist">Loose ends that need a person.</p>
            </div>
          </div>
          {openTasks.length ? (
            <ul className="space-y-2">
              {openTasks.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-3 rounded-lg border border-line/70 bg-paper/55 px-3 py-2">
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
          <IllustrationStrip variant="observations" />
          <div className="flex items-baseline justify-between">
            <SectionTitle icon="activity">Recent observations</SectionTitle>
            <TextLink href="/observations/new" icon="plus">
              Record one
            </TextLink>
          </div>
          <LocalRecentObservations />
        </Card>
        <Card>
          <IllustrationStrip variant="family" />
          <div className="mb-4 flex items-start gap-3">
            <IconBadge icon="heart" tone="clay" />
            <div>
              <SectionTitle>Latest family update</SectionTitle>
              <p className="text-[0.9rem] text-mist">The last shared note from the household.</p>
            </div>
          </div>
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
