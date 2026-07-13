import type { SVGProps } from "react";

export type IconName =
  | "activity"
  | "calendar"
  | "check"
  | "chevronRight"
  | "clipboard"
  | "file"
  | "heart"
  | "home"
  | "logOut"
  | "pill"
  | "plus"
  | "search"
  | "settings"
  | "shield"
  | "sparkles"
  | "user";

const paths: Record<IconName, string[]> = {
  activity: ["M22 12h-4l-3 8-6-16-3 8H2"],
  calendar: [
    "M8 2v4",
    "M16 2v4",
    "M3 10h18",
    "M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  ],
  check: ["m20 6-11 11-5-5"],
  chevronRight: ["m9 18 6-6-6-6"],
  clipboard: [
    "M9 4h6a2 2 0 0 1 2 2v1H7V6a2 2 0 0 1 2-2Z",
    "M8 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2",
    "M8 13h8",
    "M8 17h5",
  ],
  file: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z", "M14 2v6h6", "M8 13h8", "M8 17h5"],
  heart: [
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
  ],
  home: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h14V9.5", "M9 21v-7h6v7"],
  logOut: ["M10 17l5-5-5-5", "M15 12H3", "M21 3v18h-7"],
  pill: ["M10.5 21.5a6.5 6.5 0 0 1-4.6-11.1l4.5-4.5a6.5 6.5 0 0 1 9.2 9.2l-4.5 4.5a6.5 6.5 0 0 1-4.6 1.9Z", "m8.5 8.5 7 7"],
  plus: ["M12 5v14", "M5 12h14"],
  search: ["M21 21l-4.3-4.3", "M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"],
  settings: [
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7.1 4l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 20.1 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.9 1Z",
  ],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z", "m9 12 2 2 4-5"],
  sparkles: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z", "M5 3v4", "M3 5h4", "M19 17v4", "M17 19h4"],
  user: ["M20 21a8 8 0 0 0-16 0", "M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"],
};

export function Icon({ name, className = "size-4", ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name].map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}
