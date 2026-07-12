import { requireSession } from "@/lib/session";
import { Chip, Empty, PageHeader } from "@/components/ui";
import {
  fmtDate, evidenceLabels, actionabilityLabels, contentTypeLabels,
} from "@/lib/labels";
import { getResearchData } from "@/lib/data";

const strengthTone: Record<string, "teal" | "amber" | "clay" | "neutral" | "sage"> = {
  strong: "teal",
  moderate: "teal",
  preliminary: "amber",
  very_preliminary: "clay",
  not_applicable: "neutral",
  insufficient_information: "neutral",
};

export default async function ResearchPage() {
  await requireSession();
  const items = await getResearchData();

  return (
    <div>
      <PageHeader
        title="Research"
        lede="What's genuinely new in dementia research, translated into plain language and labeled by how strong the evidence actually is. Preliminary findings are interesting — they are not instructions."
      />
      {items.length ? (
        <ul className="space-y-4">
          {items.map((c) => (
            <li key={c.id} className="rounded-xl border border-line bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="neutral">{contentTypeLabels[c.contentType] ?? c.contentType}</Chip>
                <Chip tone={strengthTone[c.evidenceStrength] ?? "neutral"}>
                  {evidenceLabels[c.evidenceStrength] ?? c.evidenceStrength}
                </Chip>
                {c.populationType === "animal" || c.populationType === "laboratory" ? (
                  <Chip tone="clay">Not yet studied in people</Chip>
                ) : null}
              </div>
              <p className="mt-2 font-display text-lg leading-snug">{c.displayHeadline}</p>
              {c.plainSubheading ? <p className="mt-1 text-mist">{c.plainSubheading}</p> : null}
              <p className="mt-2 text-[0.85rem] text-mist">
                {actionabilityLabels[c.actionability] ?? c.actionability} · {fmtDate(c.primaryPublicationDate)}
                {c.primarySourceUrl ? (
                  <>
                    {" · "}
                    <a
                      className="text-teal-deep underline underline-offset-4"
                      href={c.primarySourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Original source
                    </a>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No published research yet — the feed fills as ingestion runs.</Empty>
      )}
    </div>
  );
}
