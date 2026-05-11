# Copilot instructions for this repository

Purpose: quick reference for Copilot sessions — build/test/lint commands, high-level architecture, and repository-specific conventions.

---

## Build / test / lint commands

- Dev (local, runs server watcher + Vite client dev):
  - pnpm run dev
- Build (client static + bundle server):
  - pnpm run build
  - Output: static -> dist/public, server bundle -> dist
- Start (production):
  - pnpm start
- Type-check only:
  - pnpm run check
- Format (prettier):
  - pnpm run format
- Tests (Vitest):
  - pnpm test         # runs `vitest run` (full suite)
  - Run a single test file: pnpm exec vitest run server/path/to/file.test.ts
  - Run a single test by name: pnpm exec vitest -t "test name"
  - Note: vitest is configured to run server/**/*.test.ts and server/**/*.spec.ts in a Node environment
- Database migrations (Drizzle):
  - pnpm run db:push   # runs drizzle-kit generate && drizzle-kit migrate

Notes:
- Package manager: pnpm (packageManager in package.json).
- Use `pnpm exec <tool>` to run dev tools when needed.

---

## High-level architecture (big picture)

- Monorepo-style layout (single repo with client + server + shared code):
  - client/ — Vite + React SPA (Vite root set to client in vite.config.ts)
  - server/ — Express + tRPC backend (server/_core contains the tRPC/context/providers entry points)
  - shared/ — shared types/constants used by both sides
  - drizzle/ — Drizzle ORM schema + SQL migrations
  - dist/ — build output (server bundle and public static files)

- Runtime & APIs:
  - tRPC used for typed RPC between client and server; server/_core/trpc.ts exports publicProcedure, protectedProcedure, adminProcedure helpers.
  - Authentication handled via an authProvider abstraction (server/_core/providers referenced from context). createContext populates ctx.user using authProvider.authenticate(req).
  - DB access via Drizzle (drizzle-orm/mysql2). The server/db.ts file lazily connects using ENV.databaseUrl and exposes helpers (getDb, upsertUser, node/asset operations).

- Build & deploy:
  - Vite builds client static into dist/public.
  - Server is bundled with esbuild during `pnpm run build` to dist; `pnpm start` runs the bundle.
  - vercel.json rewrites route /api/* to /api/index.ts and expects outputDirectory dist/public for static hosting.

- Project contains a Manus-specific dev helper in vite.config.ts (manus-debug-collector) and several Manus hostnames in allowedHosts. There is an existing migration plan (see .cursor/plans/*) describing migration to Supabase.

---

## Key repository conventions and patterns

- Path aliases (used across client and tests):
  - `@` => client/src
  - `@shared` => shared/
  - `@assets` => attached_assets/
  These are defined in vite.config.ts and tsconfig.json; prefer these aliases in imports.

- tRPC usage pattern:
  - Use exported `publicProcedure`, `protectedProcedure` and `adminProcedure` to compose routers and enforce auth/role checks.
  - `createContext` returns { req, res, user } where `user` is a Drizzle `User | null`.

- Auth provider abstraction:
  - Authentication flows are implemented behind `authProvider` (server/_core/providers). Keep logic there when adding new auth/backends (e.g., Supabase compatibility in migration plans).

- Database / schema conventions:
  - Drizzle schema (drizzle/schema.ts) is MySQL-first; several JSON-like columns are stored as plain TEXT (JSON arrays/objects saved as strings) for TiDB/MySQL compatibility. Respect that shape when reading/writing.
  - Upserts and duplicate-key updates use `onDuplicateKeyUpdate` patterns (see server/db.ts example: upsertUser).

- Testing convention:
  - Vitest is used for server tests (node environment). Tests are expected under server/ and referenced in vitest.config.ts include patterns.

- Dev / server workflow:
  - `pnpm run dev` runs `tsx watch server/_core/index.ts` (server watcher) while Vite dev serves client. Use `pnpm` as package manager and `pnpm exec` for direct tool execution.

- Build / deploy considerations:
  - Server bundling is handled by esbuild in the build step; changes to server entrypoints require verifying the bundle works (dist/index.js) and that vercel.json rewrites still match the deployed hosting setup.

---

## Where to look for more context (examples)
- server/_core/trpc.ts — tRPC procedure wrappers and auth middleware
- server/_core/context.ts — how request context + auth is composed
- server/db.ts — Drizzle usage and common DB helpers (upsertUser, node/asset helpers)
- drizzle/schema.ts — canonical DB schema; JSON stored as text in many columns
- vite.config.ts — client build root, aliases, and the Manus debug collector
- vitest.config.ts — server test patterns and Node test environment
- .cursor/plans/ — migration and operational plans (e.g., supabase_vercel_migration...)

---

If Copilot needs further guidance, include a short pointer to this file in the session's initial assistant prompt so it can follow repository conventions and commands.
