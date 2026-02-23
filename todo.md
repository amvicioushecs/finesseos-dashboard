# FinesseOS Pro — Dashboard TODO

## Core Dashboard
- [x] Terminal-Noir OS design system (dark theme, Space Grotesk + JetBrains Mono)
- [x] Fixed sidebar navigation (Overview, Vault, Intelligence, Settings)
- [x] Mobile-responsive bottom nav
- [x] Dashboard Overview with live stat cards (campaigns, clicks, alerts, earnings)
- [x] Inevitable Action Feed (live campaign events)
- [x] OS Metrics panel (latency, sync status, compliance engine, AI intelligence)

## Campaign Vault
- [x] Affiliate link node cards with status badges
- [x] Node workspace with 4 tabs: Overview, Compliance, Assets, Intelligence
- [x] Compliance tab with FTC rules and disclosure
- [x] Assets tab with upload vault UI
- [x] Intelligence tab with keywords, personas, content suggestions, strategy notes

## AI Intelligence Engine
- [x] Add Link modal — URL-first flow (paste link → AI generates everything)
- [x] Backend tRPC endpoint: affiliate.generateIntelligence
- [x] AI generates: brand name, category, platform, commission, 10 keywords, marketing angle, 4 personas, 6 content ideas, 5 target platforms, strategy notes, FTC disclosure, compliance rules
- [x] Loading animation with 5-step progress display
- [x] Step 2 intelligence preview with real AI data
- [x] Compliance status badge (passed/warning/failed)
- [x] Node creation with full AI-generated data

## Intelligence Hub
- [x] Aggregated keyword pool
- [x] Persona matrix
- [x] Platform distribution
- [x] Live platform news feed
- [x] Campaign marketing angles

## System Config
- [x] Node infrastructure panel
- [x] API vault panel
- [x] Security layer panel

## Testing
- [x] Vitest tests for affiliate intelligence schema (9 tests)
- [x] Vitest tests for auth.logout (1 test)

## Upcoming
- [x] Asset upload flow (drag-and-drop images/banners per node, S3 storage)
- [x] Persist nodes to database (currently in-memory state)
- [x] Landing page (FinesseOS.pro public-facing page)
- [ ] User authentication gate for dashboard

## In Progress
- [x] Database schema: affiliateNodes, nodeAssets tables
- [x] DB migration via pnpm db:push
- [x] tRPC procedures: nodes.list, nodes.create, nodes.delete, nodes.update
- [x] tRPC procedures: assets.upload, assets.list, assets.delete
- [x] Wire Dashboard vault to DB (replace local state with trpc queries/mutations)
- [x] S3 asset upload flow with drag-and-drop per node
- [x] FinesseOS.pro landing page (public-facing, converts visitors to users)
- [x] Rewrite hero copy — clear who it's for, what it does, fifth-grade reading level
- [x] Increase hero text size and brightness for legibility
- [x] Upgrade hero font for impact and readability
- [x] Integrate Brandfetch API — auto-fetch brand logo, name, colors on link paste
- [x] Display brand logo on each campaign node card in The Vault
- [x] Store brandLogoUrl and brandColors in the affiliateNodes DB table
- [x] Replace landing page navbar bolt icon with official FinesseOS logo (~40px)
- [x] Show brand logo in node workspace header when entering a node
- [x] Add delete button to each Vault card with confirmation dialog
- [x] Wire delete to tRPC nodes.delete mutation (removes node + all assets from DB)
- [x] Replace sidebar bolt icon with official FinesseOS logo (~32px)
- [x] Auth gate /dashboard — redirect unauthenticated users to login
- [x] Add clickCount column to affiliateNodes DB table
- [x] Build public /go/:trackingId redirect endpoint that increments clicks
- [x] Add getTrackedUrl tRPC procedure
- [x] Show tracked link URL per node in workspace
- [x] Display live click counts on Vault cards and Overview stats
- [x] Wire Sign In navbar link to getLoginUrl() on landing page
- [x] Brighten all body text throughout landing page for legibility
- [x] Fix hero gradient to extend full-width edge-to-edge
- [x] Add SEO meta tags to landing page (keywords, description, OG, Twitter Card, canonical, structured data)
- [x] Generate and add favicon.ico and apple-touch-icon to the site
- [x] Make landing page header clearly visible with solid dark full-width background
- [x] Generate sitemap.xml and robots.txt for Google Search Console
