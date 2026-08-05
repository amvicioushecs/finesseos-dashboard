# WorkOS AuthKit Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace legacy local auth with WorkOS AuthKit hosted UI and backend Node SDK authentication for FinesseOS Dashboard.

**Architecture:** Frontend buttons redirect to backend `/api/auth/login` which generates a WorkOS Hosted AuthKit URL. Upon completion, WorkOS redirects to `/api/auth/callback` where the backend exchanges the authorization code via `@workos-inc/node` SDK, upserts the user in Postgres via `dataProvider.upsertUser`, sets a secure HTTP-only JWT `session` cookie, and redirects to `/dashboard`.

**Tech Stack:** Node.js, `@workos-inc/node`, Express, tRPC, React, TypeScript, Drizzle PostgreSQL.

## Global Constraints
- SDK: `@workos-inc/node`
- Environment Variables: `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URI`
- Cookie name: `session`
- Path alignment: Redirect to `/dashboard` on auth success

---

### Task 1: Install WorkOS SDK & Update Provider Configuration

**Files:**
- Modify: `package.json`
- Modify: `server/_core/providers/config.ts`

**Interfaces:**
- Consumes: Environment variables `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URI`
- Produces: Updated `PROVIDER_CONFIG` with WorkOS options

- [ ] **Step 1: Install `@workos-inc/node` package**

```bash
pnpm add @workos-inc/node
```

- [ ] **Step 2: Update `server/_core/providers/config.ts` to include WorkOS credentials**

Update `server/_core/providers/config.ts` to include WorkOS fields in `PROVIDER_CONFIG` and `validateConfig()`.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml server/_core/providers/config.ts
git commit -m "feat: add @workos-inc/node dependency and config"
```

---

### Task 2: Create `WorkOSAuthProvider` and Wire Provider Factory

**Files:**
- Create: `server/_core/providers/workosAuth.ts`
- Modify: `server/_core/providers/index.ts`
- Create: `server/_core/providers/workosAuth.test.ts`

**Interfaces:**
- Consumes: `IAuthProvider` interface, `@workos-inc/node` WorkOS client
- Produces: `WorkOSAuthProvider` implementation of `IAuthProvider`

- [ ] **Step 1: Write `WorkOSAuthProvider` implementation**

Implement `WorkOSAuthProvider` with methods: `authenticate`, `createSession`, `verifySession`, `handleCallback`.

- [ ] **Step 2: Create unit tests for WorkOS Auth Provider logic**

Verify session creation and verification logic.

- [ ] **Step 3: Update `server/_core/providers/index.ts`**

Instantiate `WorkOSAuthProvider` when `WORKOS_API_KEY` and `WORKOS_CLIENT_ID` are present in `PROVIDER_CONFIG`.

- [ ] **Step 4: Run unit tests**

```bash
pnpm test
```

- [ ] **Step 5: Commit**

```bash
git add server/_core/providers/workosAuth.ts server/_core/providers/index.ts server/_core/providers/workosAuth.test.ts
git commit -m "feat: implement WorkOSAuthProvider"
```

---

### Task 3: Add Express Auth Endpoints (`/api/auth/login`, `/api/auth/callback`, `/api/auth/logout`)

**Files:**
- Modify: `server/_core/index.ts`

**Interfaces:**
- Consumes: `authProvider.handleCallback`, `authProvider.createSession`
- Produces: Auth HTTP endpoints for browser flow

- [ ] **Step 1: Add `/api/auth/login` endpoint**

Generates WorkOS authorization URL using `workos.userManagement.getAuthorizationUrl` and redirects browser.

- [ ] **Step 2: Add `/api/auth/callback` endpoint**

Exchanges code via `authProvider.handleCallback(code, state)`, creates session cookie, and redirects user to `/dashboard`.

- [ ] **Step 3: Add `/api/auth/logout` endpoint**

Clears `session` cookie.

- [ ] **Step 4: Commit**

```bash
git add server/_core/index.ts
git commit -m "feat: add WorkOS OAuth endpoints"
```

---

### Task 4: Frontend Alignment & End-to-End Verification

**Files:**
- Modify: `client/src/const.ts`
- Modify: `.env.example`

- [ ] **Step 1: Update `getLoginUrl()` in `client/src/const.ts` to return `/api/auth/login`**

- [ ] **Step 2: Add WorkOS environment variable templates to `.env.example`**

- [ ] **Step 3: Run build and tests**

```bash
pnpm build && pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add client/src/const.ts .env.example
git commit -m "feat: align frontend login URL with WorkOS auth flow"
```
