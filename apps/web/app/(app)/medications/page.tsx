import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { LocalMedications } from "@/components/local-medications";

export default async function MedicationsPage() {
  await requireSession();

  return (
    <div>
      <PageHeader
        title="Medications"
        eyebrow="Medication list"
        icon="pill"
        lede="A private record of what is being taken, kept exactly as the family enters it and encrypted in this browser. ADCARE never interprets, checks, or advises on medications — always confirm any change with the care team."
      />
      <LocalMedications />
    </div>
  );
}
