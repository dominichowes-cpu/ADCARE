import { loginAs } from "./actions";
import { titleize } from "@/lib/labels";
import { getLoginUsers } from "@/lib/data";
import { CareMapVisual, IconBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const demoUsers = await getLoginUsers();

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_0.95fr]">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-5 flex items-center gap-3">
            <IconBadge icon="heart" tone="teal" size="lg" />
            <div>
              <h1 className="font-display text-4xl leading-none">Clarity Path</h1>
              <p className="mt-1 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-teal-deep">
                Care workspace
              </p>
            </div>
          </div>
          <p className="text-mist">
            A calm place for families navigating memory changes together. This is the
            local development sign-in: pick a member of the demo household.
          </p>
          <div className="mt-8 space-y-3">
            {demoUsers.map((u) => (
              <form key={u.id} action={loginAs}>
                <input type="hidden" name="userId" value={u.id} />
                <button
                  type="submit"
                  className="group flex w-full items-center gap-3 rounded-lg border border-line bg-card/95 px-5 py-4 text-left shadow-[0_14px_45px_rgba(27,42,65,0.05)] hover:border-teal/45 hover:shadow-[0_18px_55px_rgba(47,97,96,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
                >
                  <IconBadge icon="user" tone="neutral" />
                  <span>
                    <span className="block font-bold">{u.name}</span>
                    <span className="text-[0.9rem] text-mist">
                      {titleize(u.role)}
                      {u.relationship ? ` · ${u.relationship}` : ""}
                    </span>
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
      <div className="hidden items-center justify-center bg-ink-deep p-10 text-paper lg:flex">
        <div className="max-w-lg">
          <p className="mb-4 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-gold-soft">
            Demo household
          </p>
          <h2 className="font-display text-[3rem] leading-none">A shared view of the details that matter.</h2>
          <p className="mt-4 text-paper/65">
            Notes, appointments, medication context, documents, and research sit together so the
            family can spot patterns and show up prepared.
          </p>
          <div className="mt-8">
            <CareMapVisual />
          </div>
        </div>
      </div>
    </div>
  );
}
