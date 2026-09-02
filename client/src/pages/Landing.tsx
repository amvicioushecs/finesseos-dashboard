// FINESSEOS — Landing Page (rebuilt on the FinesseOS brand design system)
import { useState, useEffect } from 'react';
import { getLoginUrl } from '@/const';
import { useAuth } from '@/_core/hooks/useAuth';
import {
  Lightning, ArrowRight, ChevronLeft, ChevronRight, Menu,
  CircleCheck, MagnifyingGlass, Warning, Folder, Users, TrendUp, Link as LinkIcon,
} from '@/components/brand/Icons';

const BRAND_LOGO =
  'https://media.base44.com/images/public/workspaces/6a8f22bef4a230d370b810e4/brands/4ce451ced_brand_upload_logo.png';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// ─── Animated Counter ─────────────────────────────────────
const Counter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); } else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// ─── Data ─────────────────────────────────────────────────
const FEATURES = [
  { icon: Lightning, title: 'AI Does the Research', description: 'Paste your link. Get keywords, buyer personas, marketing angles, and content ideas — all in seconds. No research required.', accent: true },
  { icon: CircleCheck, title: 'Compliance on Autopilot', description: 'AI writes your FTC disclosures and checks platform rules automatically. You stay protected without thinking about it.' },
  { icon: Folder, title: 'Your Files, All in One Place', description: 'Drag and drop your banners, images, and copy into each campaign. No more hunting through Google Drive or your desktop.' },
  { icon: TrendUp, title: 'Know Where to Promote', description: 'AI tells you exactly which platforms — TikTok, YouTube, Instagram, email — will work best for each affiliate program.' },
  { icon: Users, title: 'Know Exactly Who to Target', description: 'Get 4 detailed buyer personas per campaign — who they are, what they want, and how to talk to them on each platform.' },
  { icon: LinkIcon, title: 'See All Your Campaigns at Once', description: 'One dashboard to see all your keywords, personas, and strategies across every affiliate program you’re running.' },
  { icon: LinkIcon, title: 'One Link = One Campaign Workspace', description: 'Every affiliate link gets its own organized workspace with everything you need to promote it successfully.' },
  { icon: Lightning, title: 'Content Ideas Ready to Go', description: 'Get 6 content ideas per campaign — hooks, angles, and formats already tailored to the platforms you’re targeting.' },
  { icon: CircleCheck, title: 'Secure & Private', description: 'Your nodes, your data. Enterprise-grade security with per-user isolation. Nothing shared, nothing leaked.' },
];

const PROBLEMS = [
  { icon: MagnifyingGlass, text: 'You spend hours researching keywords and audiences — only to guess wrong and waste money on ads.', accent: true },
  { icon: Warning, text: 'You get flagged or banned because you forgot an FTC disclosure or broke a platform rule.', accent: false },
  { icon: Folder, text: 'Your banners, copy, and links are scattered across 5 different apps. Nothing is organized.', accent: false },
];

const STEPS = [
  { number: '01', title: 'Paste your affiliate link', description: 'Copy your affiliate URL from any program — ClickBank, Amazon, ShareASale, ClickFunnels, anything. Paste it in.' },
  { number: '02', title: 'AI builds your campaign', description: 'In seconds, AI researches the brand, finds your best keywords, builds buyer personas, writes your FTC disclosure, and ranks your best platforms.' },
  { number: '03', title: 'Promote with confidence', description: 'Use your tracked link to send traffic. Watch clicks roll in. Everything you need to promote is in one organized workspace.' },
];

const STATS = [
  { value: 10, suffix: '', label: 'Keywords per node', desc: 'Targeted, intent-based' },
  { value: 4, suffix: '', label: 'Buyer personas', desc: 'Per campaign, AI-built' },
  { value: 5, suffix: '', label: 'Target platforms', desc: 'Ranked by fit score' },
  { value: 100, suffix: '%', label: 'FTC compliant', desc: 'Every node, every time' },
];

const PRICING = [
  { plan: 'Free', price: '$0', period: '', features: ['3 campaign nodes', 'Basic AI intelligence', 'FTC compliance scan', 'Community support'], cta: 'Start Free', highlighted: false },
  { plan: 'Pro', price: '$29', period: '/mo', features: ['Unlimited nodes', 'Full AI intelligence engine', 'Asset vault (S3 storage)', 'Advanced compliance scanner', 'Intelligence Hub', 'Priority support'], cta: 'Start Pro', highlighted: true },
  { plan: 'Agency', price: '$99', period: '/mo', features: ['Everything in Pro', 'Team access (5 seats)', 'White-label nodes', 'API access', 'Dedicated support'], cta: 'Contact Sales', highlighted: false },
];

const SLIDES_PER_VIEW = 3;

// ─── Feature Card ─────────────────────────────────────────
const FeatureCard = ({
  icon: Icon, title, description, accent = false,
}: {
  icon: (p: { size?: number; className?: string }) => React.ReactElement;
  title: string; description: string; accent?: boolean;
}) => (
  <div className={cn(
    'h-full p-6 rounded-xl border transition-all duration-300',
    accent ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'
  )}>
    <div className={cn(
      'w-10 h-10 rounded-lg flex items-center justify-center mb-4',
      accent ? 'bg-primary/20' : 'bg-background'
    )}>
      <Icon size={20} className={accent ? 'text-primary' : 'text-foreground/80'} />
    </div>
    <h3 className="font-heading font-bold text-sm mb-2 text-foreground">{title}</h3>
    <p className="text-foreground/70 text-xs">{description}</p>
  </div>
);

// ─── Features Carousel ──────────────────────────────────
const FeaturesCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = FEATURES.length;
  const maxIndex = total - SLIDES_PER_VIEW;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setCurrent(c => (c >= maxIndex ? 0 : c + 1)), 4000);
    return () => clearInterval(id);
  }, [paused, maxIndex]);

  const prev = () => setCurrent(c => (c <= 0 ? maxIndex : c - 1));
  const next = () => setCurrent(c => (c >= maxIndex ? 0 : c + 1));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="font-heading text-primary text-xs font-bold uppercase mb-4" style={{ letterSpacing: '0.2em' }}>Features</p>
        <h2 className="font-heading text-3xl sm:text-5xl font-bold text-foreground">Everything you need to win.</h2>
        <p className="text-foreground/70 text-lg mt-4 max-w-xl mx-auto">
          FinesseOS handles the research, compliance, and organization — so you can focus on promoting.
        </p>
      </div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out gap-5"
          style={{ transform: `translateX(calc(-${current} * (100% / ${SLIDES_PER_VIEW} + 20px / ${SLIDES_PER_VIEW})))` }}
        >
          {FEATURES.map((f, i) => (
            <div key={i} className="shrink-0" style={{ width: `calc((100% - ${(SLIDES_PER_VIEW - 1) * 20}px) / ${SLIDES_PER_VIEW})` }}>
              <FeatureCard icon={f.icon} title={f.title} description={f.description} accent={f.accent} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-10">
        <button onClick={prev} className="carousel-nav-btn" aria-label="Previous feature">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="carousel-indicator"
              data-active={i === current}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button onClick={next} className="carousel-nav-btn" aria-label="Next feature">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

// ─── Pricing Card ─────────────────────────────────────────
const PricingCard = ({
  plan, price, period, features, cta, highlighted = false,
}: {
  plan: string; price: string; period: string; features: string[]; cta: string; highlighted?: boolean;
}) => (
  <div className={cn(
    'relative p-8 rounded-xl border transition-all duration-300 flex flex-col',
    highlighted
      ? 'bg-primary/10 border-primary/40 shadow-[0_0_60px_rgba(37,99,235,0.15)]'
      : 'bg-card border-border'
  )}>
    {highlighted && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="badge-highlight">Top Choice</span>
      </div>
    )}
    <div className="mb-6">
      <p className="text-foreground/60 text-[10px] font-bold uppercase mb-2" style={{ letterSpacing: '0.15em' }}>{plan}</p>
      <div className="flex items-end gap-1">
        <span className="font-heading text-4xl font-bold text-foreground">{price}</span>
        {period && <span className="text-foreground/60 text-sm mb-1.5">{period}</span>}
      </div>
    </div>
    <ul className="space-y-3 mb-8 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <CircleCheck size={16} className={cn('shrink-0 mt-0.5', highlighted ? 'text-primary' : 'text-foreground/50')} />
          <span className="text-foreground/80 text-xs">{f}</span>
        </li>
      ))}
    </ul>
    <a href={getLoginUrl()} className={highlighted ? 'btn-primary-compact' : 'btn-secondary'}>
      {cta}
    </a>
  </div>
);

// ─── Section heading ───────────────────────────────────────
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="font-heading text-primary text-xs font-bold uppercase mb-4" style={{ letterSpacing: '0.2em' }}>{children}</p>
);

// ─── Main Landing Page ───────────────────────────────────
export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const loginUrl = isAuthenticated ? '/dashboard' : getLoginUrl();
  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        scrolled ? 'bg-background/90 backdrop-blur-md border-border' : 'border-transparent'
      )}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img src={BRAND_LOGO} alt="FinesseOS" className="h-9 w-auto" />
          </a>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="btn-text-link-padded">{l.label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center">
            <a href={loginUrl} className="btn-text-link-padded">Sign In</a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground/80"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-6 py-6 space-y-4">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="btn-text-link-padded block" onClick={() => setMobileMenuOpen(false)}>{l.label}</a>
            ))}
            <a href={loginUrl} className="btn-primary-compact" onClick={() => setMobileMenuOpen(false)}>Enter the OS</a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-10">
            <img
              src={BRAND_LOGO}
              alt="FinesseOS"
              className="w-auto"
              style={{ height: '120px', filter: 'drop-shadow(0 0 40px rgba(43,127,255,0.45))' }}
            />
          </div>

          <div className="mb-8">
            <span className="badge-category">
              <span className="badge-category-dot" />
              For Affiliate Marketers
            </span>
          </div>

          <h1 className="font-heading font-bold text-foreground mb-8 text-5xl sm:text-6xl">
            You paste an affiliate link.
            <br />
            <span className="text-primary">We build your whole campaign.</span>
          </h1>

          <p className="text-foreground/90 text-xl sm:text-2xl mb-3 max-w-2xl mx-auto font-medium">
            FinesseOS is the AI system built for affiliate marketers.
          </p>
          <p className="text-foreground/70 text-base sm:text-lg mb-12 max-w-xl mx-auto">
            Paste your link. Get keywords, buyer personas, content ideas, platform strategy, and FTC compliance — all in seconds. No research. No guessing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href={loginUrl} className="btn-primary-gradient">
              <Lightning size={20} />
              Start Free — Paste Your First Link
              <ArrowRight size={20} />
            </a>
          </div>
          <p className="text-foreground/60 text-sm mb-4">No credit card · Free forever plan</p>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-border">
            {[
              { value: '10', label: 'Keywords per campaign' },
              { value: '4', label: 'Buyer personas built' },
              { value: '5', label: 'Platforms ranked' },
              { value: '100%', label: 'FTC compliant' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-heading text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-foreground/60 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Eyebrow>The Problem</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-foreground mb-6">
              Affiliate marketing is hard work.<br />It doesn’t have to be.
            </h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              Most affiliate marketers waste hours every week doing research that AI can do in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROBLEMS.map((item, i) => (
              <div key={i} className={cn(
                'p-6 rounded-xl border',
                item.accent ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'
              )}>
                <div className={cn('mb-4', item.accent ? 'text-primary' : 'text-foreground/70')}>
                  <item.icon size={20} />
                </div>
                <p className={cn('text-sm font-medium', item.accent ? 'text-foreground' : 'text-foreground/80')}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-foreground">Three steps. That’s it.</h2>
            <p className="text-foreground/70 text-lg mt-4 max-w-xl mx-auto">No setup. No learning curve. Just paste and go.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.number} className="flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-heading font-bold text-sm">
                  {s.number}
                </div>
                <div className="pt-1">
                  <h3 className="font-heading font-bold text-sm mb-1.5 text-foreground">{s.title}</h3>
                  <p className="text-foreground/70 text-xs">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 border-t border-border">
        <FeaturesCarousel />
      </section>

      {/* ── Social Proof ── */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Eyebrow>What You Get Per Campaign</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-foreground mb-16">Every link. Fully loaded.</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="p-6 bg-card border border-border rounded-xl">
                <div className="font-heading text-4xl font-bold text-foreground mb-1">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-bold text-foreground mb-1">{stat.label}</div>
                <div className="text-xs text-foreground/60">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-foreground">Start free. Upgrade when you’re ready.</h2>
            <p className="text-foreground/70 text-base mt-4">No credit card required to get started.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map(p => (
              <PricingCard key={p.plan} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-32 px-6 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Stop guessing.
            <br />
            <span className="text-primary">Start making money.</span>
          </h2>
          <p className="text-foreground/90 text-xl mb-4 max-w-xl mx-auto font-medium">
            Paste your first affiliate link. Get your full campaign in seconds.
          </p>
          <p className="text-foreground/70 text-base mb-12 max-w-lg mx-auto">
            No more guessing. No more scattered files. No more getting flagged. Just a clear system that tells you exactly what to do.
          </p>
          <a href={loginUrl} className="btn-primary-solid">
            <Lightning size={20} />
            Get Started Free
            <ArrowRight size={20} />
          </a>
          <p className="text-foreground/60 text-sm mt-6">Free plan available · No credit card required</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={BRAND_LOGO} alt="FinesseOS" className="h-8 w-auto" />
            <span className="font-heading font-bold text-foreground">FinesseOS</span>
            <span className="text-foreground/40 text-xs" style={{ fontFamily: 'ui-monospace, monospace' }}>.pro</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            {['Dashboard', 'Pricing', 'Docs', 'Support'].map(link => (
              <a key={link} href="#" className="btn-text-link-footer">{link}</a>
            ))}
            <a href="/terms" className="btn-text-link-footer">Terms</a>
            <a href="/privacy" className="btn-text-link-footer">Privacy</a>
          </div>

          <div className="text-foreground/40 text-xs" style={{ fontFamily: 'ui-monospace, monospace' }}>
            © 2026 FinesseOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
