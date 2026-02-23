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

          {/* Who it's for badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 border border-blue-500/30 rounded-full mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-blue-300 font-semibold text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>For Affiliate Marketers</span>
          </div>

          {/* Headline — crystal clear, large, bright */}
          <h1
            className="font-black text-white leading-tight tracking-tight mb-6"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              lineHeight: 1.05,
              textShadow: '0 0 60px rgba(255,255,255,0.08)',
            }}
          >
            You paste an affiliate link.
            <br />
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              We build your whole campaign.
            </span>
          </h1>

          {/* Sub-headline — plain, direct, bright */}
          <p
            className="text-zinc-200 max-w-2xl mx-auto mb-5 leading-relaxed font-medium"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)' }}
          >
            FinesseOS is the tool for affiliate marketers who are tired of guessing.
            Paste your link — AI instantly gives you keywords, buyer personas,
            marketing angles, FTC compliance, and a place to store all your assets.
          </p>

          {/* Simple value prop line */}
          <p
            className="text-zinc-400 max-w-lg mx-auto mb-12 text-base"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            No more 10 open tabs. No more scattered files. Just one link → one complete campaign.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href={loginUrl}
              className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-95"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', boxShadow: '0 0 60px rgba(37,99,235,0.5), 0 4px 24px rgba(0,0,0,0.4)' }}
            >
              <Zap className="w-5 h-5 fill-white" />
              Start Free — Try It Now
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-8 py-5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all border border-zinc-700 hover:border-zinc-500"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem' }}
            >
              See How It Works
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Stats bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-8 sm:gap-12 px-10 py-6 bg-zinc-900/80 border border-zinc-700 rounded-2xl backdrop-blur-md">
            {[
              { value: 10, suffix: '', label: 'Keywords Generated' },
              { value: 4, suffix: '', label: 'Buyer Personas Built' },
              { value: 5, suffix: '', label: 'Best Platforms Ranked' },
              { value: 0, suffix: ' tabs', label: 'Extra Tools Needed' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-zinc-400 font-semibold mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem Section ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>The Problem</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Sound familiar?
              <br />
              <span className="text-blue-400">FinesseOS fixes all of this.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '01', text: 'You get an affiliate link and have no idea where to start.' },
              { icon: '02', text: 'You have 10 tabs open — keywords here, personas there, copy somewhere else.' },
              { icon: '03', text: 'You forget FTC disclosures and risk getting your account banned.' },
              { icon: '04', text: 'Your banners, images, and copy are scattered everywhere — impossible to find.' },
              { icon: '05', text: 'You have no system. You\'re just winging it. And that doesn\'t scale.' },
              { icon: '→', text: 'FinesseOS gives you one place for everything. Paste a link — get a complete campaign, instantly.', highlight: true },
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
                <p className={cn('text-sm leading-relaxed font-medium', item.highlight ? 'text-zinc-200' : 'text-zinc-300')} style={{ fontFamily: "'Inter', sans-serif" }}>
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
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>How It Works</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              3 steps. That's it.
              <br />
              <span className="text-blue-400">You'll be set up in under 2 minutes.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              {[
                {
                  number: '01',
                  title: 'Paste your affiliate link',
                  description: 'Just drop in your link. FinesseOS figures out the program, the brand, and the commission rate automatically.',
                },
                {
                  number: '02',
                  title: 'AI does all the research for you',
                  description: 'In seconds, you get 10 keywords to target, 4 buyer personas, a marketing angle, 6 content ideas, and the top 5 platforms to promote on.',
                },
                {
                  number: '03',
                  title: 'Compliance is handled automatically',
                  description: 'FTC rules, disclosure language, platform guidelines — AI checks all of it so you never get flagged or banned.',
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
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Everything Included</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Everything you need to make money
              <br />
              <span className="text-blue-400">with any affiliate program.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={BrainCircuit}
              title="AI Does the Research"
              description="Paste your link. Get keywords, buyer personas, marketing angles, and content ideas — all in seconds. No research required."
              accent
            />
            <FeatureCard
              icon={Shield}
              title="Compliance on Autopilot"
              description="AI writes your FTC disclosures and checks platform rules automatically. You stay protected without thinking about it."
            />
            <FeatureCard
              icon={Layers}
              title="Your Files, All in One Place"
              description="Drag and drop your banners, images, and copy into each campaign. No more hunting through Google Drive or your desktop."
            />
            <FeatureCard
              icon={Target}
              title="Know Where to Promote"
              description="AI tells you exactly which platforms — TikTok, YouTube, Instagram, email — will work best for each affiliate program."
            />
            <FeatureCard
              icon={Users}
              title="Know Exactly Who to Target"
              description="Get 4 detailed buyer personas per campaign — who they are, what they want, and how to talk to them on each platform."
            />
            <FeatureCard
              icon={TrendingUp}
              title="See All Your Campaigns at Once"
              description="One dashboard to see all your keywords, personas, and strategies across every affiliate program you're running."
            />
            <FeatureCard
              icon={Link2}
              title="One Link = One Campaign Workspace"
              description="Every affiliate link gets its own organized workspace with everything you need to promote it successfully."
            />
            <FeatureCard
              icon={FileText}
              title="Content Ideas Ready to Go"
              description="Get 6 content ideas per campaign — hooks, angles, and formats already tailored to the platforms you're targeting."
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
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>What You Get Per Campaign</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-16" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Every link. Fully loaded.</h2>

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
                <div className="text-xs text-zinc-400 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Pricing</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Start free. Upgrade when you're ready.</h2>
            <p className="text-zinc-300 text-base mt-4 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>No credit card required to get started.</p>
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Stop guessing.
            <br />
            <span className="text-blue-400">Start making money.</span>
          </h2>
          <p className="text-zinc-200 text-xl mb-4 max-w-xl mx-auto leading-relaxed font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
            Paste your first affiliate link. Get your full campaign in seconds.
          </p>
          <p className="text-zinc-400 text-base mb-12 max-w-lg mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            No more guessing. No more scattered files. No more getting flagged.
            Just a clear system that tells you exactly what to do.
          </p>
          <a
            href={loginUrl}
            className="inline-flex items-center gap-3 px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-95"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.15rem', boxShadow: '0 0 80px rgba(37,99,235,0.5), 0 4px 30px rgba(0,0,0,0.5)' }}
          >
            <Zap className="w-5 h-5 fill-white" />
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-zinc-500 text-sm mt-6" style={{ fontFamily: "'Inter', sans-serif" }}>Free plan available · No credit card required</p>
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
