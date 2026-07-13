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
    <div className="-mx-5 -mt-5 mb-4 overflow-hidden rounded-t-lg border-b border-line bg-gold-soft/70">
      <div className="relative h-28">
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 420 140">
          <path d="M18 38h72M38 58h96M298 24h70M314 44h48" stroke="#1b2a41" strokeOpacity=".18" />
          <path d="M24 116c54-44 104-46 150-6s104 35 166-20" stroke="#1b2a41" strokeDasharray="5 8" strokeOpacity=".25" />
          <rect height="40" rx="5" stroke="#1b2a41" strokeOpacity=".5" width="54" x="252" y="56" />
          <path d="M262 70h34M262 82h24" stroke="#1b2a41" strokeOpacity=".55" />
          <path d="M102 85c12-19 35-17 44 0M124 78V42M112 54l12-12 12 12" stroke="#1b2a41" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <circle cx="124" cy="35" r="10" stroke="#1b2a41" strokeWidth="2" />
          <circle cx="338" cy="83" fill="#fffdf9" r="22" stroke="#1b2a41" strokeOpacity=".55" />
          <path d="M328 84h20M338 74v20" stroke="#1b2a41" strokeLinecap="round" />
          <path d="m64 32 6 6 10-13M354 28l8-8M362 28l-8-8" stroke="#1b2a41" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".55" />
          {variant === "observations" ? (
            <path d="M184 88h28l15-44 27 70 15-35h31" stroke="#3e7c7b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          ) : null}
          {variant === "visit" ? (
            <g stroke="#3e7c7b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
              <rect height="58" rx="7" width="72" x="172" y="44" />
              <path d="M172 62h72M190 35v18M226 35v18M190 78h12M214 78h12M190 92h12" />
            </g>
          ) : null}
          {variant === "tasks" ? (
            <g stroke="#3e7c7b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
              <rect height="66" rx="7" width="62" x="178" y="38" />
              <path d="M192 58h31M192 74h31M192 90h20M182 58l4 4 8-10M182 90l4 4 8-10" />
            </g>
          ) : null}
          {variant === "family" ? (
            <path d="M210 102s-43-25-43-52c0-15 12-25 27-25 9 0 16 4 21 11 5-7 12-11 21-11 15 0 27 10 27 25 0 27-43 52-43 52h-10Z" fill="#fffdf9" stroke="#3e7c7b" strokeLinejoin="round" strokeWidth="3" />
          ) : null}
        </svg>
        <div className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full border border-ink/15 bg-card text-ink">
          <Icon name={icons[variant]} className="size-5" />
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
        <path d="M31 36h58M47 54h78M238 38h82M256 56h46" stroke="#111b2c" strokeOpacity=".24" />
        <path d="M44 229c42-34 83-37 124-9 48 33 97 22 148-31" stroke="#111b2c" strokeDasharray="5 8" strokeLinecap="round" strokeOpacity=".3" />
        <path d="M179 205s-52-31-52-65c0-19 15-32 34-32 11 0 20 5 26 14 6-9 15-14 26-14 19 0 34 13 34 32 0 34-52 65-52 65h-16Z" fill="#fffdf9" stroke="#111b2c" strokeLinejoin="round" strokeWidth="3" />
        <circle cx="188" cy="75" r="25" fill="#fffdf9" stroke="#111b2c" strokeWidth="3" />
        <path d="M188 101v49M164 127h48M171 174l17-24 18 24" stroke="#111b2c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <rect height="58" rx="7" stroke="#111b2c" strokeWidth="3" width="78" x="58" y="102" />
        <path d="M70 121h54M70 137h38M70 151h28" stroke="#111b2c" strokeLinecap="round" strokeOpacity=".72" strokeWidth="2" />
        <rect height="54" rx="7" stroke="#111b2c" strokeWidth="3" width="58" x="244" y="108" />
        <path d="M256 124h34M256 139h24M256 154h30" stroke="#111b2c" strokeLinecap="round" strokeOpacity=".72" strokeWidth="2" />
        <path d="M84 93V75h36v18M258 96V78h30v18" stroke="#111b2c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="m65 71 8 8 16-21M284 205l14-14M298 205l-14-14" stroke="#111b2c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <circle cx="75" cy="196" r="15" stroke="#111b2c" strokeWidth="3" />
        <path d="M64 196h22M75 185v22M284 71h20M294 61v20" stroke="#111b2c" strokeLinecap="round" strokeWidth="3" />
      </svg>
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-2">
        {(["calendar", "activity", "pill", "shield"] as IconName[]).map((name) => (
          <span key={name} className="inline-flex aspect-square items-center justify-center rounded-full bg-ink-deep text-gold">
            <Icon name={name} className="size-4" />
          </span>
        ))}
      </div>
    </div>
  );
}
