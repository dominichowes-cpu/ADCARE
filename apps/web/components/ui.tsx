import type { ReactNode } from "react";

export function PageHeader({ title, lede }: { title: string; lede?: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-[2rem] leading-tight tracking-tight">{title}</h1>
      {lede ? <p className="mt-2 max-w-2xl text-mist">{lede}</p> : null}
    </header>
  );
}

export function Card({ children, tint = false }: { children: ReactNode; tint?: boolean }) {
  return (
    <div className={`rounded-xl border border-line ${tint ? "bg-sage-soft" : "bg-card"} p-5`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-mist">{children}</h2>
  );
}

export function Chip({
  children, tone = "neutral",
}: { children: ReactNode; tone?: "neutral" | "teal" | "amber" | "clay" | "sage" }) {
  const tones: Record<string, string> = {
    neutral: "border-line text-mist",
    teal: "border-teal/40 bg-teal/10 text-teal-deep",
    amber: "border-amber/40 bg-amber/10 text-amber",
    clay: "border-clay/40 bg-clay/10 text-clay",
    sage: "border-teal/20 bg-sage text-teal-deep",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[0.8rem] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-card p-8 text-center text-mist">
      {children}
    </div>
  );
}
