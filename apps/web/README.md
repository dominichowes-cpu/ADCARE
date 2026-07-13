# ADCARE web app

Next.js App Router frontend for the ADCARE/Clarity Path workspace.

## Run

```bash
pnpm dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The app shell uses
fictional fixtures by default. User-entered observations are encrypted in this
browser's IndexedDB private vault and are not submitted to a server action.

## Privacy Boundary

Local-first is the default:

- Observation writes happen in `components/local-observations.tsx` +
  `lib/local-vault.ts`.
- The vault uses Web Crypto PBKDF2 + AES-GCM and stores only ciphertext in
  IndexedDB.
- Postgres access is disabled unless `CLARITY_STORAGE_MODE=cloud` is set.
- Do not introduce care-data API routes, server actions, analytics payloads, or
  logs without a deliberate compliance review.

## Verify

From the repo root:

```bash
pnpm typecheck
pnpm --filter web lint
pnpm build
BASE=http://127.0.0.1:3000 pnpm smoke
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
