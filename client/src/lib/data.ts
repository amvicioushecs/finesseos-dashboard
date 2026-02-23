// ============================================================
// FINESSEOS PRO — Core Data Types & Mock Data
// Design: Terminal-Noir OS / Affiliate Intelligence Platform
// ============================================================

export type ComplianceStatus = 'passed' | 'warning' | 'failed';
export type LinkStatus = 'active' | 'alert' | 'paused';
export type AssetType = 'image' | 'copy' | 'video' | 'banner';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  size: string;
  url?: string;
  uploadedAt: string;
}

export interface Persona {
  name: string;
  pain: string;
  hook: string;
  platform?: string;
}

export interface Intelligence {
  keywordResearch: string[];
  marketingAngle: string;
  personas: Persona[];
  contentSuggestions: string[];
  targetPlatforms: string[];
  strategyNotes?: string;
}

export interface Compliance {
  disclosure: string;
  rules: string[];
  status: ComplianceStatus;
  lastChecked?: string;
  ftcNotes?: string;
}

export interface AffiliateLink {
  id: string;
  brandName: string;
  slug: string;
  platform: string;
  destination: string;
  status: LinkStatus;
  clicks: string;
  earnings?: string;
  commission?: string;
  compliance: Compliance;
  assets: Asset[];
  intelligence: Intelligence;
  createdAt: string;
  category?: string;
  // Brand assets from Brandfetch
  brandLogoUrl?: string | null;
  brandIconUrl?: string | null;
  brandPrimaryColor?: string | null;
  brandColors?: string[];
  brandDescription?: string | null;
  brandIndustry?: string | null;
  brandDomain?: string | null;
}

export const initialLinks: AffiliateLink[] = [
  {
    id: 'L1',
    brandName: 'Shopify',
    slug: 'shopify-starter',
    platform: 'TikTok',
    destination: 'https://shopify.com/signup?aff=fos1',
    status: 'active',
    clicks: '2.4K',
    earnings: '$1,248',
    commission: '20%',
    category: 'E-Commerce',
    createdAt: '2024-01-15',
    compliance: {
      disclosure: 'AD: I earn from qualifying signups.',
      rules: ['No brand bidding', 'Must show pricing clearly', 'FTC disclosure required in first 3 seconds'],
      status: 'passed',
      lastChecked: '2024-02-01',
      ftcNotes: 'Clear and conspicuous disclosure required for short-form video per Jan 2024 FTC update.',
    },
    assets: [
      { id: 'A1', name: 'TikTok-Overlay-V1', type: 'image', size: '2MB', uploadedAt: '2024-01-16' },
      { id: 'A2', name: 'Trial-Hook-Script', type: 'copy', size: '5KB', uploadedAt: '2024-01-17' },
      { id: 'A3', name: 'Shopify-Banner-1080', type: 'banner', size: '800KB', uploadedAt: '2024-01-20' },
    ],
    intelligence: {
      keywordResearch: ['side hustle 2024', 'dropshipping for beginners', 'how to sell on tiktok', 'shopify tutorial', 'ecommerce passive income'],
      marketingAngle: 'The "Anti-Corporate" Freedom Angle. Focus on escaping the 9-5 grind using Shopify as the vehicle. Emphasize speed-to-launch and low barrier to entry.',
      personas: [
        { name: 'Burned-Out Millennial', pain: 'Fixed salary, no upward mobility', hook: 'One-click store setup', platform: 'TikTok' },
        { name: 'The Gen Z Side-Hustler', pain: 'High rent, low entry-level wages', hook: 'Low startup costs', platform: 'Instagram Reels' },
        { name: 'Stay-at-Home Parent', pain: 'Needs flexible income, limited time', hook: 'Run from your phone', platform: 'Pinterest' },
      ],
      contentSuggestions: [
        'Day in the life of a solo-founder (POV style)',
        '3 Reasons you haven\'t started your business yet',
        'Dashboard reveal: First $1k day',
        'What I wish I knew before starting my Shopify store',
        'Shopify vs Etsy — which actually makes more money?',
      ],
      targetPlatforms: ['TikTok (Primary)', 'Instagram Reels', 'Pinterest Ads', 'YouTube Shorts'],
      strategyNotes: 'Peak engagement windows: TikTok 7-9pm EST. Use trending audio. Hook in first 1.5 seconds.',
    },
  },
  {
    id: 'L2',
    brandName: 'Amazon Associates',
    slug: 'tech-setup-2024',
    platform: 'YouTube',
    destination: 'https://amazon.com/dp/B07HG?tag=fos-20',
    status: 'alert',
    clicks: '1.1K',
    earnings: '$342',
    commission: '4%',
    category: 'Tech & Gear',
    createdAt: '2024-01-22',
    compliance: {
      disclosure: 'As an Amazon Associate I earn from qualifying purchases.',
      rules: ['Do not use Amazon logos in custom banners', 'Must disclose in video description', 'No price guarantees'],
      status: 'warning',
      lastChecked: '2024-01-28',
      ftcNotes: 'Warning: Original destination URL returning 404. Update redirect immediately.',
    },
    assets: [
      { id: 'A4', name: 'YT-Description-Snippet', type: 'copy', size: '2KB', uploadedAt: '2024-01-23' },
    ],
    intelligence: {
      keywordResearch: ['desk setup tour', 'wfh productivity gear', 'best budget monitors 2024', 'mechanical keyboard review', 'home office setup'],
      marketingAngle: 'The "Productivity Peak" Angle. Focus on how this gear solves specific ergonomic pains and unlocks deep work sessions.',
      personas: [
        { name: 'Remote Software Engineer', pain: 'Back pain, messy desk, context switching', hook: 'Cable management & ergonomics', platform: 'YouTube' },
        { name: 'Content Creator', pain: 'Unprofessional setup on camera', hook: 'Studio-quality look on a budget', platform: 'YouTube' },
      ],
      contentSuggestions: [
        'Desk setup evolution (2020 vs 2024)',
        'Why I switched to this mechanical keyboard',
        'Hidden Amazon productivity gems under $50',
        'The exact setup that helped me 10x my output',
      ],
      targetPlatforms: ['YouTube (Long-form)', 'X / Twitter (Threads)', 'Reddit (r/battlestations)'],
      strategyNotes: 'Long-form review content converts best. Include timestamps. Pin affiliate link in comments.',
    },
  },
  {
    id: 'L3',
    brandName: 'ClickFunnels',
    slug: 'funnel-hacker-pro',
    platform: 'Email',
    destination: 'https://clickfunnels.com/pro?cf_aff=99',
    status: 'active',
    clicks: '850',
    earnings: '$2,100',
    commission: '40%',
    category: 'SaaS / Marketing',
    createdAt: '2024-02-01',
    compliance: {
      disclosure: 'Affiliate Link Included. I may earn a commission at no extra cost to you.',
      rules: ['CAN-SPAM act compliance required', 'Unsubscribe link mandatory', 'No deceptive subject lines'],
      status: 'passed',
      lastChecked: '2024-02-10',
      ftcNotes: 'Email disclosure must appear above the fold. CAN-SPAM compliant.',
    },
    assets: [
      { id: 'A5', name: 'Email-Banner-600px', type: 'banner', size: '1.1MB', uploadedAt: '2024-02-02' },
      { id: 'A6', name: 'Email-Sequence-5-Part', type: 'copy', size: '12KB', uploadedAt: '2024-02-03' },
    ],
    intelligence: {
      keywordResearch: ['conversion optimization', 'marketing automation', 'landing page high conversion', 'sales funnel software', 'email marketing ROI'],
      marketingAngle: 'The "Automation Engine" Angle. Focus on building assets that work while you sleep. Position ClickFunnels as the infrastructure for passive income.',
      personas: [
        { name: 'SaaS Founder', pain: 'High CAC, low conversion rate', hook: 'Automated follow-up sequences', platform: 'Email' },
        { name: 'Course Creator', pain: 'Leaky funnel, abandoned carts', hook: 'One-click upsells', platform: 'LinkedIn' },
      ],
      contentSuggestions: [
        'The exact funnel that generated $100k in 90 days',
        'Why your website is actually a liability (and what to use instead)',
        'Automation vs. Hustle: The math that changed my business',
        'My ClickFunnels dashboard: real numbers, real results',
      ],
      targetPlatforms: ['Email (Direct)', 'LinkedIn (B2B)', 'YouTube (Case Studies)'],
      strategyNotes: 'B2B angle performs best on LinkedIn. Email sequences: 5-part drip, send Tuesday/Thursday 10am.',
    },
  },
];

export const systemNodes = [
  { id: 'NODE_01_US_EAST', status: 'optimal', load: '12%', ping: '18ms', region: 'US East' },
  { id: 'NODE_02_EU_WEST', status: 'optimal', load: '8%', ping: '42ms', region: 'EU West' },
  { id: 'NODE_03_ASIA_SE', status: 'optimal', load: '24%', ping: '88ms', region: 'Asia SE' },
];

export const apiIntegrations = [
  { network: 'Shopify Partners', status: 'Connected', key: '••••••••••••••••' },
  { network: 'Amazon Associates', status: 'Pending', key: '••••••••••••••••' },
  { network: 'ClickFunnels v2', status: 'Connected', key: '••••••••••••••••' },
  { network: 'Impact Radius', status: 'Inactive', key: '••••••••••••••••' },
];

export const intelligenceNews = [
  { title: 'FTC Update: Jan 2024', body: 'New requirements for "clear and conspicuous" disclosure on short-form video. Applies to all affiliate content under 60 seconds.', platform: 'Legal', date: '2024-01-15' },
  { title: 'TikTok Retention Spike', body: '3-second rule now 2.5s for affiliate content in the "Tech" category. Front-load your hook.', platform: 'TikTok', date: '2024-02-01' },
  { title: 'Amazon Image Terms', body: 'Updated TOS: Native product photos now conversion-favored over renders. Switch your creative assets.', platform: 'Amazon', date: '2024-02-08' },
  { title: 'Email Open Rate Surge', body: 'Personalized subject lines with first name see 26% higher open rates in Q1 2024. Update your sequences.', platform: 'Email', date: '2024-02-12' },
  { title: 'YouTube Shorts Monetization', body: 'Affiliate links now clickable in Shorts descriptions. New traffic source unlocked for all creators.', platform: 'YouTube', date: '2024-02-15' },
  { title: 'LinkedIn B2B Conversion', body: 'Document posts outperform image posts 3:1 for SaaS affiliate conversions. Restructure your content mix.', platform: 'LinkedIn', date: '2024-02-18' },
];
