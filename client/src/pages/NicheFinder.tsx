// FINESSEOS — Niche Finder page
// Researches golden micro-niches (low competition, real traffic, buyers with money).
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Telescope, Search, Sparkles, AlertCircle } from 'lucide-react';
import { NicheCard, type GoldenNiche } from '@/components/NicheCard';
import DashboardLayout from '@/components/DashboardLayout';

const SEED_IDEAS = [
  'home fitness equipment',
  'pet care for apartment dwellers',
  'personal finance for freelancers',
  'productivity tools for developers',
];

export default function NicheFinder() {
  const [seed, setSeed] = useState('');
  const [competition, setCompetition] = useState<'low' | 'any'>('low');
  const [results, setResults] = useState<GoldenNiche[] | null>(null);
  const [searchedSeed, setSearchedSeed] = useState('');

  const utils = trpc.useUtils();

  const researchMut = trpc.niches.research.useMutation({
    onSuccess: (data) => { setResults(data.niches); setSearchedSeed(data.seed); },
    onError: (e) => toast.error('Research failed', { description: e.message }),
  });
  const savedQuery = trpc.niches.list.useQuery();
  const saveMut = trpc.niches.save.useMutation({
    onSuccess: () => { utils.niches.list.invalidate(); toast.success('Niche saved to your vault'); },
    onError: (e) => toast.error('Could not save niche', { description: e.message }),
  });
  const deleteMut = trpc.niches.delete.useMutation({
    onSuccess: () => { utils.niches.list.invalidate(); toast.success('Niche removed'); },
    onError: (e) => toast.error('Could not remove niche', { description: e.message }),
  });

  const savedNames = new Set((savedQuery.data ?? []).map((n: any) => n.nicheName as string));

  const handleResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim()) return;
    setResults(null);
    researchMut.mutate({ seed: seed.trim(), competitionPreference: competition });
  };

  const handleSave = (niche: GoldenNiche) => {
    saveMut.mutate({ ...niche, seed: searchedSeed });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="badge-category">
              <span className="badge-category-dot" />
              Niche Scout
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Niche Finder</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Uncover golden micro-niches with low competition, healthy monthly traffic, and buyers with money to spend fixing real problems.
          </p>
        </div>

        {/* Search */}
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 pt-6">
            <form onSubmit={handleResearch} className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Market or seed keyword</label>
                <Input
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="e.g. home fitness, pet care, personal finance…"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Competition</label>
                <Select value={competition} onValueChange={(v: 'low' | 'any') => setCompetition(v)}>
                  <SelectTrigger className="h-11 w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low competition</SelectItem>
                    <SelectItem value="any">Any level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                type="submit"
                className="btn-primary-gradient md:mb-px disabled:opacity-60"
                disabled={researchMut.isPending || !seed.trim()}
              >
                <Search size={18} />
                {researchMut.isPending ? 'Researching…' : 'Find Golden Niches'}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Try:</span>
              {SEED_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setSeed(idea)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {idea}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {researchMut.isError && (
          <Card className="border-rose-500/30 bg-rose-500/5">
            <CardContent className="flex items-center gap-3 pt-6 text-sm text-rose-300">
              <AlertCircle size={18} />
              <span>Research failed. Make sure the AI engine is configured, then try again.</span>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {researchMut.isPending && (
          <section>
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <Sparkles size={16} className="animate-pulse text-primary" />
              <span className="text-sm">Scouting golden micro-niches in “{seed}”…</span>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[420px] rounded-xl" />
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        {results && !researchMut.isPending && (
          <section>
            <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
              {results.length} golden niches found in “{searchedSeed}”
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((niche, i) => (
                <NicheCard
                  key={i}
                  niche={niche}
                  saved={savedNames.has(niche.nicheName)}
                  onSave={handleSave}
                  saving={saveMut.isPending}
                />
              ))}
            </div>
          </section>
        )}

        {/* Saved niches */}
        {savedQuery.isLoading && (
          <Skeleton className="h-10 w-56" />
        )}
        {savedQuery.data && savedQuery.data.length > 0 && (
          <section>
            <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Saved golden niches</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {savedQuery.data.map((n: any) => (
                <NicheCard
                  key={n.id}
                  niche={n}
                  saved
                  nicheId={n.id}
                  onDelete={(id) => deleteMut.mutate({ nicheId: id })}
                  saving={deleteMut.isPending}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty hint */}
        {!results && !researchMut.isPending && !researchMut.isError && savedQuery.data?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <Telescope size={36} className="mb-4 text-primary/60" />
            <p className="font-heading text-lg font-semibold text-foreground">Find your first golden niche</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Enter a broad market above and the Niche Scout will surface micro-niches worth promoting.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
