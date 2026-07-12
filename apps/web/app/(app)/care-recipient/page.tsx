import { requireSession } from "@/lib/session";
import { Card, Empty, PageHeader, SectionTitle } from "@/components/ui";
import { getCareRecipientStats } from "@/lib/data";

export default async function CareRecipientPage() {
  const session = await requireSession();
  const r = session.recipient;

  if (!r) {
    return (
      <div>
        <PageHeader title="Care recipient" />
        <Empty>No care recipient has been added to this household yet.</Empty>
      </div>
    );
  }

  const counts = await getCareRecipientStats(session);

  const stats = [
    { label: "Observations recorded", value: counts.observations },
    { label: "Active medications", value: counts.medications },
    { label: "Documents in the vault", value: counts.documents },
    { label: "Upcoming appointments", value: counts.appointments },
    { label: "Open tasks", value: counts.openTasks },
  ];

  return (
    <div>
      <PageHeader
        title={r.preferredName}
        lede="This profile stays deliberately small: only what the family needs to coordinate care. Nothing here is shared without an explicit, expiring link."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Card tint>
          <SectionTitle>About</SectionTitle>
          <dl className="space-y-2">
            <div className="flex justify-between"><dt className="text-mist">Preferred name</dt><dd>{r.preferredName}</dd></div>
            <div className="flex justify-between"><dt className="text-mist">Birth year</dt><dd>{r.birthYear ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-mist">General location</dt><dd>{r.generalLocation ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-mist">Pronouns</dt><dd>{r.pronouns ?? "—"}</dd></div>
          </dl>
        </Card>
        <Card>
          <SectionTitle>At a glance</SectionTitle>
          <ul className="space-y-2">
            {stats.map((s) => (
              <li key={s.label} className="flex items-baseline justify-between">
                <span className="text-mist">{s.label}</span>
                <span className="font-display text-xl">{s.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
