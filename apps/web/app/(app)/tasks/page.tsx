import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { LocalTasks } from "@/components/local-tasks";

export default async function TasksPage() {
  await requireSession();

  return (
    <div>
      <PageHeader
        title="Tasks"
        eyebrow="Family coordination"
        icon="check"
        lede="The shared to-do list for this care circle — who's doing what, by when. Everything here is encrypted in this browser's private vault."
      />
      <LocalTasks />
    </div>
  );
}
