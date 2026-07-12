// Minimal end-to-end smoke test. Requires the app running (default :3000)
// against a migrated + seeded database. Usage: BASE=http://localhost:3000 node scripts/smoke.mjs
const BASE = process.env.BASE ?? "http://localhost:3000";
const MARIA = "00000000-0000-4000-a000-000000000001"; // seeded demo owner
const cookie = { headers: { cookie: `cp_demo_uid=${MARIA}` } };

const checks = [
  ["/", "Welcome back", cookie],
  ["/login", "Clarity Path", {}],
  ["/observations", "Observations", cookie],
  ["/medications", "Lisinopril", cookie],
  ["/appointments", "Appointments", cookie],
  ["/documents", "Documents", cookie],
  ["/research", "Research", cookie],
  ["/settings", "Care circle", cookie],
];

let failed = 0;
// Unauthenticated guard: / must redirect to /login
const guard = await fetch(`${BASE}/`, { redirect: "manual" });
if (guard.status !== 307 && guard.status !== 302) {
  console.error(`FAIL guard: expected redirect from /, got ${guard.status}`);
  failed++;
} else console.log("ok   guard: unauthenticated / redirects to login");

for (const [path, needle, init] of checks) {
  const res = await fetch(`${BASE}${path}`, init);
  const body = await res.text();
  if (res.status === 200 && body.includes(needle)) {
    console.log(`ok   ${path}`);
  } else {
    console.error(`FAIL ${path}: status=${res.status} needle="${needle}" found=${body.includes(needle)}`);
    failed++;
  }
}
if (failed) { console.error(`${failed} check(s) failed`); process.exit(1); }
console.log("ALL SMOKE CHECKS PASSED");
