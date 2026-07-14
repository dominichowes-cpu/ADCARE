import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { observationCategoryLabels } from "@/lib/labels";
import { observationCategories } from "@/lib/validation";
import { EditObservation } from "./edit-observation";

export default async function EditObservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const recipientName = session.recipient?.preferredName ?? "your person";

  const categories = observationCategories.map((value) => ({
    value,
    label: observationCategoryLabels[value] ?? value,
  }));

  return (
    <div>
      <PageHeader
        title="Edit observation"
        lede="Adjust the details or remove the entry. Changes stay in this browser's private vault."
      />
      <EditObservation
        categories={categories}
        id={id}
        observerName={session.user.displayName}
        recipientName={recipientName}
      />
    </div>
  );
}
