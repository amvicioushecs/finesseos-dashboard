
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
erification Gates

Auth: login/logout/session refresh, protected/admin route behavior.
Data: CRUD parity on critical entities, migration integrity checks.
Realtime: subscription connect/reconnect and update propagation.
Deploy: Vercel preview smoke tests + production smoke tests.
Reliability: CI runs check, tests, and build before cutover.
Default Decisions Applied
Migration strategy: phased
Vercel runtime strategy: keep existing Express+tRPC and adapt to Vercel (lowest-risk)
Priority domains: auth, db, realtime, deployment
-Final regression pass and rollback playbook confirmation.

V


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


    **#Rebuild Plan**

## Overall Goal
**Removing Manus & Replacing with Supabase + Deploy to Vercel**

---

**Starting Execution: Steps 1 + 2**

### Step 1: Cleaned `vite.config.ts` (Manus Removed)

Replace your current `vite.config.ts` with the following cleaned version:

```ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

// =============================================================================
// Vite Configuration - Clean (No Manus)
// =============================================================================

const plugins: Plugin[] = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
```

**Action**: Replace the file and run:
```bash
pnpm remove vite-plugin-manus-runtime
pnpm install
```

---

### Step 2: Supabase Client Setup

Create the following new files:

#### 1. `lib/supabase.ts` (or `shared/supabase.ts`)

```ts
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers'; // fallback if needed, but we'll adapt

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Browser Client
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server Client (for tRPC / API routes)
export function createServerSupabaseClient(cookieStore?: any) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore?.getAll() ?? [];
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Handle cookie setting in your Express/Vercel context
            console.log(`Setting cookie: ${name}`);
          });
        } catch {
          // Ignore if headers already sent
        }
      },
    },
  });
}

// For Edge / Vercel serverless (will adapt later)
export const supabase = createClient();
```

#### 2. `lib/supabase-server.ts` (Server-only helpers)

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers'; // we'll adapt for Express/Vercel

export async function createSupabaseServerClient() {
  const cookieStore = cookies(); // adapt this for your server setup

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}
```

#### 3. Environment Variables (add to `.env`)

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # for admin operations
```

---

**Next Recommended Steps (after you confirm these files work)**

3. Update `drizzle.config.ts` + schema for Postgres  
4. Refactor tRPC context to use Supabase Auth  
5. Add `vercel.json` + adapt server for Vercel

**Would you like me to proceed with Step 3 (Drizzle + Postgres config + schema migration guide) now?**

Just say **“next”** or **“step 3”**.


---


**#Rebuild Plan**

## Overall Goal
**Removing Manus & Replacing with Supabase + Deploy to Vercel**

---

**Step 3: Drizzle + Postgres (Supabase) Migration**

### 3.1 Update `drizzle.config.ts`

Replace your current `drizzle.config.ts` with this:

```ts
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",           // ← Changed from mysql
  dbCredentials: {
    url: connectionString,
  },
});
```

---

### 3.2 Install Postgres Driver

```bash
pnpm remove mysql2
pnpm add postgres
pnpm add -D @types/pg   # optional but helpful
```

---

### 3.3 Update Database Connection (Server Side)

Create or update `server/db.ts` (or wherever you initialize Drizzle):

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  prepare: false,        // Recommended for Supabase
  ssl: true,             // Supabase requires SSL
});

export const db = drizzle(client);
export * from './schema'; // re-export your schema
```

---

### 3.4 Schema Migration Guide (MySQL → Postgres)

Open `drizzle/schema.ts` and apply these changes:

#### Common Changes Needed:

1. **Replace `mysqlTable` → `pgTable`**
   ```ts
   import { pgTable, uuid, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
   ```

2. **Primary Keys & IDs**
   - Use `uuid('id').primaryKey().defaultRandom()` instead of auto-increment

3. **Timestamps**
   - Use `timestamp('created_at').defaultNow()` (works better in Postgres)

4. **JSON Columns**
   - Change to `jsonb('column_name')` (much better than MySQL JSON)

5. **Example Updated Table** (affiliateNodes):

```ts
export const affiliateNodes = pgTable('affiliate_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  trackingId: text('tracking_id').unique().notNull(),
  
  affiliateUrl: text('affiliate_url').notNull(),
  brandName: text('brand_name'),
  brandLogoUrl: text('brand_logo_url'),
  category: text('category'),
  
  intelligence: jsonb('intelligence').default({}),
  compliance: jsonb('compliance').default({}),
  
  clickCount: integer('click_count').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Do this for all tables** (`nodeAssets`, `userIntegrations`, etc.).

---

### 3.5 Migration Commands

After updating schema:

```bash
# Generate new migration
pnpm db:push

# Or for versioned migrations:
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

---

### 3.6 Environment Variables (Update `.env`)

```env
DATABASE_URL="postgresql://postgres.[your-project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> **Tip**: Use the **Transaction Mode** (port 6543) connection string for Drizzle on Vercel.

---

**Next Steps After This**

Once you confirm Step 3 is done:

**Step 4**: Refactor tRPC context + Auth with Supabase  
**Step 5**: Vercel configuration + serverless adapter

---

**Ready?** Reply with **“step 4”** and I’ll give you the full tRPC + Supabase Auth integration.


---

**#Rebuild Plan**

## Overall Goal
**Removing Manus & Replacing with Supabase + Deploy to Vercel**

---

**Step 4: tRPC Context + Supabase Auth Refactor**

### 4.1 Install Dependencies (if not done)
```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add postgres
```

---

### 4.2 Create Supabase Client Utilities

**File: `lib/supabase.ts`** (update/replace previous version)

```ts
import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// For server / tRPC context (Express / Vercel)
export function createServerSupabaseClient(req?: any, res?: any) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (!req?.cookies) return [];
        return Object.keys(req.cookies).map((name) => ({
          name,
          value: req.cookies[name],
        }));
      },
      setAll(cookiesToSet) {
        if (!res) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookie(name, value, options);
          });
        } catch (error) {
          console.warn('Cookie set failed in Supabase client', error);
        }
      },
    },
  });
}
```

---

### 4.3 Update tRPC Context (`server/_core/trpc.ts` or similar)

Create / update your tRPC context creator:

```ts
import { initTRPC, TRPCError } from '@trpc/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/server/db'; // your Drizzle instance

export const createTRPCContext = async (opts: { req: any; res: any }) => {
  const supabase = createServerSupabaseClient(opts.req, opts.res);
  
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  return {
    db,
    supabase,
    session,
    user: session?.user ?? null,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // now guaranteed
    },
  });
});
```

---

### 4.4 Update Server Entry Point (`server/_core/index.ts`)

Add Supabase cookie middleware early:

```ts
import cookieParser from 'cookie-parser';
import { createTRPCContext } from './trpc';

// ...

app.use(cookieParser()); // Important for Supabase

// tRPC handler
app.use('/api/trpc', trpcHandler); // your existing tRPC setup
```

---

### 4.5 Update Existing tRPC Procedures

**Example** (in your routers):

```ts
// Before (old custom auth)
user: ctx.user, // from jose

// After
user: ctx.session?.user,
```

Replace all `jose` token verification with the new context.

**Key files to update**:
- All procedures using `protectedProcedure`
- `nodes.*`, `assets.*`, `integrations.*`, `auth.*` routers
- Remove old `jose` login/logout logic → use `supabase.auth.signInWithPassword()` etc.

---

### 4.6 Client-side Updates

In React components / tRPC hooks:

```ts
import { createClient } from '@/lib/supabase';

const supabase = createClient();

// Example: Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

---

**Migration Checklist**

- [ ] Remove all `jose` imports and custom JWT logic
- [ ] Update auth routes (login, logout, register)
- [ ] Replace `userId` checks with `ctx.user.id`
- [ ] Test protected routes
- [ ] Update any RLS policies in Supabase Dashboard (recommended)

---

**Next?**

Reply with **“step 5”** for Vercel config + serverless adapter.

Or say **“auth examples”** if you want full login/logout flows.

---

**#Rebuild Plan**

## Overall Goal
**Removing Manus & Replacing with Supabase + Deploy to Vercel**

---

**Step 5: Vercel Configuration & Serverless Adapter**

### 5.1 Create `vercel.json` (Root of project)

```json
{
  "version": 2,
  "buildCommand": "pnpm build",
  "outputDirectory": "dist/public",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": null,
  "rewrites": [
    { "source": "/api/trpc/(.*)", "destination": "/api/trpc" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### 5.2 Install Vercel Adapter Dependencies

```bash
pnpm add @vercel/node
```

### 5.3 Create Vercel API Route for tRPC

**File: `api/trpc.ts`** (create this folder + file in project root)

```ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '../server/_core/trpc';
import { appRouter } from '../server/_core/router'; // adjust path to your root router

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (opts) => {
      // Adapt for Vercel Request
      return createTRPCContext({
        req: {
          headers: Object.fromEntries(req.headers),
          cookies: Object.fromEntries(
            req.headers.get('cookie')?.split(';').map(c => {
              const [key, ...v] = c.trim().split('=');
              return [key, decodeURIComponent(v.join('='))];
            }) || []
          )
        },
        res: null // cookies handled via Supabase
      });
    },
  });
}

export const config = {
  runtime: 'nodejs18.x',   // or 'edge' if you want later
};
```

### 5.4 Update Main Server File (`server/_core/index.ts`)

Since Vercel uses the API route above, you can simplify or keep Express for local dev only:

```ts
// Local development only
if (process.env.NODE_ENV === 'development') {
  // your existing Express setup
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// For Vercel - export the handler if needed
export { default as handler } from '../../api/trpc';
```

### 5.5 Environment Variables (Vercel Dashboard)

Go to your Vercel project → Settings → Environment Variables and add:

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL                  # Supabase Postgres (Transaction Mode recommended)
```

### 5.6 Update Scripts in `package.json`

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch server/_core/index.ts",
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "vercel-build": "pnpm build",
    "db:push": "drizzle-kit generate && drizzle-kit migrate"
  }
}
```

### 5.7 Final Cleanup & Deploy

```bash
# 1. Test locally
pnpm build
vercel dev

# 2. Deploy
vercel --prod
```

---

**Deployment Checklist**

- [ ] Manus completely removed
- [ ] Drizzle + Postgres configured
- [ ] Supabase Auth integrated
- [ ] tRPC context updated
- [ ] `vercel.json` created
- [ ] `/api/trpc.ts` handler created
- [ ] Environment variables set in Vercel
- [ ] RLS policies enabled in Supabase (for `affiliate_nodes`, etc.)

---

**#Rebuild Plan**

## Overall Goal
**Removing Manus & Replacing with Supabase + Deploy to Vercel**

---

**FULL DEPLOY GUIDE — Complete End-to-End**

### Phase 0: Final Cleanup (Do This First)

```bash
# 1. Remove Manus completely
pnpm remove vite-plugin-manus-runtime

# 2. Clean install
rm -rf node_modules pnpm-lock.yaml .manus-logs
pnpm install

# 3. Replace vite.config.ts (from Step 1)
# 4. Apply Drizzle + Postgres changes (from Step 3)
# 5. Apply Supabase + tRPC changes (from Step 4)
```

---

### Phase 1: Project Structure Setup

Create these files/folders:

#### 1. `vercel.json` (root)
(Use the one from Step 5)

#### 2. `api/trpc.ts` (root)
(Use the handler from Step 5)

#### 3. `lib/supabase.ts`
(Use the latest version from Step 4)

#### 4. Update `server/db.ts`
```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  ssl: true,
});

export const db = drizzle(client);
```

---

### Phase 2: Final Code Adjustments

**Key Files to Update:**

1. **Remove `jose`** entirely:
   ```bash
   pnpm remove jose
   ```

2. **Update all protected tRPC procedures** to use new context.

3. **Update Auth Router** (example):
```ts
// server/routers/auth.ts
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';

export const authRouter = router({
  signIn: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword(input);
      return { data, error };
    }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.supabase.auth.signOut();
    return { success: true };
  }),

  getSession: publicProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
});
```

---

### Phase 3: Supabase Dashboard Setup

1. Go to [supabase.com](https://supabase.com) → New Project
2. After project is ready:
   - Enable Email Auth
   - Set up Row Level Security (RLS) policies:
     ```sql
     -- Example for affiliate_nodes
     create policy "Users can only access own nodes"
     on affiliate_nodes for all
     using (auth.uid() = user_id);
     ```

3. Add Environment Variables in Supabase (if needed)

---

### Phase 4: Vercel Deployment

#### 1. Connect Repository
```bash
vercel login
vercel link
```

#### 2. Add Environment Variables in Vercel Dashboard
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (use **Transaction Mode** connection string from Supabase → Settings → Database)

#### 3. Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

---

### Phase 5: Post-Deployment Checklist

- [ ] Run `pnpm db:push` locally first (to apply schema)
- [ ] Test login / register flow
- [ ] Create first affiliate node
- [ ] Test asset upload (S3 still works)
- [ ] Verify click tracking `/go/:id`
- [ ] Check tRPC calls in browser console
- [ ] Monitor Vercel Logs + Supabase Logs

---
**#Rebuild Plan**

## Overall Goal
**Removing Manus & Replacing with Supabase + Deploy to Vercel**

---

**FULL DEPLOY GUIDE — Complete End-to-End**

### Phase 0: Final Cleanup (Do This First)

```bash
# 1. Remove Manus completely
pnpm remove vite-plugin-manus-runtime

# 2. Clean install
rm -rf node_modules pnpm-lock.yaml .manus-logs
pnpm install

# 3. Replace vite.config.ts (from Step 1)
# 4. Apply Drizzle + Postgres changes (from Step 3)
# 5. Apply Supabase + tRPC changes (from Step 4)
```

---

### Phase 1: Project Structure Setup

Create these files/folders:

#### 1. `vercel.json` (root)
(Use the one from Step 5)

#### 2. `api/trpc.ts` (root)
(Use the handler from Step 5)

#### 3. `lib/supabase.ts`
(Use the latest version from Step 4)

#### 4. Update `server/db.ts`
```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  ssl: true,
});

export const db = drizzle(client);
```

---

### Phase 2: Final Code Adjustments

**Key Files to Update:**

1. **Remove `jose`** entirely:
   ```bash
   pnpm remove jose
   ```

2. **Update all protected tRPC procedures** to use new context.

3. **Update Auth Router** (example):
```ts
// server/routers/auth.ts
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';

export const authRouter = router({
  signIn: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword(input);
      return { data, error };
    }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.supabase.auth.signOut();
    return { success: true };
  }),

  getSession: publicProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
});
```

---

### Phase 3: Supabase Dashboard Setup

1. Go to [supabase.com](https://supabase.com) → New Project
2. After project is ready:
   - Enable Email Auth
   - Set up Row Level Security (RLS) policies:
     ```sql
     -- Example for affiliate_nodes
     create policy "Users can only access own nodes"
     on affiliate_nodes for all
     using (auth.uid() = user_id);
     ```

3. Add Environment Variables in Supabase (if needed)

---

### Phase 4: Vercel Deployment

#### 1. Connect Repository
```bash
vercel login
vercel link
```

#### 2. Add Environment Variables in Vercel Dashboard
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (use **Transaction Mode** connection string from Supabase → Settings → Database)

#### 3. Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

---

### Phase 5: Post-Deployment Checklist

- [ ] Run `pnpm db:push` locally first (to apply schema)
- [ ] Test login / register flow
- [ ] Create first affiliate node
- [ ] Test asset upload (S3 still works)
- [ ] Verify click tracking `/go/:id`
- [ ] Check tRPC calls in browser console
- [ ] Monitor Vercel Logs + Supabase Logs

---

### Bonus: Optional S3 → Supabase Storage Migration

Would you like me to generate the code to switch asset storage to Supabase Storage (simpler URLs + built-in policies)?

---

**You are now ready to deploy.**

Reply with:
- `"deploy now"` — I’ll give you the exact final commands
- `"s3-to-supabase"` — Switch storage
- `"fix something"` — Tell me what’s broken
- `"review files"` — I’ll ask for specific files to check

**What’s your next move?**



