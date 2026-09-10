'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sprout, Scale, Truck, Languages, PackageCheck, Store, TrendingUp, ShieldCheck, MapPin } from 'lucide-react';
import { supabase, TABLES } from '@/lib/supabase';
import type { Crop } from '@/lib/types';
import { useLang } from '@/components/lang-provider';
import { CropCard } from '@/components/crop-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/format';

export default function Home() {
  const { t } = useLang();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ farmers: 247, retailers: 180, crops: 0, regions: 5 });

  useEffect(() => {
    (async () => {
      const { data: cropData } = await supabase
        .from(TABLES.CROPS)
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(6);
      setCrops(cropData || []);
      const regions = new Set((cropData || []).map((c: Crop) => c.region));
      setStats((s) => ({ ...s, crops: cropData?.length || 0, regions: Math.max(regions.size, 5) }));
      setLoading(false);
    })();
  }, []);

  const heroStats = [
    { label: t('hero.stat.farmers'), value: stats.farmers, icon: Sprout },
    { label: t('hero.stat.retailers'), value: stats.retailers, icon: Store },
    { label: t('hero.stat.crops'), value: stats.crops, icon: PackageCheck },
    { label: t('hero.stat.regions'), value: stats.regions, icon: MapPin },
  ];

  const features = [
    { icon: Scale, title: t('features.fair.title'), desc: t('features.fair.desc') },
    { icon: TrendingUp, title: t('features.direct.title'), desc: t('features.direct.desc') },
    { icon: Truck, title: t('features.tracking.title'), desc: t('features.tracking.desc') },
    { icon: Languages, title: t('features.lang.title'), desc: t('features.lang.desc') },
  ];

  const steps = [
    { icon: Sprout, title: t('how.step1.title'), desc: t('how.step1.desc') },
    { icon: Store, title: t('how.step2.title'), desc: t('how.step2.desc') },
    { icon: ShieldCheck, title: t('how.step3.title'), desc: t('how.step3.desc') },
    { icon: Truck, title: t('how.step4.title'), desc: t('how.step4.desc') },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary">
                <Sprout className="h-4 w-4" /> {t('hero.badge')}
              </span>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
                {t('hero.title').split('\n').map((line: string, i: number) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">{t('hero.subtitle')}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/marketplace">
                  <Button size="lg" className="gap-2 shadow-md">{t('hero.cta.browse')} <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="gap-2"><Sprout className="h-4 w-4" /> {t('hero.cta.farmer')}</Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-4">
                {heroStats.map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex flex-col gap-1">
                    <stat.icon className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{formatNumber(stat.value)}</span>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {crops.slice(0, 4).map((crop, i) => (
                  <motion.div key={crop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className={i % 2 === 0 ? 'mt-8' : ''}>
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                      <div className="relative aspect-square bg-muted">
                        {crop.image && <img src={crop.image} alt={crop.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-foreground truncate">{crop.name}</p>
                        <p className="text-xs text-muted-foreground">{crop.region}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {loading && Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={i % 2 === 0 ? 'mt-8' : ''}><Skeleton className="aspect-square rounded-2xl" /></div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t('featured.title')}</h2>
            <p className="mt-1.5 text-muted-foreground">{t('featured.subtitle')}</p>
          </div>
          <Link href="/marketplace">
            <Button variant="ghost" className="gap-1.5 text-primary">{t('featured.viewall')} <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
            : crops.map((crop, i) => <CropCard key={crop.id} crop={crop} index={i} />)}
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t('features.title')}</h2>
            <p className="mt-1.5 text-muted-foreground">{t('features.subtitle')}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, i) => (
              <motion.div key={feat.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><feat.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feat.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t('how.title')}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative rounded-2xl border border-border bg-card p-5">
              <span className="absolute right-4 top-3 text-5xl font-black text-primary/10">{i + 1}</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground"><step.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center shadow-xl sm:px-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">{t('cta.title')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">{t('cta.subtitle')}</p>
            <Link href="/marketplace" className="inline-block mt-6">
              <Button size="lg" variant="secondary" className="gap-2 shadow-lg">{t('cta.button')} <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
