# Base44 Dev Environment

## Stack
Single-process fullstack app: **Vite + React** client + **Express + tRPC** server, **Drizzle ORM** over **Postgres**.
The dev command (`npm run dev` → `tsx watch server/_core/index.ts`) runs one Express server that mounts Vite in middleware mode — **one origin on port 3000** serves both the API (`/api/trpc`) and the client. No separate client/server processes.

## Running here
`docker compose -f docker-compose.base44.yml up -d` brings up:
- `db` — postgres:16-alpine (user/db `finesse`, persisted in the `pgdata` volume).
- `app` — node:22 with the repo bind-mounted at `/app`; on start it runs `npm install`, `npx drizzle-kit migrate`, then `npm run dev` (live reload via `tsx watch` + Vite HMR).

`node_modules` lives in a named volume (not the bind mount) so installs persist across restarts.

## Configuration / env
- `DATABASE_URL` points at the local Postgres. `DATABASE_SSL=false` is required — the local Postgres has no TLS, while the code defaults to SSL (for Supabase). The SSL flag is read in `server/_core/providers/postgresData.ts` and `server/db.ts`.
- `JWT_SECRET` + `OWNER_OPEN_ID=dev-owner` enable the **local dev auto-login**: with no WorkOS credentials, `LocalAuthProvider` falls back and auto-creates/logs in the owner user in development. No WorkOS/Supabase/storage/LLM credentials are needed to boot.
- Storage (`server/storage.ts`) degrades to an in-memory mock when S3 creds are absent. The LLM and Supabase modules are not in the boot path.

## External host / preview
Vite `allowedHosts` is set to `true` in `server/_core/vite.ts` (dev middleware), so the preview's external hostname is accepted.

## Migrations
Drizzle migrations live in `drizzle/` (journal-tracked). `drizzle-kit migrate` runs on every app start and is idempotent. The schema uses `gen_random_uuid()` (built into Postgres 13+, no extension needed).

## Verify it works
- `curl -sf http://localhost:3000/` returns the Vite-served HTML (look for `/@vite/client`).
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` must also succeed (external-host check).
- `docker compose -f docker-compose.base44.yml exec -T db psql -U finesse -d finesse -c "\dt"` lists the 6 tables.
- After any request, the `users` table contains the `dev-owner` row (auto-login).

## Notes / quirks
- `docker compose restart` does NOT apply compose env/config changes — use `up -d` (which recreates) after editing `docker-compose.base44.yml`.
- The dev-owner user is created with role `user` (the owner→admin promotion lives in `server/db.ts`'s `upsertUser`, but the active `PostgresDataProvider.upsertUser` doesn't apply it). Not blocking for the preview.
