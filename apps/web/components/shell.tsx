import Link from "next/link";
import type { ReactNode } from "react";
import type { Session } from "@/lib/session";
import { phaseLabels } from "@/lib/labels";
import { logout } from "@/app/login/actions";

const nav = [
  { href: "/", label: "Home" },
  { href: "/care-recipient", label: "Care recipient" },
  { href: "/observations", label: "Observations" },
  { href: "/medications", label: "Medications" },
  { href: "/appointments", label: "Appointments" },
  { href: "/documents", label: "Documents" },
  { href: "/research", label: "Research" },
  { href: "/settings", label: "Settings" },
];

export function Shell({ session, children }: { session: Session; children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="bg-ink text-paper lg:min-h-screen">
        <div className="px-5 py-6">
          <Link href="/" className="font-display text-xl italic tracking-tight">
            Clarity Path
          </Link>
          <p className="mt-1 text-[0.8rem] text-paper/60">{session.household.name}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-[0.95rem] text-paper/85 hover:bg-ink-soft hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card px-6 py-4">
          <span className="rounded-full bg-sage px-3 py-1 text-[0.85rem] text-teal-deep">
            {phaseLabels[session.household.navigationPhase] ?? session.household.navigationPhase}
          </span>
          <div className="flex items-center gap-4 text-[0.9rem]">
            <span className="text-mist">
              {session.user.displayName}
              {session.membership.relationship ? ` · ${session.membership.relationship}` : ""}
            </span>
            <form action={logout}>
              <button className="rounded-lg border border-line px-3 py-1.5 hover:bg-paper" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
