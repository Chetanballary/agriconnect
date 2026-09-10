'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, TrendingUp, TrendingDown, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { supabase, TABLES } from '@/lib/supabase';
import type { FairPrice } from '@/lib/types';
import { useLang } from '@/components/lang-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR, formatINRDecimal } from '@/lib/format';
import { cn } from '@/lib/utils';

type Verdict = 'fair' | 'undercut' | 'overpriced' | null;

export default function FairPricePage() {
  const { t } = useLang();
  const [prices, setPrices] = useState<FairPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [yourPrice, setYourPrice] = useState<string>('');
  const [verdict, setVerdict] = useState<Verdict>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from(TABLES.FAIR_PRICES).select('*').order('crop_name');
      setPrices(data || []);
      if (data && data.length > 0) { setSelectedCrop(data[0].crop_name); setSelectedRegion(data[0].region); }
      setLoading(false);
    })();
  }, []);

  const crops = useMemo(() => [...new Set(prices.map((p) => p.crop_name))].sort(), [prices]);
  const regions = useMemo(() => [...new Set(prices.filter((p) => p.crop_name === selectedCrop).map((p) => p.region))].sort(), [prices, selectedCrop]);
  const match = useMemo(() => prices.find((p) => p.crop_name === selectedCrop && p.region === selectedRegion) || null, [prices, selectedCrop, selectedRegion]);

  const checkFairness = () => {
    if (!match || !yourPrice) return;
    const price = Number(yourPrice);
    if (price < Number(match.min_price)) setVerdict('undercut');
    else if (price > Number(match.max_price)) setVerdict('overpriced');
    else setVerdict('fair');
  };

  const verdictConfig = {
    fair: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', title: t('fair.verdict.fair'), desc: t('fair.verdict.fair.desc') },
    undercut: { icon: TrendingDown, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', title: t('fair.verdict.undercut'), desc: t('fair.verdict.undercut.desc') },
    overpriced: { icon: TrendingUp, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', title: t('fair.verdict.overpriced'), desc: t('fair.verdict.overpriced.desc') },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary">
          <Scale className="h-4 w-4" /> {t('fair.title')}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t('fair.title')}</h1>
        <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{t('fair.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('fair.title')}</CardTitle>
            <CardDescription>{t('fair.disclaimer')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>{t('fair.crop')}</Label>
                  <Select value={selectedCrop} onValueChange={(v) => { setSelectedCrop(v); setVerdict(null); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{crops.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('fair.region')}</Label>
                  <Select value={selectedRegion} onValueChange={(v) => { setSelectedRegion(v); setVerdict(null); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {match ? (
                  <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="text-center"><p className="text-xs text-muted-foreground">{t('fair.min')}</p><p className="text-lg font-bold text-foreground">{formatINR(Number(match.min_price))}</p></div>
                    <div className="text-center border-x border-border"><p className="text-xs text-primary font-medium">{t('fair.modal')}</p><p className="text-lg font-bold text-primary">{formatINR(Number(match.modal_price))}</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">{t('fair.max')}</p><p className="text-lg font-bold text-foreground">{formatINR(Number(match.max_price))}</p></div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">{t('fair.noData')}</div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="yp">{t('fair.yourPrice')} (per kg)</Label>
                  <Input id="yp" type="number" value={yourPrice} onChange={(e) => { setYourPrice(e.target.value); setVerdict(null); }} placeholder="42" className="text-lg font-semibold" />
                </div>
                <Button onClick={checkFairness} disabled={!match || !yourPrice} className="w-full gap-2"><Sparkles className="h-4 w-4" /> {t('fair.check')}</Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {match && (
            <Card className="overflow-hidden shadow-sm">
              <div className="relative h-32 bg-gradient-to-br from-primary/15 to-accent/15">
                <div className="relative flex h-full flex-col items-center justify-center">
                  <p className="text-xs font-medium text-muted-foreground">{t('fair.range')}</p>
                  <p className="text-2xl font-bold text-foreground">{formatINRDecimal(Number(match.min_price))} – {formatINRDecimal(Number(match.max_price))}</p>
                  <p className="text-xs text-muted-foreground">per {match.unit}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-center text-sm text-muted-foreground"><span className="font-semibold text-primary">{t('fair.modal')}:</span> {formatINR(Number(match.modal_price))} — the most common trading price.</p>
              </CardContent>
            </Card>
          )}

          <AnimatePresence mode="wait">
            {verdict && (
              <motion.div key={verdict} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card className={cn('border-2 shadow-md', verdictConfig[verdict].border)}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', verdictConfig[verdict].bg)}>
                        {(() => { const Icon = verdictConfig[verdict].icon; return <Icon className={cn('h-6 w-6', verdictConfig[verdict].color)} />; })()}
                      </div>
                      <div className="flex-1">
                        <h3 className={cn('text-lg font-bold', verdictConfig[verdict].color)}>{verdictConfig[verdict].title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{verdictConfig[verdict].desc}</p>
                        <p className="mt-2 text-sm font-medium text-foreground">Your price: {formatINR(Number(yourPrice))}/kg</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!verdict && !loading && match && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Info className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-sm text-muted-foreground max-w-xs">Enter your offered price and tap &quot;{t('fair.check')}&quot; to see if it&apos;s fair.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-foreground">All Fair Prices</h2>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-5 gap-2 bg-muted/50 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
              <span>Crop</span><span>Category</span><span>Region</span><span>Min – Max</span><span className="text-right">Modal</span>
            </div>
            <div className="divide-y divide-border">
              {prices.map((p) => (
                <div key={p.id} className="grid grid-cols-5 gap-2 px-4 py-2.5 text-sm hover:bg-muted/40 transition-colors">
                  <span className="font-medium text-foreground">{p.crop_name}</span>
                  <span className="text-muted-foreground">{p.category}</span>
                  <span className="text-muted-foreground">{p.region}</span>
                  <span className="text-muted-foreground">{formatINR(Number(p.min_price))} – {formatINR(Number(p.max_price))}</span>
                  <span className="text-right font-semibold text-primary">{formatINR(Number(p.modal_price))}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
