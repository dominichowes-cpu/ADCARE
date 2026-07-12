// Demo-only session layer. This is the dev half of the auth abstraction:
// a signed-in user is a cookie holding a seeded user's id. The production
// half (Auth0) replaces loginAs/getSession internals without touching pages.
// Never use this mechanism outside local development.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionForUser } from "@/lib/data";

const COOKIE = "cp_demo_uid";

export type Session = {
  user: { id: string; displayName: string; email: string };
  membership: { id: string; role: string; relationship: string | null };
  household: { id: string; name: string; navigationPhase: string };
  recipient: { id: string; preferredName: string; birthYear: number | null; generalLocation: string | null; pronouns: string | null } | null;
};

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const uid = jar.get(COOKIE)?.value;
  if (!uid) return null;

  return getSessionForUser(uid);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export const SESSION_COOKIE = COOKIE;
