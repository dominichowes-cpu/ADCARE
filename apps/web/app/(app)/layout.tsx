import type { ReactNode } from "react";
import { requireSession } from "@/lib/session";
import { Shell } from "@/components/shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  return <Shell session={session}>{children}</Shell>;
}
