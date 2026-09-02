// FinesseOS — Golden Niche card (Niche Finder result)
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, Target, Users, DollarSign, BarChart3, Lightbulb,
  Bookmark, BookmarkCheck, Trash2, ExternalLink,
} from 'lucide-react';

// Curated direct signup links for well-known affiliate programs.
// Matched case-insensitively by substring; unknown programs fall back to a search.
const PROGRAM_SIGNUP_URLS: { match: string; url: string }[] = [
  { match: 'amazon', url: 'https://affiliate-program.amazon.com/' },
  { match: 'shareasale', url: 'https://account.shareasale.com/new-signup.cfm' },
  { match: 'impact', url: 'https://app.impact.com/secure/loginV2.iol' },
  { match: 'clickbank', url: 'https://accounts.clickbank.com/overview.htm' },
  { match: 'cj affiliate', url: 'https://www.cj.com/signup' },
  { match: 'commission junction', url: 'https://www.cj.com/signup' },
  { match: 'awin', url: 'https://www.awin.com/us/publishers' },
  { match: 'rakuten', url: 'https://rakutenadvertising.com/en/affiliate/signup/' },
  { match: 'skimlinks', url: 'https://skimlinks.com/signup' },
  { match: 'flexoffers', url: 'https://www.flexoffers.com/' },
  { match: 'avantlink', url: 'https://www.avantlink.com/apply/' },
  { match: 'partnerstack', url: 'https://partnerstack.com/' },
  { match: 'ebay', url: 'https://partnernetwork.ebay.com/' },
  { match: 'walmart', url: 'https://affiliates.walmart.com/' },
  { match: 'target', url: 'https://www.target.com/affiliates' },
  { match: 'etsy', url: 'https://www.etsy.com/affiliates' },
  { match: 'booking', url: 'https://affiliate.booking.com/' },
  { match: 'shopify', url: 'https://www.shopify.com/affiliates' },
  { match: 'clickfunnels', url: 'https://www.clickfunnels.com/affiliates' },
  { match: 'leadpages', url: 'https://www.leadpages.com/affiliates' },
  { match: 'convertkit', url: 'https://convertkit.com/affiliates' },
  { match: 'teachable', url: 'https://teachable.com/affiliates' },
  { match: 'kinsta', url: 'https://kinsta.com/affiliates/' },
  { match: 'bluehost', url: 'https://www.bluehost.com/affiliates' },
  { match: 'hostgator', url: 'https://www.hostgator.com/affiliates' },
  { match: 'wp engine', url: 'https://wpengine.com/affiliates/' },
  { match: 'semrush', url: 'https://www.semrush.com/affiliates/' },
  { match: 'hubspot', url: 'https://www.hubspot.com/partners/affiliate' },
  { match: 'canva', url: 'https://www.canva.com/affiliates' },
  { match: 'fiverr', url: 'https://affiliates.fiverr.com/' },
  { match: 'adidas', url: 'https://www.adidas.com/us/affiliates' },
  { match: 'getresponse', url: 'https://www.getresponse.com/affiliate-programs' },
  { match: 'aweber', url: 'https://www.aweber.com/affiliate-program' },
  { match: 'digistore24', url: 'https://www.digistore24.com/' },
  { match: 'jvzoo', url: 'https://www.jvzoo.com/' },
  { match: 'warriorplus', url: 'https://warriorplus.com/' },
  { match: 'maxbounty', url: 'https://www.maxbounty.com/signup' },
  { match: 'tradedoubler', url: 'https://www.tradedoubler.com/' },
];

const programSignupUrl = (name: string) => {
  const lower = name.toLowerCase();
  const hit = PROGRAM_SIGNUP_URLS.find((p) => lower.includes(p.match));
  return hit
    ? hit.url
    : `https://www.google.com/search?q=${encodeURIComponent(`${name} affiliate program signup`)}`;
};

export type GoldenNiche = {
  nicheName: string;
  description: string;
  monthlySearchVolume: string;
  competitionLevel: 'low' | 'medium' | 'high';
  competitionScore: number;
  monetizationPotential: 'high' | 'medium' | 'low';
  buyerIntent: 'high' | 'medium' | 'low';
  avgSpend: string;
  goldenScore: number;
  painPoints: string[];
  targetAudience: string;
  recommendedPrograms: string[];
  contentOpportunities: string[];
};

// color helpers (brand: emerald = good, primary blue = strong, amber = caution, rose = hard)
const goldenTone = (s: number) =>
  s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-primary' : s >= 40 ? 'text-amber-400' : 'text-zinc-400';
const goldenChip = (s: number) =>
  s >= 80 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
  : s >= 60 ? 'border-primary/40 bg-primary/10 text-primary'
  : 'border-amber-500/40 bg-amber-500/10 text-amber-300';

const compTone = (l: string) =>
  l === 'low' ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
  : l === 'medium' ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
  : 'text-rose-300 bg-rose-500/10 border-rose-500/30';

const intentTone = (l: string) =>
  l === 'high' ? 'text-emerald-300' : l === 'medium' ? 'text-amber-300' : 'text-zinc-400';
const monetTone = (l: string) =>
  l === 'high' ? 'text-emerald-300' : l === 'medium' ? 'text-primary' : 'text-zinc-400';

function Stat({ icon: Icon, label, value, valueClass }: {
  icon: React.ElementType; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-background/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon size={13} />
        <span>{label}</span>
      </div>
      <span className={`text-sm font-semibold ${valueClass ?? 'text-foreground'}`}>{value}</span>
    </div>
  );
}

export function NicheCard({
  niche, saved = false, nicheId, onSave, onDelete, saving = false,
}: {
  niche: GoldenNiche;
  saved?: boolean;
  nicheId?: string;
  onSave?: (niche: GoldenNiche) => void;
  onDelete?: (nicheId: string) => void;
  saving?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden border-border bg-card">
      <CardContent className="space-y-4 pt-6">
        {/* header: score + name + competition */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-bold text-foreground leading-tight">{niche.nicheName}</h3>
            <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${compTone(niche.competitionLevel)}`}>
              {niche.competitionLevel} competition
            </span>
          </div>
          <div className={`flex shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-2 ${goldenChip(niche.goldenScore)}`}>
            <span className={`font-heading text-2xl font-bold leading-none ${goldenTone(niche.goldenScore)}`}>{niche.goldenScore}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">Golden</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{niche.description}</p>

        {/* stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <Stat icon={BarChart3} label="Monthly volume" value={niche.monthlySearchVolume} />
          <Stat icon={Target} label="Competition score" value={`${niche.competitionScore}/100`} valueClass={goldenTone(100 - niche.competitionScore)} />
          <Stat icon={DollarSign} label="Monetization" value={niche.monetizationPotential} valueClass={monetTone(niche.monetizationPotential)} />
          <Stat icon={TrendingUp} label="Buyer intent" value={niche.buyerIntent} valueClass={intentTone(niche.buyerIntent)} />
          <Stat icon={DollarSign} label="Avg. spend" value={niche.avgSpend} />
          <Stat icon={Users} label="Audience" value={niche.targetAudience.length > 28 ? niche.targetAudience.slice(0, 26) + '…' : niche.targetAudience} />
        </div>

        {/* pain points */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pain points they pay to fix</p>
          <div className="flex flex-wrap gap-1.5">
            {niche.painPoints.map((p, i) => (
              <span key={i} className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground/80">{p}</span>
            ))}
          </div>
        </div>

        {/* recommended programs */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recommended affiliate programs</p>
          <div className="flex flex-wrap gap-1.5">
            {niche.recommendedPrograms.map((p, i) => (
              <a
                key={i}
                href={programSignupUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="badge-highlight inline-flex items-center gap-1 transition-colors hover:opacity-80"
                title={`Open ${p} affiliate signup`}
              >
                {p}
                <ExternalLink size={10} className="opacity-70" />
              </a>
            ))}
          </div>
        </div>

        {/* content opportunities */}
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Lightbulb size={12} /> Content opportunities
          </p>
          <ul className="space-y-1">
            {niche.contentOpportunities.map((c, i) => (
              <li key={i} className="flex gap-2 text-xs text-foreground/80">
                <span className="text-primary">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* action */}
        <div className="pt-1">
          {onSave && !saved && (
            <Button
              variant="default"
              className="w-full"
              disabled={saving}
              onClick={() => onSave(niche)}
            >
              <Bookmark size={15} />
              {saving ? 'Saving…' : 'Save Niche'}
            </Button>
          )}
          {saved && !onDelete && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-sm font-medium text-emerald-300">
              <BookmarkCheck size={15} /> Saved to vault
            </div>
          )}
          {saved && onDelete && nicheId && (
            <Button variant="outline" className="w-full" disabled={saving} onClick={() => onDelete(nicheId)}>
              <Trash2 size={15} /> Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
