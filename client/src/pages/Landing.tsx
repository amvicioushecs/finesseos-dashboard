// FINESSEOS PRO — Public Landing Page
// Design: Terminal-Noir OS / High-conversion affiliate intelligence platform
// ============================================================

import { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Shield,
  BrainCircuit,
  Layers,
  Target,
  Sparkles,
  Globe,
  TrendingUp,
  Users,
  FileText,
  Link2,
  Lock,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { getLoginUrl } from '@/const';
import { useAuth } from '@/_core/hooks/useAuth';

// ─── Utility ──────────────────────────────────────────────
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// ─── Animated Counter ─────────────────────────────────────
const Counter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// ─── Feature Card ─────────────────────────────────────────
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent?: boolean;
}) => (
  <div className={cn(
    'relative p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1',
    accent
      ? 'bg-blue-600/10 border-blue-500/30 hover:border-blue-500/60'
      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
  )}>
    <div className={cn(
      'w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all',
      accent ? 'bg-blue-600/20 group-hover:bg-blue-600/30' : 'bg-zinc-900 group-hover:bg-zinc-800'
    )}>
      <Icon className={cn('w-5 h-5', accent ? 'text-blue-400' : 'text-zinc-400 group-hover:text-white')} />
    </div>
    <h3 className="text-white font-bold text-sm mb-2 tracking-tight">{title}</h3>
    <p className="text-zinc-500 text-xs leading-relaxed">{description}</p>
  </div>
);

// ─── Step Card ────────────────────────────────────────────
const StepCard = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="flex gap-5 group">
    <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm font-mono group-hover:bg-blue-600/20 transition-all">
      {number}
    </div>
    <div className="pt-1">
      <h3 className="text-white font-bold text-sm mb-1.5">{title}</h3>
      <p className="text-zinc-500 text-xs leading-relaxed">{description}</p>
    </div>
  </div>
);

// ─── Pricing Card ─────────────────────────────────────────
const PricingCard = ({
  plan,
  price,
  period,
  features,
  cta,
  highlighted = false,
}: {
  plan: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}) => (
  <div className={cn(
    'relative p-8 rounded-3xl border transition-all duration-300',
    highlighted
      ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_60px_rgba(37,99,235,0.15)]'
      : 'bg-zinc-950 border-zinc-800'
  )}>
    {highlighted && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full font-mono">
        Most Popular
      </div>
    )}
    <div className="mb-6">
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest font-mono mb-2">{plan}</p>
      <div className="flex items-end gap-1">
        <span className="text-4xl font-black text-white tracking-tighter">{price}</span>
        {period && <span className="text-zinc-600 text-sm mb-1.5">{period}</span>}
      </div>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <CheckCircle2 className={cn('w-4 h-4 shrink-0 mt-0.5', highlighted ? 'text-blue-400' : 'text-zinc-600')} />
          <span className="text-zinc-400 text-xs">{f}</span>
        </li>
      ))}
    </ul>
    <a
      href={getLoginUrl()}
      className={cn(
        'block w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-center transition-all active:scale-95 font-mono',
        highlighted
          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25'
          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
      )}
    >
      {cta}
    </a>
  </div>
);

// ─── Main Landing Page ─────────────────────────────────────
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

  return (
    <div className="min-h-screen bg-black text-zinc-300" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-zinc-900' : 'bg-transparent'
      )}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-all group-hover:scale-110" style={{ boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-white font-black tracking-tighter text-lg">FinesseOS</span>
            <span className="text-zinc-700 font-mono text-xs">.pro</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-zinc-500 hover:text-white text-sm transition-colors">Features</a>
            <a href="#how-it-works" className="text-zinc-500 hover:text-white text-sm transition-colors">How It Works</a>
            <a href="#pricing" className="text-zinc-500 hover:text-white text-sm transition-colors">Pricing</a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href={loginUrl} className="text-zinc-400 hover:text-white text-sm transition-colors px-4 py-2">
              Sign In
            </a>
            <a
              href={loginUrl}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
              style={{ boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}
            >
              Enter the OS
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-zinc-900 px-6 py-6 space-y-4">
            <a href="#features" className="block text-zinc-400 hover:text-white py-2 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-zinc-400 hover:text-white py-2 transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" className="block text-zinc-400 hover:text-white py-2 transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href={loginUrl} className="block w-full py-3 bg-blue-600 text-white text-center font-bold rounded-xl mt-2">Enter the OS</a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/3 rounded-full blur-[80px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Official Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/94821429/gUEtbVDJTcocGKPG.png"
              alt="FinesseOS"
              className="w-auto"
              style={{
                height: '430px',
                mixBlendMode: 'screen',
                filter: 'drop-shadow(0 0 60px rgba(96,165,250,0.5)) drop-shadow(0 0 120px rgba(139,92,246,0.3)) brightness(1.1) contrast(1.05)',
                marginBottom: '-110px',
                width: '452px',
              }}
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-[11px] font-mono text-zinc-500 mb-8 hover:border-blue-500/30 transition-all">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            AI-Powered Affiliate Intelligence Platform
            <ChevronRight className="w-3 h-3" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            The Affiliate
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)' }}>
              Intelligence OS
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Paste a link. Get a complete campaign.
          </p>
          <p className="text-sm text-zinc-600 max-w-xl mx-auto mb-12 leading-relaxed">
            FinesseOS turns your affiliate links into fully-researched campaign nodes — with AI-generated keywords, buyer personas, marketing angles, compliance checks, and a built-in asset vault. Everything in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href={loginUrl}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all active:scale-95 text-sm"
              style={{ boxShadow: '0 0 40px rgba(37,99,235,0.4)' }}
            >
              <Zap className="w-4 h-4 fill-white" />
              Enter the OS
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-bold rounded-2xl transition-all border border-zinc-800 hover:border-zinc-700 text-sm"
            >
              See How It Works
            </a>
          </div>

          {/* Stats bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-8 py-5 bg-zinc-950/80 border border-zinc-800 rounded-2xl backdrop-blur-md">
            {[
              { value: 10, suffix: '', label: 'Keywords per node' },
              { value: 4, suffix: '', label: 'Buyer personas' },
              { value: 5, suffix: '', label: 'Target platforms' },
              { value: 0, suffix: ' tabs', label: 'Needed outside FinesseOS' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black text-white tracking-tighter">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem Section ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
              Affiliate marketing is fragmented.
              <br />
              <span className="text-blue-400">FinesseOS fixes that.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '01', text: 'You paste a link and stare at a blank screen — no strategy, no direction.' },
              { icon: '02', text: 'You research keywords in one tab, build personas in another, write copy in a third.' },
              { icon: '03', text: 'You forget FTC disclosures until it\'s too late and your account gets flagged.' },
              { icon: '04', text: 'Your assets — banners, copy, images — are scattered across Drive, Notion, and your desktop.' },
              { icon: '05', text: 'You have no system. Just chaos. And chaos doesn\'t scale.' },
              { icon: '→', text: 'FinesseOS eliminates every one of these problems with a single, intelligent workflow.', highlight: true },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  'p-5 rounded-2xl border transition-all',
                  item.highlight
                    ? 'bg-blue-600/10 border-blue-500/30 col-span-1'
                    : 'bg-zinc-950 border-zinc-800'
                )}
              >
                <div className={cn(
                  'text-[10px] font-mono font-black mb-3',
                  item.highlight ? 'text-blue-400' : 'text-zinc-700'
                )}>
                  {item.icon}
                </div>
                <p className={cn('text-sm leading-relaxed', item.highlight ? 'text-zinc-300' : 'text-zinc-500')}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">The System</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
              One link. One node.
              <br />
              <span className="text-blue-400">Everything you need.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              {[
                {
                  number: '01',
                  title: 'Paste your affiliate link',
                  description: 'FinesseOS identifies the program, brand, category, and commission structure automatically — no manual input required.',
                },
                {
                  number: '02',
                  title: 'AI builds the intelligence package',
                  description: '10 targeted keywords, 4 buyer personas, a marketing angle, 6 content ideas, 5 target platforms, and an FTC-compliant disclosure. Generated in seconds.',
                },
                {
                  number: '03',
                  title: 'Compliance is automatic',
                  description: 'Every node gets a compliance scan. FTC rules, disclosure language, and platform-specific guidelines are pre-loaded and reviewed by AI.',
                },
                {
                  number: '04',
                  title: 'Your asset vault lives inside the node',
                  description: 'Drag and drop banners, images, copy, and videos directly into the campaign node. Everything for that campaign, in one place.',
                },
                {
                  number: '05',
                  title: 'The Intelligence Hub aggregates everything',
                  description: 'See all your keywords, personas, and strategies across every campaign from a single command view.',
                },
              ].map((step, i) => (
                <StepCard key={i} {...step} />
              ))}
            </div>

            {/* Visual mockup */}
            <div className="sticky top-24">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4" style={{ boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}>
                {/* Fake node card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Shopify Affiliate</p>
                      <p className="text-zinc-600 text-[10px] font-mono">E-Commerce · 20% commission</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-mono">ACTIVE</div>
                </div>

                <div className="h-px bg-zinc-800" />

                {/* Intelligence preview */}
                <div>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">AI Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['shopify store', 'ecommerce 2025', 'dropshipping guide', 'online store setup', 'shopify vs wix'].map(kw => (
                      <span key={kw} className="px-2 py-1 bg-black border border-zinc-800 text-zinc-500 text-[10px] rounded-lg font-mono">{kw}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Marketing Angle</p>
                  <p className="text-zinc-400 text-xs italic leading-relaxed">"The fastest path from idea to first sale — without the technical headaches."</p>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Compliance</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px] font-mono">FTC Scan Passed · Disclosure Ready</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-mono font-black uppercase tracking-widest text-center">
                    Node Active — Intelligence Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
              Built for the affiliate marketer
              <br />
              <span className="text-blue-400">who moves with intention.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={BrainCircuit}
              title="AI Intelligence Engine"
              description="Keywords, personas, marketing angles, and content ideas — all generated from your affiliate link in seconds."
              accent
            />
            <FeatureCard
              icon={Shield}
              title="FTC Compliance Scanner"
              description="Automatic disclosure language and compliance rules per program. Never get flagged again."
            />
            <FeatureCard
              icon={Layers}
              title="Asset Vault"
              description="Drag-and-drop file storage inside every campaign node. Banners, images, copy, videos — all organized."
            />
            <FeatureCard
              icon={Target}
              title="Platform Targeting"
              description="AI identifies the best platforms for each program — TikTok, YouTube, Instagram, email, and more."
            />
            <FeatureCard
              icon={Users}
              title="Buyer Persona Builder"
              description="4 detailed buyer personas per campaign with pain points, hooks, and platform-specific messaging."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Intelligence Hub"
              description="Aggregated view of all keywords, personas, and strategies across every campaign from one command center."
            />
            <FeatureCard
              icon={Link2}
              title="Campaign Nodes"
              description="Each affiliate link becomes a structured, searchable workspace. Your entire operation, organized."
            />
            <FeatureCard
              icon={FileText}
              title="Content Suggestions"
              description="6 AI-generated content ideas per node — hooks, angles, and formats optimized for each target platform."
            />
            <FeatureCard
              icon={Lock}
              title="Secure & Private"
              description="Your nodes, your data. Enterprise-grade security with per-user isolation. Nothing shared, nothing leaked."
            />
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">By the Numbers</p>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-16">The numbers speak.</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 10, suffix: '', label: 'Keywords per node', desc: 'Targeted, intent-based' },
              { value: 4, suffix: '', label: 'Buyer personas', desc: 'Per campaign, AI-built' },
              { value: 5, suffix: '', label: 'Target platforms', desc: 'Ranked by fit score' },
              { value: 100, suffix: '%', label: 'FTC compliant', desc: 'Every node, every time' },
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-blue-500/20 transition-all">
                <div className="text-4xl font-black text-white tracking-tighter mb-1">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-bold text-zinc-300 mb-1">{stat.label}</div>
                <div className="text-[10px] text-zinc-600 font-mono">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">Simple. No games.</h2>
            <p className="text-zinc-500 text-sm mt-4">Start free. Scale when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard
              plan="Free"
              price="$0"
              period=""
              features={[
                '3 campaign nodes',
                'Basic AI intelligence',
                'FTC compliance scan',
                'Community support',
              ]}
              cta="Start Free"
            />
            <PricingCard
              plan="Pro"
              price="$29"
              period="/mo"
              features={[
                'Unlimited nodes',
                'Full AI intelligence engine',
                'Asset vault (S3 storage)',
                'Advanced compliance scanner',
                'Intelligence Hub',
                'Priority support',
              ]}
              cta="Start Pro"
              highlighted
            />
            <PricingCard
              plan="Agency"
              price="$99"
              period="/mo"
              features={[
                'Everything in Pro',
                'Team access (5 seats)',
                'White-label nodes',
                'API access',
                'Dedicated support',
              ]}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-32 px-6 border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-6">
            Stop guessing.
            <br />
            <span className="text-blue-400">Start operating.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Every affiliate marketer who uses FinesseOS stops asking "what do I do with this link?" and starts executing. The system does the research. You do the work.
          </p>
          <a
            href={loginUrl}
            className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl transition-all active:scale-95"
            style={{ boxShadow: '0 0 60px rgba(37,99,235,0.4)' }}
          >
            <Zap className="w-5 h-5 fill-white" />
            Launch FinesseOS
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-zinc-700 text-xs mt-6 font-mono">No credit card required · Free plan available</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-900 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-white font-black tracking-tighter">FinesseOS</span>
              <span className="text-zinc-700 font-mono text-xs">.pro</span>
            </div>

            <div className="flex items-center gap-8">
              {['Dashboard', 'Pricing', 'Docs', 'Support'].map(link => (
                <a key={link} href="#" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors font-mono">
                  {link}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 text-zinc-700 text-xs font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>© 2026 FinesseOS. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
