import Link from "next/link";
import type { ReactNode } from "react";
import type { Session } from "@/lib/session";
import { phaseLabels } from "@/lib/labels";
import { logout } from "@/app/login/actions";
import { Icon, type IconName } from "@/components/icons";

const nav: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/care-recipient", label: "Care recipient", icon: "heart" },
  { href: "/observations", label: "Observations", icon: "activity" },
  { href: "/medications", label: "Medications", icon: "pill" },
  { href: "/appointments", label: "Appointments", icon: "calendar" },
  { href: "/documents", label: "Documents", icon: "file" },
  { href: "/research", label: "Research", icon: "sparkles" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function Shell({ session, children }: { session: Session; children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-paper/10 bg-ink-deep text-paper lg:sticky lg:top-0 lg:h-screen lg:border-r">
        <div className="px-5 py-6">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg border border-paper/10 bg-paper/10 text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <Icon name="heart" className="size-5" />
            </span>
            <span>
              <span className="block font-display text-xl leading-none">Clarity Path</span>
              <span className="mt-1 block text-[0.72rem] uppercase tracking-[0.16em] text-paper/45">
                Care workspace
              </span>
            </span>
          </Link>
          <div className="mt-5 rounded-lg border border-paper/10 bg-paper/5 p-3">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-paper/45">Household</p>
            <p className="mt-1 font-bold">{session.household.name}</p>
            {session.recipient ? (
              <p className="mt-1 text-[0.82rem] text-paper/60">
                Supporting {session.recipient.preferredName}
              </p>
            ) : null}
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[0.95rem] text-paper/78 hover:bg-paper/10 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage lg:shrink"
            >
              <Icon name={item.icon} className="size-4 text-paper/55" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card/85 px-6 py-4 shadow-[0_10px_30px_rgba(27,42,65,0.05)] backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/15 bg-sage px-3 py-1 text-[0.85rem] font-bold text-teal-deep">
            <Icon name="shield" className="size-3.5" />
            {phaseLabels[session.household.navigationPhase] ?? session.household.navigationPhase}
          </span>
          <div className="flex items-center gap-4 text-[0.9rem]">
            <span className="text-mist">
              {session.user.displayName}
              {session.membership.relationship ? ` · ${session.membership.relationship}` : ""}
            </span>
            <form action={logout}>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 font-bold hover:border-teal/40 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
                type="submit"
              >
                <Icon name="logOut" className="size-4" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
