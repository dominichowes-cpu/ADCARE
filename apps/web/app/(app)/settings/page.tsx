import { requireSession } from "@/lib/session";
import { Card, Chip, PageHeader, SectionTitle } from "@/components/ui";
import { titleize } from "@/lib/labels";
import { getSettingsData } from "@/lib/data";

export default async function SettingsPage() {
  const session = await requireSession();
  const { members, prefs } = await getSettingsData(session);

  return (
    <div>
      <PageHeader
        title="Settings"
        lede="Who is in this care circle, what they can do, and how the research feed is tuned."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <SectionTitle>Care circle</SectionTitle>
          <ul className="space-y-3">
            {members.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{m.name}</p>
                  <p className="text-[0.9rem] text-mist">
                    {String(m.email)}
                    {m.relationship ? ` · ${m.relationship}` : ""}
                  </p>
                </div>
                <Chip tone={m.role === "owner" ? "teal" : "neutral"}>{titleize(m.role)}</Chip>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle>Research feed</SectionTitle>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-mist">Trial search radius</dt>
              <dd>{prefs?.trialRadiusKm ? `${prefs.trialRadiusKm} km` : "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mist">Trial search area</dt>
              <dd>{prefs?.trialCenterPostalCode ?? "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mist">Include preliminary research</dt>
              <dd>{prefs?.includePreliminary ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mist">Include animal studies</dt>
              <dd>{prefs?.includeAnimalStudies ? "Yes" : "No"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.85rem] text-mist">
            Editing these settings arrives with the settings write layer in a later slice.
          </p>
        </Card>
      </div>
    </div>
  );
}
