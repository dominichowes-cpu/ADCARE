import type { ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";

export function PageHeader({
  title,
  lede,
  eyebrow,
  icon,
}: {
  title: string;
  lede?: string;
  eyebrow?: string;
  icon?: IconName;
}) {
  return (
    <header className="mb-8">
      {eyebrow || icon ? (
        <div className="mb-3 flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-teal-deep">
          {icon ? <IconBadge icon={icon} tone="teal" size="sm" /> : null}
          {eyebrow ? <span>{eyebrow}</span> : null}
        </div>
      ) : null}
      <h1 className="font-display text-[2.2rem] leading-tight">{title}</h1>
      {lede ? <p className="mt-2 max-w-2xl text-mist">{lede}</p> : null}
    </header>
  );
}

export function Card({
  children,
  tint = false,
  className = "",
}: {
  children: ReactNode;
  tint?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-lg border border-line p-5 shadow-[0_18px_60px_rgba(27,42,65,0.06)]",
        tint ? "bg-sage-soft" : "bg-card/95",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, icon }: { children: ReactNode; icon?: IconName }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-mist">
      {icon ? <Icon name={icon} className="size-4 text-teal" /> : null}
      {children}
    </h2>
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
    <div className="rounded-lg border border-dashed border-line bg-card/80 p-8 text-center text-mist">
      {children}
    </div>
  );
}

export function IconBadge({
  icon,
  tone = "neutral",
  size = "md",
}: {
  icon: IconName;
  tone?: "neutral" | "teal" | "gold" | "clay" | "sage" | "ink";
  size?: "sm" | "md" | "lg";
}) {
  const tones: Record<string, string> = {
    neutral: "border-line bg-card text-mist",
    teal: "border-teal/25 bg-teal/10 text-teal-deep",
    gold: "border-gold/35 bg-gold/20 text-amber",
    clay: "border-clay/25 bg-clay/10 text-clay",
    sage: "border-teal/20 bg-sage text-teal-deep",
    ink: "border-paper/10 bg-paper/10 text-paper",
  };
  const sizes: Record<string, string> = {
    sm: "size-7 [&_svg]:size-3.5",
    md: "size-9 [&_svg]:size-4",
    lg: "size-11 [&_svg]:size-5",
  };

  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg border ${tones[tone]} ${sizes[size]}`}>
      <Icon name={icon} />
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  icon,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost" | "inverted";
}) {
  const variants: Record<string, string> = {
    primary: "bg-teal text-paper shadow-[0_14px_30px_rgba(47,97,96,0.22)] hover:bg-teal-deep",
    secondary: "border border-line bg-card text-ink hover:border-teal/40 hover:text-teal-deep",
    ghost: "text-teal-deep hover:bg-sage-soft",
    inverted: "border border-paper/15 bg-paper/10 text-paper hover:bg-paper/15 hover:text-paper",
  };

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[0.92rem] font-bold ${variants[variant]} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal`}
    >
      {icon ? <Icon name={icon} className="size-4" /> : null}
      <span>{children}</span>
    </Link>
  );
}

export function TextLink({ href, children, icon }: { href: string; children: ReactNode; icon?: IconName }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[0.9rem] font-bold text-teal-deep hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      <span>{children}</span>
      {icon ? <Icon name={icon} className="size-4" /> : null}
    </Link>
  );
}

export function StatPill({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-paper/15 bg-paper/10 px-3 py-2 text-paper shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur">
      <p className="text-[0.72rem] uppercase tracking-[0.12em] text-paper/65">{label}</p>
      <p className="mt-0.5 font-display text-xl leading-none">{value}</p>
    </div>
  );
}

export function CareMapVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[4/3] w-full max-w-[23rem] overflow-hidden rounded-lg border border-paper/15 bg-paper/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
    >
      <svg className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 360 270">
        <path
          d="M65 184C105 92 174 58 251 86C314 109 318 177 267 203C216 229 151 215 93 229"
          stroke="rgba(250,248,244,0.28)"
          strokeDasharray="6 10"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M62 87C116 58 178 58 232 88C272 110 296 150 304 202"
          stroke="rgba(240,191,79,0.45)"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <circle cx="84" cy="84" fill="rgba(248,225,165,0.9)" r="28" />
        <circle cx="236" cy="91" fill="rgba(220,231,226,0.95)" r="34" />
        <circle cx="292" cy="204" fill="rgba(62,124,123,0.95)" r="31" />
        <circle cx="95" cy="214" fill="rgba(255,253,249,0.95)" r="25" />
      </svg>
      <div className="relative grid h-full grid-cols-2 content-between gap-3">
        <div className="rounded-lg border border-paper/15 bg-ink/35 p-3 text-paper backdrop-blur">
          <Icon name="calendar" className="size-5 text-gold-soft" />
          <p className="mt-6 text-[0.78rem] text-paper/65">Next visit</p>
          <p className="font-bold">Prep ready</p>
        </div>
        <div className="self-start rounded-lg border border-paper/15 bg-ink/25 p-3 text-paper backdrop-blur">
          <Icon name="pill" className="size-5 text-sage" />
          <p className="mt-6 text-[0.78rem] text-paper/65">Meds</p>
          <p className="font-bold">Confirmed</p>
        </div>
        <div className="self-end rounded-lg border border-paper/15 bg-paper/15 p-3 text-paper backdrop-blur">
          <Icon name="activity" className="size-5 text-gold-soft" />
          <p className="mt-6 text-[0.78rem] text-paper/65">Patterns</p>
          <p className="font-bold">Tracked</p>
        </div>
        <div className="self-end rounded-lg border border-paper/15 bg-ink/35 p-3 text-paper backdrop-blur">
          <Icon name="shield" className="size-5 text-sage" />
          <p className="mt-6 text-[0.78rem] text-paper/65">Sharing</p>
          <p className="font-bold">Logged</p>
        </div>
      </div>
    </div>
  );
}
