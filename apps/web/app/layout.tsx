import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clarity Path",
  description: "A calm place for families navigating memory changes together.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
