
/Users/amvicious/.cursor/plans/supabase_vercel_migration_3283abd3.plan.md
Use a phased migration (dual-run where needed) rather than a big-bang rewrite.

flowchart LR
  inventory[InventoryManusCouplings] --> adapter[AddProviderAbstractions]
  adapter --> auth[CutoverAuthToSupabase]
  auth --> db[CutoverDataLayerToSupabase]
  db --> realtime[ImplementSupabaseRealtime]
  realtime --> deploy[DeployToVercelPreview]
  deploy --> production[ProductionCutover]
  production --> cleanup[RemoveManusCodeAndEnv]

Scope Confirmed
Authentication/authorization
Database schema + data migration
Realtime/subscriptions
Vercel deployment + env/secrets
Key Files To Touch





Auth/session core: /Users/amvicious/Finesse/finesseos-dashboard/server/_core/sdk.ts, /Users/amvicious/Finesse/finesseos-dashboard/server/_core/oauth.ts, /Users/amvicious/Finesse/finesseos-dashboard/server/_core/context.ts, /Users/amvicious/Finesse/finesseos-dashboard/server/_core/trpc.ts



Data layer: /Users/amvicious/Finesse/finesseos-dashboard/server/db.ts, /Users/amvicious/Finesse/finesseos-dashboard/drizzle/schema.ts, /Users/amvicious/Finesse/finesseos-dashboard/drizzle/0000_sparkling_ultimo.sql, /Users/amvicious/Finesse/finesseos-dashboard/drizzle/0001_premium_jane_foster.sql



Frontend auth/bootstrap envs: /Users/amvicious/Finesse/finesseos-dashboard/client/src/const.ts, /Users/amvicious/Finesse/finesseos-dashboard/client/src/_core/hooks/useAuth.ts



Deploy/runtime: /Users/amvicious/Finesse/finesseos-dashboard/package.json, /Users/amvicious/Finesse/finesseos-dashboard/server/_core/index.ts, /Users/amvicious/Finesse/finesseos-dashboard/vite.config.ts, /Users/amvicious/Finesse/finesseos-dashboard/vercel.json



New Supabase structure (to add): /Users/amvicious/Finesse/finesseos-dashboard/supabase/migrations/, /Users/amvicious/Finesse/finesseos-dashboard/supabase/functions/, /Users/amvicious/Finesse/finesseos-dashboard/.env.example

Implementation Phases

**Phase 1: Freeze and abstract Manus dependencies**
-Inventory and centralize every Manus/Forge env usage into one provider config module.

-Add backend interfaces for auth provider and data provider so routers stop importing Manus-specific logic directly.

-Keep current behavior unchanged; this phase is structural and test-protective.

**Phase 2: Supabase auth migration (with compatibility window)**
-Add Supabase auth verification path and map existing user identity (openId) to provider-neutral IDs.

-Replace frontend login bootstrap constants (currently Manus-portal-driven) with Supabase-auth flow.

-Keep legacy session acceptance temporarily to prevent forced logout during cutover.

**Phase 3: Database migration to Supabase Postgres**
-Translate Drizzle MySQL schema/migrations into Supabase SQL migrations.

-Run staged data migration and validation scripts (row counts, FK integrity, key user journeys).

-Switch server/db.ts read/write implementation to Supabase-backed access.

**Phase 4: Realtime implementation**
-Implement real realtime channels using Supabase Realtime for required features.

-Replace any pseudo-realtime or polling paths where the product expects live updates.

-Add connection/auth guards and fallback behavior for disconnected clients.

**Phase 5: Vercel deployment hardening**
-Add vercel.json and adapt Express+tRPC entrypoint for Vercel functions/runtime.

-Configure Preview + Production environment variables (Supabase URL/keys, JWT/auth secrets, remaining third-party keys).

-Validate deep links, API routes, and static asset routing in preview deployments.

**Phase 6: Production cutover and Manus removal**
-Cut traffic to Supabase-backed auth/data after preview and staging signoff.

-Remove Manus env vars, Manus runtime plugin references, and Manus-only code paths.

-Final regression pass and rollback playbook confirmation.

Verification Gates

Auth: login/logout/session refresh, protected/admin route behavior.
Data: CRUD parity on critical entities, migration integrity checks.
Realtime: subscription connect/reconnect and update propagation.
Deploy: Vercel preview smoke tests + production smoke tests.
Reliability: CI runs check, tests, and build before cutover.
Default Decisions Applied
Migration strategy: phased
Vercel runtime strategy: keep existing Express+tRPC and adapt to Vercel (lowest-risk)
Priority domains: auth, db, realtime, deployment


/MCP 

 {
       "mcpServers": {
         "TypeSlayer": {
           "command": "npx",
           "args": [
             "typeslayer",
             "mcp"
           ]
         }
      }
    }