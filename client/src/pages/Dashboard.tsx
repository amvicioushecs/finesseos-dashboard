// ============================================================
// FINESSEOS PRO — Main Dashboard Page
// Design: Terminal-Noir OS / Affiliate Intelligence Platform
// Layout: Fixed 320px sidebar + main content area
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { trpc } from '@/lib/trpc';
import {
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Copy,
  Search,
  Plus,
  ArrowUpRight,
  Settings,
  FolderOpen,
  Zap,
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  X,
  Activity,
  RefreshCw,
  Fingerprint,
  Target,
  Sparkles,
  Newspaper,
  BrainCircuit,
  Clock,
  UserCheck,
  Megaphone,
  Cpu,
  Key,
  Lock,
  Bell,
  Trash2,
  TrendingUp,
  Globe,
  ChevronRight,
  Info,
  Layers,
  Tag,
  BarChart2,
  Link2,
  Upload,
  PlusCircle,
  Plug,
  Webhook,
  Mail,
  BarChart3,
  ShoppingCart,
  Share2,
  CheckCheck,
  XCircle,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { initialLinks, systemNodes, apiIntegrations, intelligenceNews, type AffiliateLink, type Asset } from '@/lib/data';

const genId = () => Math.random().toString(36).slice(2, 8);

// ─── Types ────────────────────────────────────────────────
type ActiveTab = 'dashboard' | 'vault' | 'intelligence' | 'integrations' | 'settings';

// ─── Utility ──────────────────────────────────────────────
const copyToClipboard = (text: string, label = 'Copied') => {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  });
  toast.success(label, {
    description: 'Secured to clipboard',
    duration: 2500,
  });
};

// ─── Sub-components ───────────────────────────────────────

const NavItem = ({ icon: Icon, label, active, onClick }: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 group relative ${
      active
        ? 'bg-blue-600 text-white fos-nav-active scale-[1.02]'
        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
    }`}
  >
    {active && (
      <div className="absolute left-0 w-1.5 h-7 bg-white rounded-r-full shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
    )}
    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="text-[11px] font-black uppercase tracking-[0.3em] leading-none fos-mono">{label}</span>
  </button>
);

const MobileNavItem = ({ icon: Icon, label, active, onClick }: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-blue-500 scale-110' : 'text-zinc-300'}`}
  >
    <div className={`p-2.5 rounded-xl transition-all ${active ? 'bg-blue-500/10' : ''}`}>
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-[9px] font-black uppercase tracking-[0.2em] fos-mono">{label}</span>
  </button>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    alert: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    paused: 'bg-zinc-700/30 text-zinc-500 border-zinc-700/30',
    passed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Connected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Inactive: 'bg-zinc-700/30 text-zinc-500 border-zinc-700/30',
    optimal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest fos-mono ${map[status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
      {status}
    </span>
  );
};

const AssetIcon = ({ type }: { type: string }) => {
  const map: Record<string, React.ElementType> = {
    image: Layers,
    copy: FileText,
    video: Activity,
    banner: Tag,
  };
  const Icon = map[type] || FileText;
  return <Icon className="w-4 h-4" />;
};

// ─── Add Link Modal ────────────────────────────────────────
const AddLinkModal = ({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (link: AffiliateLink) => void;
}) => {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [generatedData, setGeneratedData] = useState<null | {
    brandName: string; category: string; platform: string; slug: string; commission: string;
    keywordResearch: string[]; marketingAngle: string;
    personas: { name: string; pain: string; hook: string; platform: string }[];
    contentSuggestions: string[]; targetPlatforms: string[]; strategyNotes: string;
    disclosure: string; complianceRules: string[]; complianceStatus: 'passed' | 'warning' | 'failed';
    // Brand assets from Brandfetch
    brandLogoUrl?: string | null; brandIconUrl?: string | null; brandPrimaryColor?: string | null;
    brandColors?: string[]; brandDescription?: string | null; brandIndustry?: string | null; brandDomain?: string | null;
  }>(null);

  const utils = trpc.useUtils();

  const createNodeMutation = trpc.nodes.create.useMutation({
    onSuccess: (node) => {
      utils.nodes.list.invalidate();
      if (node) {
        onAdd({
          id: node.id,
          brandName: node.brandName,
          slug: node.slug,
          platform: node.platform,
          destination: node.destination,
          status: node.status,
          clicks: node.clicks,
          earnings: node.earnings,
          commission: node.commission,
          category: node.category,
          createdAt: node.createdAt,
          compliance: node.compliance,
          assets: (node.assets ?? []).map(a => ({ ...a, type: a.type as import('@/lib/data').AssetType })),
          intelligence: node.intelligence,
          brandLogoUrl: node.brandLogoUrl,
          brandIconUrl: node.brandIconUrl,
          brandPrimaryColor: node.brandPrimaryColor,
          brandColors: node.brandColors,
          brandDescription: node.brandDescription,
          brandIndustry: node.brandIndustry,
          brandDomain: node.brandDomain,
        });
      }
      toast.success('Node Created', { description: `${node?.brandName} affiliate node is now live in your vault.` });
      onClose();
    },
    onError: (err) => {
      toast.error('Failed to save node', { description: err.message });
    },
  });

  const generateMutation = trpc.affiliate.generateIntelligence.useMutation({
    onSuccess: (data) => {
      setGeneratedData(data);
      setStep(2);
    },
    onError: (err) => {
      toast.error('Intelligence Scan Failed', { description: err.message || 'Please try again.' });
    },
  });

  const handleGenerate = () => {
    if (!destination) {
      toast.error('Missing URL', { description: 'Paste your affiliate link to continue.' });
      return;
    }
    try { new URL(destination); } catch {
      toast.error('Invalid URL', { description: 'Please enter a valid URL starting with https://' });
      return;
    }
    generateMutation.mutate({ url: destination });
  };

  const handleCreate = () => {
    if (!generatedData) return;
    createNodeMutation.mutate({
      brandName: generatedData.brandName,
      slug: generatedData.slug,
      platform: generatedData.platform,
      destination,
      status: 'active',
      clicks: '0',
      earnings: '$0',
      commission: generatedData.commission,
      category: generatedData.category,
      complianceDisclosure: generatedData.disclosure,
      complianceRules: generatedData.complianceRules,
      complianceStatus: generatedData.complianceStatus,
      complianceFtcNotes: 'AI compliance scan complete. Disclosure language meets FTC requirements.',
      keywordResearch: generatedData.keywordResearch,
      marketingAngle: generatedData.marketingAngle,
      personas: generatedData.personas,
      contentSuggestions: generatedData.contentSuggestions,
      targetPlatforms: generatedData.targetPlatforms,
      strategyNotes: generatedData.strategyNotes,
      brandLogoUrl: generatedData.brandLogoUrl ?? null,
      brandIconUrl: generatedData.brandIconUrl ?? null,
      brandPrimaryColor: generatedData.brandPrimaryColor ?? null,
      brandColors: generatedData.brandColors ?? [],
      brandDescription: generatedData.brandDescription ?? null,
      brandIndustry: generatedData.brandIndustry ?? null,
      brandDomain: generatedData.brandDomain ?? null,
    });
  };

  const isGenerating = generateMutation.isPending;
  const isSaving = createNodeMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isGenerating ? onClose : undefined} />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="fos-label text-blue-500 mb-2">Step {step} of 2</div>
            <h2 className="text-2xl font-black text-white tracking-tighter fos-heading">
              {step === 1 ? 'Create Node' : 'Intelligence Preview'}
            </h2>
          </div>
          <button onClick={onClose} disabled={isGenerating} className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all disabled:opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            {/* URL-first: just paste the link */}
            <div>
              <label className="fos-label block mb-2">Affiliate Link URL</label>
              <input
                type="url"
                placeholder="https://youraffiliatelink.com/ref=..."
                value={destination}
                onChange={e => setDestination(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isGenerating && handleGenerate()}
                disabled={isGenerating}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors fos-mono disabled:opacity-50"
              />
              <p className="text-[11px] text-zinc-400 mt-2 fos-mono">Paste your affiliate link — AI will research the program and build the full intelligence package automatically.</p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !destination}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 fos-glow-blue"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running AI Intelligence Scan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Node Intelligence
                </>
              )}
            </button>

            {isGenerating && (
              <div className="space-y-2">
                {[
                  { label: 'Identifying affiliate program...', delay: 0 },
                  { label: 'Researching keywords & search intent...', delay: 1 },
                  { label: 'Building buyer personas...', delay: 2 },
                  { label: 'Crafting marketing angles...', delay: 3 },
                  { label: 'Running FTC compliance scan...', delay: 4 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[11px] text-zinc-500 fos-mono animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${item.delay * 0.4}s` }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : generatedData ? (
          <div className="space-y-4">
            {/* Compliance status */}
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${
              generatedData.complianceStatus === 'passed'
                ? 'bg-emerald-500/5 border border-emerald-500/20'
                : generatedData.complianceStatus === 'warning'
                ? 'bg-amber-500/5 border border-amber-500/20'
                : 'bg-rose-500/5 border border-rose-500/20'
            }`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${
                generatedData.complianceStatus === 'passed' ? 'text-emerald-400' : generatedData.complianceStatus === 'warning' ? 'text-amber-400' : 'text-rose-400'
              }`} />
              <div>
                <p className={`text-xs font-black uppercase tracking-widest fos-mono ${
                  generatedData.complianceStatus === 'passed' ? 'text-emerald-400' : generatedData.complianceStatus === 'warning' ? 'text-amber-400' : 'text-rose-400'
                }`}>Compliance: {generatedData.complianceStatus.toUpperCase()}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 fos-mono">{generatedData.disclosure}</p>
              </div>
            </div>

            {/* Intelligence summary */}
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <p className="fos-label text-blue-400">Intelligence Generated</p>
                <span className="text-[10px] text-blue-500 fos-mono bg-blue-500/10 px-2 py-0.5 rounded-full">{generatedData.brandName}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Target className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><span className="text-white font-bold">{generatedData.keywordResearch.length}</span> keywords researched for <span className="text-white font-bold">{generatedData.platform}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><span className="text-white font-bold">{generatedData.personas.length}</span> buyer personas built</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Megaphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="line-clamp-1">Angle: <span className="text-white font-bold">{generatedData.marketingAngle.slice(0, 60)}...</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><span className="text-white font-bold">{generatedData.contentSuggestions.length}</span> content ideas generated</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Platforms: <span className="text-white font-bold">{generatedData.targetPlatforms.slice(0, 3).join(', ')}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Commission: <span className="text-amber-400 font-bold">{generatedData.commission}</span></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setStep(1); setGeneratedData(null); }}
                className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all fos-mono"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving}
                className="py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 fos-mono flex items-center gap-2"
              >
                {isSaving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Saving...</> : 'Create Node'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── Dashboard Overview ────────────────────────────────────
const DashboardOverview = ({ links }: { links: AffiliateLink[] }) => {
  // Use real tracked clickCount if available, otherwise fall back to display string parsing
  const totalClicks = links.reduce((sum, l) => {
    if (l.clickCount !== undefined) return sum + l.clickCount;
    const n = parseFloat(l.clicks.replace('K', '').replace('k', '')) * (l.clicks.toLowerCase().includes('k') ? 1000 : 1);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const alertCount = links.filter(l => l.status === 'alert').length;
  const totalEarnings = links.reduce((sum, l) => {
    const n = parseFloat((l.earnings || '$0').replace('$', '').replace(',', ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const stats = [
    { label: 'Live Campaigns', value: links.length.toString(), color: 'text-blue-400', icon: Target, glow: 'shadow-blue-500/10' },
    { label: 'Total Clicks', value: totalClicks >= 1000 ? `${(totalClicks / 1000).toFixed(1)}K` : totalClicks.toString(), color: 'text-emerald-400', icon: Activity, glow: 'shadow-emerald-500/10' },
    { label: 'System Alerts', value: alertCount.toString(), color: alertCount > 0 ? 'text-rose-400' : 'text-zinc-500', icon: AlertCircle, glow: 'shadow-rose-500/10' },
    { label: 'Est. Earnings', value: `$${totalEarnings.toLocaleString()}`, color: 'text-amber-400', icon: TrendingUp, glow: 'shadow-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`fos-card p-6 shadow-xl ${stat.glow}`}>
            <div className="flex justify-between items-start mb-4">
              <p className="fos-label">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-40`} />
            </div>
            <h3 className={`text-3xl font-black tracking-tighter fos-heading ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24 lg:pb-0">
        {/* Action Feed */}
        <div className="lg:col-span-2">
          <div className="fos-card overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="fos-pulse-dot" />
                <span className="fos-label text-zinc-300">Inevitable_Action_Feed</span>
              </div>
              <span className="fos-label text-zinc-400">Live</span>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {links.filter(l => l.status === 'alert').map(link => (
                <div key={link.id} className="px-6 py-5 flex items-center justify-between hover:bg-zinc-900/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                      <AlertCircle className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight leading-none">{link.slug}</p>
                      <p className="fos-label text-rose-500/70 mt-1.5">Redirect failure — URL returning 404</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-rose-500/10 text-rose-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-rose-500/20 fos-mono">
                    Alert
                  </span>
                </div>
              ))}
              <div className="px-6 py-5 flex items-center gap-4 bg-zinc-800/30">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tight leading-none">All active nodes optimized</p>
                  <p className="fos-label text-emerald-500/60 mt-1.5">Intelligence sync active — NODE_SYNCED</p>
                </div>
              </div>
              {/* Recent activity */}
              {links.filter(l => l.status === 'active').slice(0, 2).map(link => (
                <div key={link.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-900/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{link.brandName} — {link.clicks} clicks</p>
                      <p className="fos-label text-zinc-400 mt-1">Campaign active on {link.platform}</p>
                    </div>
                  </div>
                  <span className="fos-label text-emerald-500">{link.earnings}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OS Metrics */}
        <div className="space-y-4">
          <div className="fos-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-tight">OS Metrics</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Global Latency', value: '42ms', color: 'text-white' },
                { label: 'Sync Status', value: 'NODE_SYNCED', color: 'text-emerald-400', mono: true },
                { label: 'Compliance Engine', value: 'ACTIVE', color: 'text-blue-400', mono: true },
                { label: 'AI Intelligence', value: 'ONLINE', color: 'text-emerald-400', mono: true },
              ].map((m, i) => (
                <div key={i} className="p-3.5 bg-zinc-800/60 border border-zinc-700 rounded-xl flex items-center justify-between">
                  <p className="fos-label">{m.label}</p>
                  <p className={`text-xs font-black ${m.color} ${m.mono ? 'fos-mono' : ''}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats per campaign */}
          <div className="fos-card p-6">
            <p className="fos-label mb-4">Top Performer</p>
            {links.sort((a, b) => {
              const ea = parseFloat((a.earnings || '$0').replace('$', '').replace(',', ''));
              const eb = parseFloat((b.earnings || '$0').replace('$', '').replace(',', ''));
              return eb - ea;
            }).slice(0, 1).map(link => (
              <div key={link.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="fos-pulse-dot" />
                  <span className="text-sm font-black text-white uppercase tracking-tight">{link.brandName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                    <p className="fos-label mb-1">Clicks</p>
                    <p className="text-lg font-black text-white">{link.clicks}</p>
                  </div>
                  <div className="p-3 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                    <p className="fos-label mb-1">Earnings</p>
                    <p className="text-lg font-black text-emerald-400">{link.earnings}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Campaign Vault ────────────────────────────────────────
const CampaignVault = ({
  links,
  searchQuery,
  onSelectLink,
  onAddLink,
  onDeleteLink,
}: {
  links: AffiliateLink[];
  searchQuery: string;
  onSelectLink: (link: AffiliateLink) => void;
  onAddLink: () => void;
  onDeleteLink: (link: AffiliateLink) => void;
}) => {
  const [pendingDelete, setPendingDelete] = useState<AffiliateLink | null>(null);
  const filtered = links.filter(l =>
    l.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter fos-heading">Campaign Vault</h2>
          <p className="fos-label text-zinc-400 mt-2 italic">Management_Organized_By_Endpoint</p>
        </div>
        <button
          onClick={onAddLink}
          className="flex items-center gap-3 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-95 fos-glow-blue fos-mono"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="fos-card p-16 text-center">
          <FolderOpen className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-300 font-bold uppercase tracking-widest text-sm fos-mono">No nodes found</p>
          <p className="text-zinc-400 text-xs mt-2">Add your first affiliate link to create a node</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(link => (
            <div
              key={link.id}
              className="fos-card fos-node-card p-7 group hover:border-blue-500/40 transition-all shadow-2xl"
            >
              {/* Delete button — top-right corner, visible on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); setPendingDelete(link); }}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Delete node"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {link.status === 'alert' && (
                <div className="absolute top-5 right-12">
                  <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
              )}

              <div className="mb-6">
                {/* Brand logo + identity */}
                <div className="flex items-center gap-3 mb-4">
                  {link.brandLogoUrl ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                      <img
                        src={link.brandLogoUrl}
                        alt={link.brandName}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  ) : link.brandIconUrl ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                      <img
                        src={link.brandIconUrl}
                        alt={link.brandName}
                        className="w-8 h-8 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
                      style={{ background: link.brandPrimaryColor ? `${link.brandPrimaryColor}22` : 'rgba(59,130,246,0.1)', borderColor: link.brandPrimaryColor ? `${link.brandPrimaryColor}44` : undefined }}
                    >
                      {link.brandName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight fos-heading truncate">
                      {link.brandName}
                    </h3>
                    <div className="flex items-center gap-1.5 fos-label text-zinc-400 mt-0.5">
                      <Fingerprint className="w-2.5 h-2.5" />
                      <span className="truncate">{link.platform} · {link.category}</span>
                    </div>
                  </div>
                </div>
                {/* Brand color accent bar */}
                {link.brandPrimaryColor && (
                  <div className="h-0.5 rounded-full mb-3 opacity-60" style={{ background: `linear-gradient(90deg, ${link.brandPrimaryColor}, transparent)` }} />
                )}
                <p className="fos-label text-zinc-400 font-mono text-[9px] truncate">{link.slug}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700 text-center relative">
                  {link.trackingId && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Click tracking active" />
                  )}
                  <p className="fos-label mb-1">Clicks</p>
                  <p className="text-base font-black text-white">{link.clickCount !== undefined ? link.clickCount.toLocaleString() : link.clicks}</p>
                </div>
                <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700 text-center">
                  <p className="fos-label mb-1">Assets</p>
                  <p className="text-base font-black text-white">{link.assets.length}</p>
                </div>
                <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700 text-center">
                  <p className="fos-label mb-1">Comms</p>
                  <p className="text-base font-black text-emerald-400">{link.commission || '—'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-5">
                <StatusBadge status={link.compliance.status} />
                <StatusBadge status={link.status} />
              </div>

              <button
                onClick={() => onSelectLink(link)}
                className="w-full py-4 bg-zinc-800 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-xl transition-all flex items-center justify-center gap-2.5 active:scale-95 fos-mono group-hover:bg-blue-600"
              >
                <FolderOpen className="w-4 h-4" />
                Enter_Workspace
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black text-xl fos-heading">
              Delete Campaign Node?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm leading-relaxed">
              You are about to permanently delete{' '}
              <span className="text-white font-bold">{pendingDelete?.brandName}</span>.
              This will remove the node, all its intelligence data, and every uploaded asset.
              <br /><br />
              <span className="text-rose-400 font-semibold">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs"
              onClick={() => {
                if (pendingDelete) {
                  onDeleteLink(pendingDelete);
                  setPendingDelete(null);
                }
              }}
            >
              Delete Node
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── Link Explorer (Node Workspace) ───────────────────────
const LinkExplorer = ({
  link,
  onBack,
  onUpdate,
}: {
  link: AffiliateLink;
  onBack: () => void;
  onUpdate: (updated: AffiliateLink) => void;
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'compliance' | 'assets' | 'intelligence'>('overview');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{name: string; progress: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const sections = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { id: 'assets', label: 'Assets', icon: Layers },
    { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
  ] as const;

  // Assets query from DB
  const nodeId = typeof link.id === 'number' ? link.id : parseInt(link.id as string);
  const isDbNode = !isNaN(nodeId);
  const assetsQuery = trpc.nodes.listAssets.useQuery(
    { nodeId },
    { enabled: isDbNode, refetchOnWindowFocus: false }
  );

  const uploadAssetMutation = trpc.nodes.uploadAsset.useMutation({
    onSuccess: () => {
      utils.nodes.listAssets.invalidate({ nodeId });
      utils.nodes.list.invalidate();
      toast.success('Asset uploaded to node vault');
    },
    onError: (err) => toast.error('Upload failed', { description: err.message }),
  });

  const deleteAssetMutation = trpc.nodes.deleteAsset.useMutation({
    onSuccess: () => {
      utils.nodes.listAssets.invalidate({ nodeId });
      utils.nodes.list.invalidate();
      toast.success('Asset removed from vault');
    },
    onError: (err) => toast.error('Delete failed', { description: err.message }),
  });

  const processFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    for (const file of fileArr) {
      if (file.size > 16 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 16MB limit`);
        continue;
      }
      setUploadingFiles(prev => [...prev, { name: file.name, progress: 0 }]);
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve((e.target?.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const assetType = file.type.startsWith('image/') ? 'image'
          : file.type.startsWith('video/') ? 'video'
          : file.name.match(/\.(pdf|doc|docx|txt)$/i) ? 'document'
          : 'other';
        await uploadAssetMutation.mutateAsync({
          nodeId,
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
          assetType: assetType as 'image' | 'banner' | 'copy' | 'video' | 'document' | 'other',
          label: file.name,
          base64Data: base64,
        });
      } catch {
        // error handled by mutation onError
      } finally {
        setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleDeleteAsset = (assetId: string) => {
    const id = parseInt(assetId);
    if (!isNaN(id)) {
      deleteAssetMutation.mutate({ assetId: id });
    } else {
      onUpdate({ ...link, assets: link.assets.filter(a => a.id !== assetId) });
    }
  };

  // Merge DB assets with local assets
  const displayAssets = isDbNode && assetsQuery.data
    ? assetsQuery.data
    : link.assets;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-400 pb-24 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Brand Identity Block */}
          <div className="flex items-center gap-4">
            {/* Brand Logo / Avatar */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{
                background: link.brandPrimaryColor
                  ? `linear-gradient(135deg, ${link.brandPrimaryColor}22, ${link.brandPrimaryColor}08)`
                  : 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))',
                border: `1px solid ${link.brandPrimaryColor ? link.brandPrimaryColor + '44' : 'rgba(37,99,235,0.25)'}`,
                boxShadow: link.brandPrimaryColor
                  ? `0 0 24px ${link.brandPrimaryColor}22, inset 0 0 16px ${link.brandPrimaryColor}08`
                  : '0 0 24px rgba(37,99,235,0.12)',
              }}
            >
              {link.brandLogoUrl ? (
                <img
                  src={link.brandLogoUrl}
                  alt={link.brandName}
                  className="w-12 h-12 object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : link.brandIconUrl ? (
                <img
                  src={link.brandIconUrl}
                  alt={link.brandName}
                  className="w-10 h-10 object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <span
                  className="text-2xl font-black uppercase"
                  style={{ color: link.brandPrimaryColor || '#3b82f6' }}
                >
                  {(link.brandName || link.slug).charAt(0)}
                </span>
              )}
            </div>

            {/* Brand Text */}
            <div>
              <div className="fos-label mb-0.5" style={{ color: link.brandPrimaryColor || undefined }}>
                {link.platform} · {link.category}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter fos-heading">
                {link.brandName || link.slug}
              </h2>
              <div className="fos-mono text-zinc-600 text-[10px] mt-0.5 uppercase tracking-widest">{link.slug}</div>
              {/* Brand color accent bar */}
              {link.brandPrimaryColor && (
                <div
                  className="h-0.5 rounded-full mt-2 w-24 opacity-70"
                  style={{ background: `linear-gradient(90deg, ${link.brandPrimaryColor}, transparent)` }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={link.status} />
          <StatusBadge status={link.compliance.status} />
          <button
            onClick={() => copyToClipboard(link.destination, 'Link Copied')}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all fos-mono"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Link
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 bg-zinc-950 border border-zinc-800/60 p-1.5 rounded-2xl w-fit">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all fos-mono ${
              activeSection === s.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-4">
            {/* Destination URL */}
            <div className="fos-card p-6">
              <p className="fos-label mb-3">Destination URL</p>
              <div className="flex items-center gap-3 p-3.5 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-zinc-400 fos-mono truncate flex-1">{link.destination}</span>
                <button
                  onClick={() => copyToClipboard(link.destination, 'URL Copied')}
                  className="p-1.5 hover:bg-zinc-700 rounded-lg transition-all text-zinc-400 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a href={link.destination} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-zinc-700 rounded-lg transition-all text-zinc-400 hover:text-white">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Tracked Link */}
            {link.trackingId && (
              <div className="fos-card p-6 border-blue-500/30" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <p className="fos-label text-blue-400">Your Tracked Link</p>
                  </div>
                  <span className="text-xs fos-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{link.clickCount ?? 0} clicks tracked</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-zinc-800/60 border border-blue-500/30 rounded-xl">
                  <span className="text-xs text-blue-300 fos-mono truncate flex-1">{window.location.origin}/go/{link.trackingId}</span>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/go/${link.trackingId}`, 'Tracked link copied!')}
                    className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-all text-zinc-400 hover:text-blue-400"
                    title="Copy tracked link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a href={`/go/${link.trackingId}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-all text-zinc-400 hover:text-blue-400" title="Test tracked link">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Share this link instead of your raw affiliate URL. Every click is counted automatically.</p>
              </div>
            )}

            {/* Performance */}
            <div className="fos-card p-6">
              <p className="fos-label mb-4">Performance Metrics</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Clicks', value: link.clicks, color: 'text-blue-400' },
                  { label: 'Earnings', value: link.earnings || '$0', color: 'text-emerald-400' },
                  { label: 'Commission', value: link.commission || 'TBD', color: 'text-amber-400' },
                  { label: 'Assets', value: link.assets.length.toString(), color: 'text-white' },
                ].map((m, i) => (
                  <div key={i} className="p-4 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                    <p className="fos-label mb-2">{m.label}</p>
                    <p className={`text-xl font-black tracking-tight fos-heading ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketing Angle Preview */}
            <div className="fos-card p-6 fos-accent-line pl-8">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="w-4 h-4 text-blue-400" />
                <p className="fos-label text-blue-400">Marketing Angle</p>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed italic">"{link.intelligence.marketingAngle}"</p>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <div className="fos-card p-6">
              <p className="fos-label mb-4">Target Platforms</p>
              <div className="space-y-2">
                {link.intelligence.targetPlatforms.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-zinc-300">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="fos-card p-6">
              <p className="fos-label mb-4">Disclosure</p>
              <div className="p-3.5 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                <p className="text-xs text-zinc-400 leading-relaxed italic">"{link.compliance.disclosure}"</p>
              </div>
              <button
                onClick={() => copyToClipboard(link.compliance.disclosure, 'Disclosure Copied')}
                className="mt-3 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 fos-mono"
              >
                <Copy className="w-3 h-3" />
                Copy Disclosure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Section */}
      {activeSection === 'compliance' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="fos-card p-7">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Compliance Status</h3>
              </div>
              <StatusBadge status={link.compliance.status} />
            </div>

            <div className="space-y-4">
              {/* Disclosure */}
              <div>
                <p className="fos-label mb-3">Required Disclosure Language</p>
                <div className="p-5 bg-zinc-800/60 border border-zinc-700 rounded-2xl relative group">
                  <p className="text-sm text-zinc-300 leading-relaxed italic">"{link.compliance.disclosure}"</p>
                  <button
                    onClick={() => copyToClipboard(link.compliance.disclosure, 'Disclosure Copied')}
                    className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-600 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rules */}
              <div>
                <p className="fos-label mb-3">Program Rules</p>
                <div className="space-y-2">
                  {link.compliance.rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-zinc-400">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FTC Notes */}
              {link.compliance.ftcNotes && (
                <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <p className="fos-label text-blue-400">AI Compliance Notes</p>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{link.compliance.ftcNotes}</p>
                </div>
              )}

              {link.compliance.lastChecked && (
                <div className="flex items-center gap-2 text-zinc-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="fos-label">Last checked: {link.compliance.lastChecked}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assets Section */}
      {activeSection === 'assets' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.zip"
            onChange={e => e.target.files && processFiles(e.target.files)}
          />

          {/* Drag-and-drop upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`fos-card p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all border-2 border-dashed ${
              isDragging
                ? 'border-blue-500 bg-blue-500/5 scale-[1.01]'
                : 'border-zinc-700 hover:border-blue-500/50 hover:bg-zinc-800/30'
            }`}
          >
            <div className={`p-4 rounded-2xl transition-all ${isDragging ? 'bg-blue-500/20' : 'bg-zinc-800'}`}>
              <Upload className={`w-8 h-8 transition-all ${isDragging ? 'text-blue-400' : 'text-zinc-400'}`} />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm">{isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}</p>
              <p className="fos-label text-zinc-400 mt-1">Images, videos, PDFs, docs — up to 16MB each</p>
            </div>
            {uploadingFiles.length > 0 && (
              <div className="w-full space-y-2">
                {uploadingFiles.map(f => (
                  <div key={f.name} className="flex items-center gap-3 p-3 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
                    <span className="text-xs text-zinc-400 fos-mono truncate flex-1">{f.name}</span>
                    <span className="fos-label text-blue-400">Uploading...</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Asset list */}
          <div className="fos-card overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center justify-between">
              <p className="fos-label">Asset Vault — {displayAssets.length} files</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-widest fos-mono"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Files
              </button>
            </div>
            {displayAssets.length === 0 ? (
              <div className="p-12 text-center">
                <Upload className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                <p className="text-zinc-300 text-sm font-bold uppercase tracking-widest fos-mono">No assets yet</p>
                <p className="text-zinc-400 text-xs mt-2 fos-mono">Drop files above to add them to this node</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/40">
                {displayAssets.map(asset => (
                    <div key={asset.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-blue-400">
                        <AssetIcon type={asset.type as import('@/lib/data').AssetType} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{asset.name}</p>
                        <p className="fos-label text-zinc-400 mt-0.5">{asset.type.toUpperCase()} · {asset.size} · {asset.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {'url' in asset && asset.url && (
                        <a
                          href={asset.url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => copyToClipboard(asset.name, 'Asset name copied')}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intelligence Section */}
      {activeSection === 'intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-300">
          {/* Keywords */}
          <div className="fos-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Search className="w-4 h-4 text-blue-400" />
              <p className="fos-label text-blue-400">Keyword Research</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {link.intelligence.keywordResearch.map((kw, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(kw, 'Keyword copied')}
                  className="px-3 py-1.5 bg-zinc-800/60 border border-zinc-700 hover:border-blue-500/50 text-zinc-300 hover:text-white text-xs rounded-lg transition-all fos-mono flex items-center gap-1.5 group"
                >
                  {kw}
                  <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Personas */}
          <div className="fos-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <p className="fos-label text-blue-400">Target Personas</p>
            </div>
            <div className="space-y-3">
              {link.intelligence.personas.map((p, i) => (
                <div key={i} className="p-4 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black text-white uppercase tracking-tight">{p.name}</p>
                    {p.platform && <span className="fos-label text-blue-500">{p.platform}</span>}
                  </div>
                  <p className="text-[11px] text-zinc-300 mb-1.5"><span className="text-zinc-400 font-bold">Pain:</span> {p.pain}</p>
                  <p className="text-[11px] text-zinc-400"><span className="text-emerald-500 font-bold">Hook:</span> {p.hook}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing Angle */}
          <div className="fos-card p-6 fos-accent-line pl-8">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-blue-400" />
              <p className="fos-label text-blue-400">Marketing Angle</p>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed italic mb-4">"{link.intelligence.marketingAngle}"</p>
            <button
              onClick={() => copyToClipboard(link.intelligence.marketingAngle, 'Angle copied')}
              className="flex items-center gap-2 text-[9px] font-black text-zinc-400 hover:text-white uppercase tracking-widest transition-all fos-mono"
            >
              <Copy className="w-3 h-3" />
              Copy Angle
            </button>
          </div>

          {/* Content Suggestions */}
          <div className="fos-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <p className="fos-label text-blue-400">Content Suggestions</p>
            </div>
            <div className="space-y-2">
              {link.intelligence.contentSuggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 bg-zinc-800/60 border border-zinc-700 hover:border-blue-500/40 rounded-xl group transition-all cursor-pointer"
                  onClick={() => copyToClipboard(s, 'Content idea copied')}
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">{s}</span>
                  <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 ml-auto shrink-0 mt-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Notes */}
          {link.intelligence.strategyNotes && (
            <div className="lg:col-span-2 fos-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-4 h-4 text-blue-400" />
                <p className="fos-label text-blue-400">Strategy Notes</p>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{link.intelligence.strategyNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Intelligence Hub ──────────────────────────────────────
const IntelligenceHub = ({ links }: { links: AffiliateLink[] }) => {
  const allKeywords = Array.from(new Set(links.flatMap(l => l.intelligence.keywordResearch)));
  const allPersonas = links.flatMap(l => l.intelligence.personas.map(p => ({ ...p, brand: l.brandName })));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter fos-heading">Intelligence Hub</h2>
        <p className="fos-label text-zinc-600 mt-2 italic">AI_Research_Aggregated_Across_All_Nodes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Keywords */}
        <div className="fos-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Search className="w-4 h-4 text-blue-400" />
            <p className="fos-label text-blue-400">Master Keyword Pool</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allKeywords.map((kw, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(kw, 'Keyword copied')}
                className="px-3 py-1.5 bg-zinc-800/60 border border-zinc-700 hover:border-blue-500/50 text-zinc-300 hover:text-white text-[10px] rounded-lg transition-all fos-mono"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* All Personas */}
        <div className="fos-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <p className="fos-label text-blue-400">Persona Matrix</p>
          </div>
          <div className="space-y-3">
            {allPersonas.slice(0, 5).map((p, i) => (
              <div key={i} className="p-3.5 bg-zinc-800/60 border border-zinc-700 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-black text-white uppercase tracking-tight">{p.name}</p>
                  <span className="fos-label text-blue-500">{p.brand}</span>
                </div>
                <p className="text-[10px] text-zinc-400">{p.hook}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="fos-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-blue-400" />
            <p className="fos-label text-blue-400">Platform Distribution</p>
          </div>
          <div className="space-y-3">
            {Array.from(new Set(links.map(l => l.platform))).map((platform, i) => {
              const count = links.filter(l => l.platform === platform).length;
              const pct = Math.round((count / links.length) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-zinc-400">{platform}</span>
                    <span className="fos-label text-zinc-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Intelligence Feed */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Newspaper className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Platform Intelligence Feed</h3>
          <div className="fos-pulse-dot ml-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intelligenceNews.map((news, i) => (
            <div key={i} className="fos-card p-5 hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="fos-label text-blue-500">{news.platform}</span>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="w-3 h-3" />
                  <span className="fos-label text-zinc-400">{news.date}</span>
                </div>
              </div>
              <h4 className="text-xs font-black text-white mb-2 uppercase tracking-tight">{news.title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{news.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-campaign angles */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Megaphone className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Campaign Marketing Angles</h3>
        </div>
        <div className="space-y-3">
          {links.map(link => (
            <div key={link.id} className="fos-card p-5 fos-accent-line pl-7 hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-white uppercase tracking-tight">{link.brandName}</span>
                <span className="fos-label text-zinc-400">{link.platform}</span>
              </div>
              <p className="text-xs text-zinc-300 italic leading-relaxed">"{link.intelligence.marketingAngle}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Integrations ────────────────────────────────────────
type IntegrationStatus = 'connected' | 'disconnected' | 'pending' | 'error';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: IntegrationStatus;
  icon: React.ElementType;
  color: string;
  lastSync?: string;
  metrics?: string;
}

const integrationData: Integration[] = [
  // Affiliate Networks
  { id: 'shopify', name: 'Shopify Partners', description: 'Track referrals, commissions & payouts from Shopify affiliate program', category: 'Affiliate Networks', status: 'connected', icon: ShoppingCart, color: 'text-emerald-400', lastSync: '2 min ago', metrics: '$1,248 earned' },
  { id: 'amazon', name: 'Amazon Associates', description: 'Sync Amazon affiliate earnings, product links, and conversion data', category: 'Affiliate Networks', status: 'pending', icon: ShoppingCart, color: 'text-amber-400', lastSync: 'Awaiting auth' },
  { id: 'clickfunnels', name: 'ClickFunnels', description: 'Import funnel performance, commission tiers, and affiliate dashboard data', category: 'Affiliate Networks', status: 'connected', icon: TrendingUp, color: 'text-blue-400', lastSync: '15 min ago', metrics: '$2,100 earned' },
  { id: 'impact', name: 'Impact Radius', description: 'Connect to Impact.com for cross-network affiliate tracking and reporting', category: 'Affiliate Networks', status: 'disconnected', icon: Target, color: 'text-zinc-400' },
  { id: 'shareasale', name: 'ShareASale', description: 'Pull ShareASale merchant data, click reports, and commission history', category: 'Affiliate Networks', status: 'disconnected', icon: Share2, color: 'text-zinc-400' },
  { id: 'cj', name: 'CJ Affiliate', description: 'Integrate CJ publisher account for real-time earnings and link management', category: 'Affiliate Networks', status: 'disconnected', icon: Link2, color: 'text-zinc-400' },
  // Analytics
  { id: 'ga4', name: 'Google Analytics 4', description: 'Import GA4 traffic, conversion events, and audience data into FinesseOS', category: 'Analytics', status: 'connected', icon: BarChart3, color: 'text-orange-400', lastSync: '5 min ago', metrics: '12.4K sessions' },
  { id: 'gtm', name: 'Google Tag Manager', description: 'Sync GTM container events and affiliate click triggers automatically', category: 'Analytics', status: 'disconnected', icon: Webhook, color: 'text-zinc-400' },
  { id: 'hotjar', name: 'Hotjar', description: 'Overlay heatmaps and session recordings on your affiliate landing pages', category: 'Analytics', status: 'disconnected', icon: Activity, color: 'text-zinc-400' },
  // Social Platforms
  { id: 'tiktok', name: 'TikTok for Business', description: 'Pull TikTok video performance, CTR, and affiliate link click data', category: 'Social Platforms', status: 'connected', icon: Megaphone, color: 'text-pink-400', lastSync: '1 hr ago', metrics: '2.4K clicks' },
  { id: 'instagram', name: 'Instagram / Meta', description: 'Connect Meta Business Suite for Reels and Stories affiliate analytics', category: 'Social Platforms', status: 'pending', icon: Megaphone, color: 'text-purple-400', lastSync: 'Awaiting auth' },
  { id: 'youtube', name: 'YouTube Studio', description: 'Import YouTube video analytics and affiliate link performance from descriptions', category: 'Social Platforms', status: 'disconnected', icon: Activity, color: 'text-zinc-400' },
  { id: 'pinterest', name: 'Pinterest', description: 'Sync Pinterest pin performance and affiliate product link clicks', category: 'Social Platforms', status: 'disconnected', icon: Share2, color: 'text-zinc-400' },
  // Email & CRM
  { id: 'klaviyo', name: 'Klaviyo', description: 'Sync email campaign performance, open rates, and affiliate link clicks', category: 'Email & CRM', status: 'connected', icon: Mail, color: 'text-green-400', lastSync: '30 min ago', metrics: '26% open rate' },
  { id: 'mailchimp', name: 'Mailchimp', description: 'Import Mailchimp audience data and campaign affiliate click metrics', category: 'Email & CRM', status: 'disconnected', icon: Mail, color: 'text-zinc-400' },
  { id: 'convertkit', name: 'ConvertKit', description: 'Connect ConvertKit sequences and tag-based affiliate automation flows', category: 'Email & CRM', status: 'disconnected', icon: Mail, color: 'text-zinc-400' },
];

const statusConfig: Record<IntegrationStatus, { label: string; icon: React.ElementType; cls: string }> = {
  connected: { label: 'Connected', icon: CheckCheck, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  disconnected: { label: 'Disconnected', icon: XCircle, cls: 'text-zinc-500 bg-zinc-700/30 border-zinc-700/30' },
  pending: { label: 'Pending', icon: AlertTriangle, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  error: { label: 'Error', icon: AlertCircle, cls: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

const IntegrationCard = ({ integration }: { integration: Integration }) => {
  const cfg = statusConfig[integration.status];
  const StatusIcon = cfg.icon;
  const Icon = integration.icon;
  const isConnected = integration.status === 'connected';
  const isPending = integration.status === 'pending';

  return (
    <div className="fos-card p-5 group hover:border-blue-500/20 transition-all duration-300 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 group-hover:border-zinc-600 transition-all`}>
            <Icon className={`w-5 h-5 ${integration.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-white uppercase tracking-tight truncate">{integration.name}</p>
            {integration.lastSync && (
              <p className="fos-label text-zinc-500 mt-0.5 truncate">{isConnected ? `Synced ${integration.lastSync}` : integration.lastSync}</p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest fos-mono shrink-0 ${cfg.cls}`}>
          <StatusIcon className="w-2.5 h-2.5" />
          {cfg.label}
        </span>
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{integration.description}</p>

      {integration.metrics && (
        <div className="px-3 py-2 bg-zinc-800/60 rounded-xl border border-zinc-700">
          <p className="fos-label text-blue-400">{integration.metrics}</p>
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        {isConnected ? (
          <>
            <button
              onClick={() => toast.success(`${integration.name} re-synced`, { description: 'Data refreshed successfully.' })}
              className="flex-1 py-2 bg-zinc-700 border border-zinc-600 rounded-xl text-[9px] font-black text-zinc-300 hover:text-white hover:bg-zinc-600 transition-all uppercase tracking-widest fos-mono"
            >
              Re_Sync
            </button>
            <button
              onClick={() => toast.info('Disconnect flow coming soon')}
              className="px-3 py-2 bg-rose-950/30 border border-rose-900/30 rounded-xl text-[9px] font-black text-rose-500 hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest fos-mono"
            >
              Disconnect
            </button>
          </>
        ) : isPending ? (
          <button
            onClick={() => toast.info('Completing OAuth flow...', { description: 'Redirecting to authorization page.' })}
            className="flex-1 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[9px] font-black text-amber-400 hover:bg-amber-500 hover:text-black transition-all uppercase tracking-widest fos-mono"
          >
            Complete_Auth
          </button>
        ) : (
          <button
            onClick={() => toast.info(`Connecting to ${integration.name}...`, { description: 'OAuth flow will open in a new window.' })}
            className="flex-1 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-400 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest fos-mono"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

const IntegrationsHub = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', 'Affiliate Networks', 'Analytics', 'Social Platforms', 'Email & CRM'];
  const filtered = activeCategory === 'All' ? integrationData : integrationData.filter(i => i.category === activeCategory);
  const connectedCount = integrationData.filter(i => i.status === 'connected').length;
  const pendingCount = integrationData.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter fos-heading">Integrations</h2>
        <p className="fos-label text-zinc-400 mt-2 italic">Connect_Your_Entire_Stack</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Integrations', value: integrationData.length, color: 'text-white' },
          { label: 'Connected', value: connectedCount, color: 'text-emerald-400' },
          { label: 'Pending Auth', value: pendingCount, color: 'text-amber-400' },
          { label: 'Available', value: integrationData.filter(i => i.status === 'disconnected').length, color: 'text-zinc-400' },
        ].map(stat => (
          <div key={stat.label} className="fos-card p-5">
            <p className={`text-3xl font-black ${stat.color} fos-heading`}>{stat.value}</p>
            <p className="fos-label text-zinc-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest fos-mono transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            {cat === 'All' ? `All (${integrationData.length})` : cat}
          </button>
        ))}
      </div>

      {/* Integration cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Request integration CTA */}
      <div className="p-6 bg-zinc-800/40 border border-zinc-700 border-dashed rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-white uppercase tracking-tight">Don't see your platform?</p>
          <p className="fos-label text-zinc-400 mt-1">Request a new integration and we'll prioritize it for the next release.</p>
        </div>
        <button
          onClick={() => toast.info('Integration request sent!', { description: 'We\'ll notify you when it\'s available.' })}
          className="shrink-0 flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest fos-mono transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Request_Integration
        </button>
      </div>
    </div>
  );
};

// ─── Settings ─────────────────────────────────────────────
const SystemConfig = () => {
  const [toggles, setToggles] = useState({
    immutableLock: true,
    autoDisclosure: true,
    nodeObfuscation: false,
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter fos-heading">System Config</h2>
        <p className="fos-label text-zinc-400 mt-2 italic">Infrastructure_Control_Panel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Node Infrastructure */}
          <section className="fos-card p-8">
            <div className="flex items-center gap-3 mb-7">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Node Infrastructure</h3>
            </div>
            <div className="space-y-3">
              {systemNodes.map(node => (
                <div key={node.id} className="p-5 bg-zinc-800/60 border border-zinc-700 rounded-2xl flex items-center justify-between group hover:border-blue-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="fos-pulse-dot" />
                    <div>
                      <p className="text-sm font-black text-white tracking-widest fos-mono">{node.id}</p>
                      <p className="fos-label text-zinc-400 mt-1">Load: {node.load} · Region: {node.region}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="text-xs font-black text-blue-400 fos-mono">{node.ping}</p>
                    <button
                      onClick={() => toast.success(`${node.id} re-synced`)}
                      className="text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:text-white transition-colors fos-mono px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
                    >
                      Re_Sync
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* API Integration Vault */}
          <section className="fos-card p-8">
            <div className="flex items-center gap-3 mb-7">
              <Key className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">API Integration Vault</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {apiIntegrations.map(api => (
                <div key={api.network} className="p-5 bg-zinc-800/60 border border-zinc-700 rounded-2xl group hover:border-emerald-500/20 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-black text-white uppercase tracking-tight">{api.network}</p>
                    <StatusBadge status={api.status} />
                  </div>
                  <code className="text-[10px] text-zinc-400 block mb-4 fos-mono">{api.key}</code>
                  <button
                    onClick={() => toast.info('Feature coming soon', { description: 'API key management will be available in the next release.' })}
                    className="w-full py-2.5 bg-zinc-700 border border-zinc-600 rounded-xl text-[9px] font-black text-zinc-300 hover:text-white hover:bg-zinc-600 transition-all uppercase tracking-widest fos-mono"
                  >
                    Update_Key
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Security Layer */}
          <section className="fos-card p-7">
            <div className="flex items-center gap-3 mb-7">
              <Lock className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Security Layer</h3>
            </div>
            <div className="space-y-4">
              {[
                { key: 'immutableLock' as const, label: 'Immutable Link Lock', desc: 'Prevents deletion of active nodes' },
                { key: 'autoDisclosure' as const, label: 'Auto-Disclosure Scan', desc: 'AI-driven FTC compliance check' },
                { key: 'nodeObfuscation' as const, label: 'Node Obfuscation', desc: 'Dynamic IP-rotation layer' },
              ].map(item => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between p-4 bg-zinc-800/60 border border-zinc-700 rounded-2xl ${!toggles[item.key] ? 'opacity-50' : ''}`}
                >
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none">{item.label}</p>
                    <p className="fos-label text-zinc-400 mt-1.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setToggles(t => ({ ...t, [item.key]: !t[item.key] }))}
                    className={`w-10 h-5 rounded-full flex items-center px-1 transition-all ${toggles[item.key] ? 'fos-toggle-on' : 'fos-toggle-off'}`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-all ${toggles[item.key] ? 'bg-emerald-500 ml-auto' : 'bg-zinc-400'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* System Identity */}
          <section className="fos-card p-7 text-center">
            <p className="fos-label text-zinc-400 mb-6">System Identity</p>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center font-black text-white text-2xl shadow-2xl fos-glow-blue mb-5">
              JD
            </div>
            <p className="text-lg font-black text-white tracking-tight uppercase fos-heading leading-none">JD_PRO_ADMIN</p>
            <p className="fos-label text-zinc-400 mt-2">ID: FOS_992_X_ALPHA</p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => toast.info('Feature coming soon')}
                className="py-2.5 bg-zinc-700 border border-zinc-600 rounded-xl text-[9px] font-black text-zinc-300 uppercase tracking-widest hover:text-white transition-colors fos-mono"
              >
                Edit_Profile
              </button>
              <button
                onClick={() => toast.info('Feature coming soon')}
                className="py-2.5 bg-rose-950/30 border border-rose-900/30 rounded-xl text-[9px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all fos-mono"
              >
                Sign_Out
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
            <div className="flex items-center gap-2 fos-label text-rose-500 mb-4">
              <AlertCircle className="w-3.5 h-3.5" />
              Danger Zone
            </div>
            <button
              onClick={() => toast.error('Action blocked', { description: 'Immutable Link Lock is active. Disable in Security Layer first.' })}
              className="w-full py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-[9px] font-black uppercase rounded-xl transition-all border border-rose-500/20 fos-mono"
            >
              Purge_Global_Redirect_Map
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard Component ──────────────────────────────
export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedLink, setSelectedLink] = useState<AffiliateLink | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Load nodes from DB — fall back to mock data when not authenticated
  const nodesQuery = trpc.nodes.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const dbLinks: AffiliateLink[] = (nodesQuery.data ?? []).map(n => ({
    ...n,
    assets: (n.assets ?? []).map(a => ({ ...a, type: a.type as import('@/lib/data').AssetType })),
  }));

  // Use DB nodes when authenticated, otherwise show mock data for demo
  const links = isAuthenticated ? dbLinks : initialLinks;

  const handleSelectLink = useCallback((link: AffiliateLink) => {
    setSelectedLink(link);
    setActiveTab('vault');
  }, []);

  const handleAddLink = useCallback((link: AffiliateLink) => {
    // Node is already saved to DB via tRPC mutation in AddLinkModal
    // Just update local selected state if needed
    setSelectedLink(link);
  }, []);

  const handleUpdateLink = useCallback((updated: AffiliateLink) => {
    setSelectedLink(updated);
  }, []);

  const utils = trpc.useUtils();
  const deleteNodeMutation = trpc.nodes.delete.useMutation({
    onSuccess: () => {
      utils.nodes.list.invalidate();
      toast.success('Node deleted', { description: 'Campaign and all assets permanently removed.' });
    },
    onError: (err) => toast.error('Delete failed', { description: err.message }),
  });

  const handleDeleteLink = useCallback((link: AffiliateLink) => {
    const nodeId = typeof link.id === 'number' ? link.id : parseInt(link.id as string);
    if (!isNaN(nodeId)) {
      deleteNodeMutation.mutate({ nodeId });
    }
  }, [deleteNodeMutation]);

  // Sync selectedLink with latest DB data
  useEffect(() => {
    if (selectedLink && dbLinks.length > 0) {
      const fresh = dbLinks.find(l => l.id === selectedLink.id);
      if (fresh) setSelectedLink(fresh);
    }
  }, [nodesQuery.data]);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'vault' as ActiveTab, label: 'The Vault', icon: ShieldCheck },
    { id: 'intelligence' as ActiveTab, label: 'Intelligence', icon: BookOpen },
    { id: 'integrations' as ActiveTab, label: 'Integrations', icon: Plug },
  ];

  const pageTitle = () => {
    if (activeTab === 'vault' && selectedLink) return selectedLink.brandName;
    if (activeTab === 'vault') return 'Vault';
    if (activeTab === 'intelligence') return 'Intelligence';
    if (activeTab === 'integrations') return 'Integrations';
    if (activeTab === 'settings') return 'Config';
    return 'Overview';
  };

  // Show a minimal loading screen while auth check is in progress
  // The useAuth hook will redirect to login if user is not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/94821429/gUEtbVDJTcocGKPG.png"
            alt="FinesseOS"
            className="w-auto animate-pulse"
            style={{
              height: '48px',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 20px rgba(96,165,250,0.7)) drop-shadow(0 0 40px rgba(139,92,246,0.4)) brightness(1.2)',
            }}
          />
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono tracking-[0.3em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            Authenticating...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-zinc-100 selection:bg-blue-500/30 selection:text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Add Link Modal */}
      {showAddModal && (
        <AddLinkModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddLink}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-zinc-900 border-r border-zinc-700 hidden md:flex flex-col z-50" style={{ backgroundImage: 'radial-gradient(ellipse 120% 60% at 0% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)' }}>
        {/* Logo */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-3 group cursor-default">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/94821429/gUEtbVDJTcocGKPG.png"
              alt="FinesseOS"
              className="w-auto transition-all group-hover:scale-105"
              style={{
                width: '100px',
                height: '100px',
                marginLeft: '75px',
                marginBottom: '-25px',
                mixBlendMode: 'screen',
                filter: 'drop-shadow(0 0 12px rgba(96,165,250,0.6)) drop-shadow(0 0 24px rgba(139,92,246,0.3)) brightness(1.15) contrast(1.05)',
              }}
            />
          </div>
          <p className="fos-label text-zinc-400 mt-3 italic pl-1">Inevitable_Action_Layer</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-5 mt-10 space-y-2">
          {navItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => { setActiveTab(item.id); setSelectedLink(null); }}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-5 border-t border-zinc-700">
          <button
            onClick={() => { setActiveTab('settings'); setSelectedLink(null); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group hover:bg-zinc-800 ${activeTab === 'settings' ? 'text-white bg-zinc-800' : 'text-zinc-300'}`}
          >
            <Settings className={`w-5 h-5 transition-transform duration-500 ${activeTab === 'settings' ? 'rotate-90' : 'group-hover:rotate-90'}`} />
            <span className="fos-label">Sys_Config</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-2xl border-t border-zinc-700 h-20 flex items-center justify-around px-4 z-40">
        {navItems.map(item => (
          <MobileNavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => { setActiveTab(item.id); setSelectedLink(null); }}
          />
        ))}
        <MobileNavItem
          icon={Settings}
          label="Config"
          active={activeTab === 'settings'}
          onClick={() => { setActiveTab('settings'); setSelectedLink(null); }}
        />
      </nav>

      {/* ── Main Content ── */}
      <main className="md:ml-72 p-5 lg:p-10 pt-8 min-h-screen">
        {/* Header */}
        <header className="hidden md:flex items-center justify-between mb-12 gap-6">
          <div className="animate-in slide-in-from-left-6 duration-500">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="fos-pulse-dot" />
              <span className="fos-label text-zinc-400">System_State: Initialized_Link-First</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none fos-heading">
              {pageTitle()}
              <span className="text-blue-600 opacity-20 select-none"> _</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-zinc-800/80 border border-zinc-700 p-2.5 rounded-2xl backdrop-blur-md">
              <div className="px-5 py-3 bg-zinc-900 rounded-xl border border-zinc-700 flex items-center gap-3 group focus-within:border-blue-500/60 transition-all">
              <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="bg-transparent text-[11px] font-bold text-zinc-100 focus:outline-none w-52 placeholder:text-zinc-500 uppercase tracking-widest fos-mono"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-zinc-600 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95 fos-glow-blue"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setActiveTab('settings'); setSelectedLink(null); }}
              className="w-12 h-12 bg-zinc-800 hover:bg-blue-600 rounded-xl flex items-center justify-center font-black text-white transition-all border border-zinc-700 text-sm fos-heading"
              title={user?.name ?? 'Account'}
            >
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'JD'}
            </button>
          </div>
        </header>

        {/* Content */}
        {activeTab === 'dashboard' && <DashboardOverview links={links} />}
        {activeTab === 'vault' && !selectedLink && (
          <CampaignVault
            links={links}
            searchQuery={searchQuery}
            onSelectLink={handleSelectLink}
            onAddLink={() => setShowAddModal(true)}
            onDeleteLink={handleDeleteLink}
          />
        )}
        {activeTab === 'vault' && selectedLink && (
          <LinkExplorer
            link={selectedLink}
            onBack={() => setSelectedLink(null)}
            onUpdate={handleUpdateLink}
          />
        )}
        {activeTab === 'intelligence' && <IntelligenceHub links={links} />}
        {activeTab === 'integrations' && <IntegrationsHub />}
        {activeTab === 'settings' && <SystemConfig />}

        {/* Footer */}
        <footer className="mt-24 pt-10 border-t border-zinc-700 hidden md:flex justify-between items-center text-zinc-400">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
              <Zap className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="fos-label">FinesseOS.pro — Campaign-Centric Architecture v2.0</p>
          </div>
          <div className="flex items-center gap-8 fos-label">
            <span className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SSL_Node_Active
            </span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">Infrastructure_Pulse</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
