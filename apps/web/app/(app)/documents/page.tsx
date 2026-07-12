import { requireSession } from "@/lib/session";
import { Chip, Empty, PageHeader } from "@/components/ui";
import { fmtDate, titleize } from "@/lib/labels";
import { getDocumentsData } from "@/lib/data";

export default async function DocumentsPage() {
  const session = await requireSession();
  const docs = await getDocumentsData(session);

  return (
    <div>
      <PageHeader
        title="Documents"
        lede="One safe place for the paperwork that matters: medication lists, visit summaries, legal documents. Access is logged, and sharing is always deliberate."
      />
      {docs.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {docs.map((d) => (
            <li key={d.id} className="rounded-xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold">{d.title}</p>
                <Chip tone="teal">{titleize(d.recordType)}</Chip>
              </div>
              <p className="mt-1 text-[0.9rem] text-mist">
                {d.issuingOrganization ?? "Source not recorded"} · {fmtDate(d.documentDate)}
              </p>
              <p className="mt-2 text-[0.85rem] text-mist">
                {(Number(d.byteSize) / 1024).toFixed(0)} KB · scan: {d.virusScanStatus}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>The vault is empty. Upload a medication list or visit summary to start.</Empty>
      )}
    </div>
  );
}
