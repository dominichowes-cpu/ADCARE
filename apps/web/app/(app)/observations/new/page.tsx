import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { observationCategoryLabels } from "@/lib/labels";
import { observationCategories } from "@/lib/validation";
import { ObservationForm } from "./observation-form";

function localDatetimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function NewObservationPage() {
  const session = await requireSession();
  const recipientName = session.recipient?.preferredName ?? "your person";

  const categories = observationCategories.map((value) => ({
    value,
    label: observationCategoryLabels[value] ?? value,
  }));

  return (
    <div>
      <PageHeader
        title="New observation"
        lede={`Write down what you noticed about ${recipientName} while it's fresh. Reassuring moments count as much as concerning ones — patterns only show up if both are here.`}
      />
      <ObservationForm
        categories={categories}
        defaultObservedAt={localDatetimeValue(new Date())}
        observerName={session.user.displayName}
        recipientName={recipientName}
      />
    </div>
  );
}
