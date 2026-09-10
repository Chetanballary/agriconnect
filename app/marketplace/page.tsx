'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, PackageSearch, ShoppingCart } from 'lucide-react';
import { supabase, TABLES } from '@/lib/supabase';
import type { Crop } from '@/lib/types';
import { CATEGORIES, REGIONS } from '@/lib/types';
import { useLang } from '@/components/lang-provider';
import { useCart } from '@/lib/cart-store';
import { CropCard } from '@/components/crop-card';
import { InquiryDrawer } from '@/components/inquiry-drawer';
import { CartDrawer } from '@/components/cart-drawer';
import { CheckoutSheet } from '@/components/checkout-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatINR } from '@/lib/format';

export default function MarketplacePage() {
  const { t } = useLang();
  const addCart = useCart((s) => s.add);
  const cartCount = useCart((s) => s.items.length);

  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [region, setRegion] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 120]);
  const [sortBy, setSortBy] = useState('recent');

  const [inquiryCrop, setInquiryCrop] = useState<Crop | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from(TABLES.CROPS)
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (error) setError(true);
      else setCrops(data || []);
      setLoading(false);
    })();
  }, []);

  const handleAddCart = useCallback((crop: Crop) => {
    addCart(crop, 50);
    toast.success(`${crop.name} added to cart`, { description: `50 kg — ${formatINR(crop.price_per_unit * 50)}` });
  }, [addCart]);

  const handleInquire = useCallback((crop: Crop) => {
    setInquiryCrop(crop);
    setInquiryOpen(true);
  }, []);

  const filtered = useMemo(() => {
    let result = crops.filter((c) => {
      if (category !== 'all' && c.category !== category) return false;
      if (region !== 'all' && c.region !== region) return false;
      if (c.price_per_unit < priceRange[0] || c.price_per_unit > priceRange[1]) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.farmer_name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.region.toLowerCase().includes(q);
      }
      return true;
    });
    if (sortBy === 'price-low') result = [...result].sort((a, b) => a.price_per_unit - b.price_per_unit);
    else if (sortBy === 'price-high') result = [...result].sort((a, b) => b.price_per_unit - a.price_per_unit);
    else if (sortBy === 'quantity') result = [...result].sort((a, b) => b.quantity - a.quantity);
    return result;
  }, [crops, category, region, priceRange, search, sortBy]);

  const clearFilters = () => { setSearch(''); setCategory('all'); setRegion('all'); setPriceRange([0, 120]); setSortBy('recent'); };
  const hasFilters = search || category !== 'all' || region !== 'all' || priceRange[0] !== 0 || priceRange[1] !== 120;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t('market.title')}</h1>
          <p className="mt-1.5 text-muted-foreground">{t('market.subtitle')}</p>
        </div>
        {cartCount > 0 && (
          <Button variant="outline" onClick={() => setCartOpen(true)} className="gap-2">
            <ShoppingCart /> {cartCount} {cartCount === 1 ? t('cart.item') : t('cart.items')}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start space-y-5 rounded-2xl border border-border bg-card p-5 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><SlidersHorizontal className="h-4 w-4" /> {t('market.filters')}</h2>
            {hasFilters && <button onClick={clearFilters} className="text-xs text-primary hover:underline">{t('market.clear')}</button>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{t('market.search')}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('market.search')} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{t('market.category')}</Label>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setCategory('all')} className={cn('rounded-full px-3 py-1 text-xs font-medium transition-colors border', category === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted')}>{t('market.all')}</button>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} className={cn('rounded-full px-3 py-1 text-xs font-medium transition-colors border', category === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted')}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{t('market.region')}</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('market.all')}</SelectItem>
                {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">{t('market.priceRange')}</Label>
              <span className="text-xs font-medium text-foreground">{formatINR(priceRange[0])} – {formatINR(priceRange[1])}</span>
            </div>
            <Slider value={priceRange} onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])} min={0} max={120} step={2} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Sort</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="quantity">Largest Quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{loading ? '…' : <span className="font-medium text-foreground">{filtered.length}</span>} {t('market.results')}</p>
          </div>
          {error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <PackageSearch className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">{t('common.error')}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>{t('common.retry')}</Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <PackageSearch className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">{t('market.empty')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('market.empty.desc')}</p>
              </div>
              <Button variant="outline" onClick={clearFilters}>{t('market.clear')}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((crop, i) => (
                <CropCard key={crop.id} crop={crop} index={i} onAddCart={handleAddCart} onInquire={handleInquire} />
              ))}
            </div>
          )}
        </div>
      </div>

      <InquiryDrawer crop={inquiryCrop} open={inquiryOpen} onOpenChange={setInquiryOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutSheet open={checkoutOpen} onOpenChange={setCheckoutOpen} onSuccess={() => {}} />
    </div>
  );
}
