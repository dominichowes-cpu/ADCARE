import { loginAs } from "./actions";
import { titleize } from "@/lib/labels";
import { getLoginUsers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const demoUsers = await getLoginUsers();

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="font-display text-4xl italic tracking-tight">Clarity Path</h1>
        <p className="mt-3 text-mist">
          A calm place for families navigating memory changes together. This is the
          local development sign-in: pick a member of the demo household.
        </p>
        <div className="mt-8 space-y-3">
          {demoUsers.map((u) => (
            <form key={u.id} action={loginAs}>
              <input type="hidden" name="userId" value={u.id} />
              <button
                type="submit"
                className="w-full rounded-xl border border-line bg-card px-5 py-4 text-left hover:border-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
              >
                <span className="block font-bold">{u.name}</span>
                <span className="text-[0.9rem] text-mist">
                  {titleize(u.role)}
                  {u.relationship ? ` · ${u.relationship}` : ""}
                </span>
              </button>
            </form>
          ))}
        </div>
        <p className="mt-6 text-[0.85rem] text-mist">
          All data shown is fictional demo content. Production sign-in (Auth0) replaces
          this screen without changing anything else.
        </p>
      </div>
    </div>
  );
}
