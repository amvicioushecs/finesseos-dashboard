// FINESSEOS PRO — Public Landing Page
// Design: Terminal-Noir OS / High-conversion affiliate intelligence platform
// ============================================================

import { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRight,
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
  ChevronLeft,
  ChevronRight,
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
      : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500'
  )}>
    <div className={cn(
      'w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all',
      accent ? 'bg-blue-600/20 group-hover:bg-blue-600/30' : 'bg-zinc-800 group-hover:bg-zinc-700'
    )}>
      <Icon className={cn('w-5 h-5', accent ? 'text-blue-400' : 'text-zinc-300 group-hover:text-white')} />
    </div>
    <h3 className="text-white font-bold text-sm mb-2 tracking-tight">{title}</h3>
    <p className="text-zinc-300 text-xs leading-relaxed">{description}</p>
  </div>
);

// ─── Features Carousel ──────────────────────────────────
const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI Does the Research',
    description: 'Paste your link. Get keywords, buyer personas, marketing angles, and content ideas — all in seconds. No research required.',
    accent: true,
  },
  {
    icon: Shield,
    title: 'Compliance on Autopilot',
    description: 'AI writes your FTC disclosures and checks platform rules automatically. You stay protected without thinking about it.',
    accent: false,
  },
  {
    icon: Layers,
    title: 'Your Files, All in One Place',
    description: 'Drag and drop your banners, images, and copy into each campaign. No more hunting through Google Drive or your desktop.',
    accent: false,
  },
  {
    icon: Target,
    title: 'Know Where to Promote',
    description: 'AI tells you exactly which platforms — TikTok, YouTube, Instagram, email — will work best for each affiliate program.',
    accent: false,
  },
  {
    icon: Users,
    title: 'Know Exactly Who to Target',
    description: 'Get 4 detailed buyer personas per campaign — who they are, what they want, and how to talk to them on each platform.',
    accent: false,
  },
  {
    icon: TrendingUp,
    title: 'See All Your Campaigns at Once',
    description: "One dashboard to see all your keywords, personas, and strategies across every affiliate program you're running.",
    accent: false,
  },
  {
    icon: Link2,
    title: 'One Link = One Campaign Workspace',
    description: 'Every affiliate link gets its own organized workspace with everything you need to promote it successfully.',
    accent: false,
  },
  {
    icon: FileText,
    title: 'Content Ideas Ready to Go',
    description: "Get 6 content ideas per campaign — hooks, angles, and formats already tailored to the platforms you're targeting.",
    accent: false,
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your nodes, your data. Enterprise-grade security with per-user isolation. Nothing shared, nothing leaked.',
    accent: false,
  },
];

const SLIDES_PER_VIEW = 3;

const FeaturesCarousel = () => {
  const [current, setCurrent] = useState(0);
  const total = FEATURES.length;
  const maxIndex = total - SLIDES_PER_VIEW;

  // Auto-advance every 4 seconds, pause on hover
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent(c => (c >= maxIndex ? 0 : c + 1));
    }, 4000);
    return () => clearInterval(id);
  }, [paused, maxIndex]);

  const prev = () => setCurrent(c => (c <= 0 ? maxIndex : c - 1));
  const next = () => setCurrent(c => (c >= maxIndex ? 0 : c + 1));

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 text-[35px]" style={{ fontFamily: "'Inter', sans-serif" }}>Features</p>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Everything you need to win.
        </h2>
        <p className="text-zinc-200 text-lg mt-4 max-w-xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
          FinesseOS handles the research, compliance, and organization — so you can focus on promoting.
        </p>
      </div>

      {/* Carousel track */}
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

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
          aria-label="Previous feature"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === current
                  ? 'w-6 h-2 bg-blue-500'
                  : 'w-2 h-2 bg-zinc-600 hover:bg-zinc-400'
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
          aria-label="Next feature"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

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
    <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm font-mono group-hover:bg-blue-600/20 transition-all">
      {number}
    </div>
    <div className="pt-1">
      <h3 className="text-white font-bold text-sm mb-1.5">{title}</h3>
      <p className="text-zinc-300 text-xs leading-relaxed">{description}</p>
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
      : 'bg-zinc-900 border-zinc-700'
  )}>
    {highlighted && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full font-mono">
        Most Popular
      </div>
    )}
    <div className="mb-6">
      <p className="text-zinc-300 text-[10px] font-black uppercase tracking-widest font-mono mb-2">{plan}</p>
      <div className="flex items-end gap-1">
        <span className="text-4xl font-black text-white tracking-tighter">{price}</span>
        {period && <span className="text-zinc-300 text-sm mb-1.5">{period}</span>}
      </div>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <CheckCircle2 className={cn('w-4 h-4 shrink-0 mt-0.5', highlighted ? 'text-blue-400' : 'text-zinc-400')} />
          <span className="text-zinc-200 text-xs">{f}</span>
        </li>
      ))}
    </ul>
    <a
      href={getLoginUrl()}
      className={cn(
        'block w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-center transition-all active:scale-95 font-mono',
        highlighted
          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25'
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600'
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
    <div className="min-h-screen text-zinc-200" style={{ fontFamily: "'Space Grotesk', sans-serif", backgroundColor: '#0f1117' }}>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-zinc-800" style={{backgroundColor: '#1a1918'}}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/94821429/gUEtbVDJTcocGKPG.png"
              alt="FinesseOS"
              style={{
                height: '75px',
                width: '75px',
                mixBlendMode: 'screen',
                filter: 'drop-shadow(0 0 12px rgba(96,165,250,0.6)) brightness(1.15) contrast(1.05)',
                transition: 'filter 0.2s',
              }}
              className="group-hover:brightness-125"
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-zinc-300 hover:text-white text-sm transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-zinc-300 hover:text-white text-sm transition-colors font-medium">How It Works</a>
            <a href="#pricing" className="text-zinc-300 hover:text-white text-sm transition-colors font-medium">Pricing</a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href={loginUrl} className="text-zinc-200 hover:text-white text-sm transition-colors px-4 py-2 font-medium">
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
            className="md:hidden p-2 text-zinc-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-zinc-800 px-6 py-6 space-y-4">
            <a href="#features" className="block text-zinc-200 hover:text-white py-2 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-zinc-200 hover:text-white py-2 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" className="block text-zinc-200 hover:text-white py-2 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href={loginUrl} className="block w-full py-3 bg-blue-600 text-white text-center font-bold rounded-xl mt-2">Enter the OS</a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16" style={{background: 'linear-gradient(to right, #1f2b2e, #25253c, #0a0a0f)'}}>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-600/10 text-blue-300 text-xs font-bold uppercase tracking-widest font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            For Affiliate Marketers
          </div>

          {/* Main headline */}
          <h1 className="font-black text-white tracking-tighter leading-[0.9] mb-8 text-[64px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            You paste an affiliate link.
            <br />
            <span className="text-blue-400">We build your whole campaign.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-zinc-200 text-xl sm:text-2xl mb-4 max-w-2xl mx-auto leading-relaxed font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
            FinesseOS is the AI system built for affiliate marketers.
          </p>
          <p className="text-zinc-300 text-base sm:text-lg mb-12 max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Paste your link. Get keywords, buyer personas, content ideas, platform strategy, and FTC compliance — all in seconds. No research. No guessing.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href={loginUrl}
              className="flex items-center gap-3 px-10 py-4 text-white font-black rounded-2xl transition-all active:scale-95 text-base hover:brightness-110"
              style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%)', boxShadow: '0 0 60px rgba(124,58,237,0.4), 0 4px 20px rgba(0,0,0,0.4)' }}
            >
              <Zap className="w-5 h-5 fill-white" />
              Start Free — Paste Your First Link
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="text-zinc-300 text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
              No credit card · Free forever plan
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-zinc-800">
            {[
              { value: '10', label: 'Keywords per campaign' },
              { value: '4', label: 'Buyer personas built' },
              { value: '5', label: 'Platforms ranked' },
              { value: '100%', label: 'FTC compliant' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black text-white tracking-tighter">{stat.value}</div>
                <div className="text-zinc-300 text-xs font-medium mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem Section ── */}
      <section className="py-24 px-6 border-t border-zinc-800" style={{ backgroundColor: '#0f1117' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 text-[35px]" style={{ fontFamily: "'Inter', sans-serif" }}>The Problem</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Affiliate marketing is hard work.<br />It doesn't have to be.
            </h2>
            <p className="text-zinc-200 text-lg max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Most affiliate marketers waste hours every week doing research that AI can do in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                text: 'You spend hours researching keywords and audiences — only to guess wrong and waste money on ads.',
                highlight: true,
              },
              {
                icon: '⚠️',
                text: 'You get flagged or banned because you forgot an FTC disclosure or broke a platform rule.',
                highlight: false,
              },
              {
                icon: '📁',
                text: 'Your banners, copy, and links are scattered across 5 different apps. Nothing is organized.',
                highlight: false,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  'p-6 rounded-2xl border',
                  item.highlight
                    ? 'bg-blue-600/10 border-blue-500/30'
                    : 'bg-zinc-900 border-zinc-700'
                )}
              >
                <div className={cn(
                  'text-[10px] font-mono font-black mb-3',
                  item.highlight ? 'text-blue-400' : 'text-zinc-300'
                )} style={{color: '#50a2ff'}}>
                  {item.icon}
                </div>
                <p className={cn('text-sm leading-relaxed font-medium', item.highlight ? 'text-zinc-100' : 'text-zinc-200')} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-zinc-800" style={{ backgroundColor: '#0c0f18' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 text-[35px]" style={{ fontFamily: "'Inter', sans-serif" }}>How It Works</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Three steps. That's it.
            </h2>
            <p className="text-zinc-200 text-lg mt-4 max-w-xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
              No setup. No learning curve. Just paste and go.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Paste your affiliate link"
              description="Copy your affiliate URL from any program — ClickBank, Amazon, ShareASale, ClickFunnels, anything. Paste it in."
            />
            <StepCard
              number="02"
              title="AI builds your campaign"
              description="In seconds, AI researches the brand, finds your best keywords, builds buyer personas, writes your FTC disclosure, and ranks your best platforms."
            />
            <StepCard
              number="03"
              title="Promote with confidence"
              description="Use your tracked link to send traffic. Watch clicks roll in. Everything you need to promote is in one organized workspace."
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 border-t border-zinc-800" style={{ backgroundColor: '#0f1117' }}>
        <FeaturesCarousel />      
      </section>

      {/* ── Social Proof ── */}
      <section className="py-24 px-6 border-t border-zinc-800" style={{ backgroundColor: '#0c0f18' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 text-[35px]" style={{ fontFamily: "'Inter', sans-serif" }}>What You Get Per Campaign</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-16" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Every link. Fully loaded.</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 10, suffix: '', label: 'Keywords per node', desc: 'Targeted, intent-based' },
              { value: 4, suffix: '', label: 'Buyer personas', desc: 'Per campaign, AI-built' },
              { value: 5, suffix: '', label: 'Target platforms', desc: 'Ranked by fit score' },
              { value: 100, suffix: '%', label: 'FTC compliant', desc: 'Every node, every time' },
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-zinc-900 border border-zinc-700 rounded-2xl hover:border-blue-500/30 transition-all">
                <div className="text-4xl font-black text-white tracking-tighter mb-1">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-bold text-zinc-100 mb-1">{stat.label}</div>
                <div className="text-xs text-zinc-300 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-t border-zinc-800" style={{ backgroundColor: '#0f1117' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 text-[35px]" style={{ fontFamily: "'Inter', sans-serif" }}>Pricing</p>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Start free. Upgrade when you're ready.</h2>
            <p className="text-zinc-200 text-base mt-4 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>No credit card required to get started.</p>
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
      <section className="py-32 px-6 border-t border-zinc-800 relative overflow-hidden" style={{ backgroundColor: '#0c0f18' }}>
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
          <p className="text-zinc-100 text-xl mb-4 max-w-xl mx-auto leading-relaxed font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
            Paste your first affiliate link. Get your full campaign in seconds.
          </p>
          <p className="text-zinc-300 text-base mb-12 max-w-lg mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
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
          <p className="text-zinc-300 text-sm mt-6" style={{ fontFamily: "'Inter', sans-serif" }}>Free plan available · No credit card required</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 py-12 px-6" style={{ backgroundColor: '#090b12' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/94821429/dJARocsDyCOAfmoM.png"
                alt="FinesseOS"
                className="w-8 h-8 rounded-lg"
                style={{ mixBlendMode: 'screen', filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.5))' }}
              />
              <span className="text-white font-black tracking-tighter">FinesseOS</span>
              <span className="text-zinc-400 font-mono text-xs">.pro</span>
            </div>

            <div className="flex items-center gap-6 flex-wrap justify-center">
              {['Dashboard', 'Pricing', 'Docs', 'Support'].map(link => (
                <a key={link} href="#" className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors font-mono">
                  {link}
                </a>
              ))}
              <a href="/terms" className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors font-mono">Terms</a>
              <a href="/privacy" className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors font-mono">Privacy</a>
            </div>

            <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>© 2026 FinesseOS. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
