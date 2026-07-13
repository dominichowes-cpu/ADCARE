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
      <h1 className="font-display text-[2.2rem] font-semibold leading-tight">{title}</h1>
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
      <p className="mt-0.5 font-display text-xl font-semibold leading-none">{value}</p>
    </div>
  );
}

export function IllustrationStrip({
  variant,
}: {
  variant: "visit" | "tasks" | "observations" | "family";
}) {
  const icons: Record<string, IconName> = {
    family: "heart",
    observations: "activity",
    tasks: "clipboard",
    visit: "calendar",
  };

  return (
    <div className="-mx-5 -mt-5 mb-4 overflow-hidden rounded-t-lg border-b border-line bg-gold-soft/65">
      <div className="relative h-20">
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 420 140">
          <path d="M36 44h94M54 66h52M288 42h82M314 64h42" stroke="#1b2a41" strokeOpacity=".18" />
          <path d="M42 118c44-26 90-29 138-9 59 24 112 16 158-24" stroke="#1b2a41" strokeDasharray="5 9" strokeLinecap="round" strokeOpacity=".2" />
          <circle cx="116" cy="92" r="7" fill="#1b2a41" fillOpacity=".12" />
          <circle cx="304" cy="92" r="7" fill="#1b2a41" fillOpacity=".12" />
          <rect height="70" rx="16" stroke="#1b2a41" strokeOpacity=".16" width="140" x="140" y="35" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full border border-ink/15 bg-card text-teal-deep shadow-[0_10px_28px_rgba(27,42,65,0.08)]">
            <Icon name={icons[variant]} className="size-6" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function CareMapVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[4/3] w-full max-w-[23rem] overflow-hidden rounded-lg bg-gold text-ink-deep shadow-[0_24px_70px_rgba(0,0,0,0.2)]"
    >
      <svg className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 360 270">
        <path d="M42 52h82M58 72h52M238 50h76M260 70h38" stroke="#111b2c" strokeOpacity=".18" />
        <path d="M180 92v-34M180 178v34M126 135H78M234 135h48" stroke="#111b2c" strokeLinecap="round" strokeOpacity=".24" strokeWidth="3" />
        <circle cx="180" cy="135" r="48" fill="#fffdf9" stroke="#111b2c" strokeWidth="3" />
        <circle cx="180" cy="135" r="68" stroke="#111b2c" strokeDasharray="6 10" strokeOpacity=".18" strokeWidth="2" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-ink-deep text-gold shadow-[0_18px_40px_rgba(17,27,44,0.18)]">
          <Icon name="heart" className="size-7" />
        </span>
      </div>
      <div className="absolute inset-x-7 top-7 flex justify-between">
        {(["calendar", "activity"] as IconName[]).map((name) => (
          <span key={name} className="inline-flex size-12 items-center justify-center rounded-full border border-ink/10 bg-card text-ink-deep shadow-[0_10px_24px_rgba(27,42,65,0.08)]">
            <Icon name={name} className="size-5" />
          </span>
        ))}
      </div>
      <div className="absolute inset-x-7 bottom-7 flex justify-between">
        {(["pill", "shield"] as IconName[]).map((name) => (
          <span key={name} className="inline-flex size-12 items-center justify-center rounded-full border border-ink/10 bg-card text-ink-deep shadow-[0_10px_24px_rgba(27,42,65,0.08)]">
            <Icon name={name} className="size-5" />
          </span>
        ))}
      </div>
    </div>
  );
}
