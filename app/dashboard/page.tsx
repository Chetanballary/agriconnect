'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Truck, Sprout, Plus, ArrowRight, IndianRupee, Inbox } from 'lucide-react';
import { supabase, TABLES } from '@/lib/supabase';
import type { Crop, Order, Inquiry, OrderStatus } from '@/lib/types';
import { CATEGORIES, REGIONS, ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, ORDER_STATUS_STEP } from '@/lib/types';
import { useLang } from '@/components/lang-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR, formatNumber, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusColors: Record<OrderStatus, string> = {
  placed: 'bg-warning/15 text-warning border-warning/30',
  packed: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  in_transit: 'bg-accent/15 text-accent-foreground border-accent/30',
  delivered: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

export default function DashboardPage() {
  const { t } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const [ordersRes, cropsRes, inquiriesRes] = await Promise.all([
      supabase.from(TABLES.ORDERS).select('*').order('created_at', { ascending: false }),
      supabase.from(TABLES.CROPS).select('*').order('created_at', { ascending: false }),
      supabase.from(TABLES.INQUIRIES).select('*').order('created_at', { ascending: false }).limit(8),
    ]);
    setOrders(ordersRes.data || []);
    setCrops(cropsRes.data || []);
    setInquiries(inquiriesRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const earnings = orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total), 0);
    const pending = orders.filter((o) => o.status === 'placed' || o.status === 'packed').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    return { earnings, pending, delivered, activeListings: crops.length };
  }, [orders, crops]);

  const handleStatusUpdate = async (order: Order, newStatus: OrderStatus) => {
    const { error } = await supabase.from(TABLES.ORDERS).update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', order.id);
    if (error) { toast.error(t('common.error')); return; }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
    toast.success(`Order marked: ${ORDER_STATUS_LABEL[newStatus]}`);
  };

  const advanceStatus = (order: Order) => {
    const currentStep = ORDER_STATUS_STEP[order.status];
    if (currentStep < 0 || currentStep >= ORDER_STATUS_FLOW.length - 1) return;
    handleStatusUpdate(order, ORDER_STATUS_FLOW[currentStep + 1]);
  };

  const farmerOrders = orders.slice(0, 10);
  const totalInventory = crops.reduce((sum, c) => sum + Number(c.quantity), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t('dashboard.title')}</h1>
          <p className="mt-1.5 text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 shadow-sm"><Plus className="h-4 w-4" /> {t('dashboard.addListing')}</Button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t('dashboard.earnings'), value: formatINR(stats.earnings), icon: IndianRupee, color: 'text-success', bg: 'bg-success/10' },
          { label: t('dashboard.pending'), value: formatNumber(stats.pending), icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: t('dashboard.delivered'), value: formatNumber(stats.delivered), icon: Truck, color: 'text-primary', bg: 'bg-primary/10' },
          { label: t('dashboard.inventory'), value: `${formatNumber(stats.activeListings)} (${formatNumber(totalInventory)} kg)`, icon: Sprout, color: 'text-accent-foreground', bg: 'bg-accent/15' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.bg)}><stat.icon className={cn('h-5 w-5', stat.color)} /></div>
                <p className="mt-3 text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">{t('dashboard.orders')}</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          ) : farmerOrders.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">{t('dashboard.orders.empty')}</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {farmerOrders.map((order, i) => {
                const step = ORDER_STATUS_STEP[order.status];
                const canAdvance = step >= 0 && step < ORDER_STATUS_FLOW.length - 1;
                return (
                  <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{order.crop_name}</h3>
                              <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold', statusColors[order.status])}>{ORDER_STATUS_LABEL[order.status]}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{order.retailer_name} • {formatNumber(Number(order.quantity))} kg • {formatINR(Number(order.total))}</p>
                            <p className="text-xs text-muted-foreground/70">{timeAgo(order.created_at)}</p>
                          </div>
                          <div className="flex gap-2">
                            {order.status === 'placed' && (
                              <>
                                <Button size="sm" variant="default" onClick={() => handleStatusUpdate(order, 'packed')} className="h-8 text-xs">{t('dashboard.status.accept')}</Button>
                                <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(order, 'rejected')} className="h-8 text-xs text-destructive border-destructive/30">{t('dashboard.status.reject')}</Button>
                              </>
                            )}
                            {canAdvance && (
                              <Button size="sm" variant="outline" onClick={() => advanceStatus(order)} className="h-8 text-xs gap-1.5"><ArrowRight className="h-3.5 w-3.5" /> {t('dashboard.status.advance')}</Button>
                            )}
                          </div>
                        </div>
                        {step >= 0 && (
                          <div className="mt-3 flex items-center gap-1">
                            {ORDER_STATUS_FLOW.map((s, idx) => (
                              <div key={s} className="flex flex-1 items-center gap-1">
                                <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0', idx <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{idx + 1}</div>
                                {idx < ORDER_STATUS_FLOW.length - 1 && <div className={cn('h-0.5 flex-1', idx < step ? 'bg-primary' : 'bg-muted')} />}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t('dashboard.listings')}</h2>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : (
              <div className="space-y-2.5">
                {crops.slice(0, 6).map((crop) => (
                  <div key={crop.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted"><img src={crop.image} alt={crop.name} className="h-full w-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{crop.name}</p>
                      <p className="text-xs text-muted-foreground">{formatINR(Number(crop.price_per_unit))}/kg • {formatNumber(Number(crop.quantity))} kg</p>
                    </div>
                    <Badge variant={crop.active ? 'default' : 'secondary'} className="shrink-0 text-xs">{crop.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                ))}
                {crops.length === 0 && <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No listings yet.</CardContent></Card>}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t('dashboard.inquiries')}</h2>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
            ) : inquiries.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2"><Inbox className="h-8 w-8 text-muted-foreground/50" />{t('dashboard.inquiries.empty')}</CardContent></Card>
            ) : (
              <div className="space-y-2.5">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{inq.retailer_name}</p>
                      <span className="text-xs text-muted-foreground">{timeAgo(inq.created_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{inq.message}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{inq.crop_name}</Badge>
                      {inq.contact && <span className="text-xs text-muted-foreground/70">{inq.contact}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddListingDialog open={addOpen} onOpenChange={setAddOpen} onCreated={fetchData} />
    </div>
  );
}

function AddListingDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', category: 'Grains', price_per_unit: '', quantity: '', harvest_date: '', location: '', region: 'Karnataka', quality: 'A', image: '', description: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.price_per_unit || !form.quantity || !form.location) return;
    setSaving(true);
    const { error } = await supabase.from(TABLES.CROPS).insert({
      name: form.name, category: form.category, price_per_unit: Number(form.price_per_unit), unit: 'kg',
      quantity: Number(form.quantity), quantity_unit: 'kg', harvest_date: form.harvest_date || null,
      location: form.location, region: form.region, farmer_name: 'You (Demo Farmer)', quality: form.quality,
      image: form.image || 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      description: form.description || null, active: true,
    });
    setSaving(false);
    if (error) { toast.error(t('common.error')); return; }
    toast.success(t('dashboard.addListing.success'));
    setForm({ name: '', category: 'Grains', price_per_unit: '', quantity: '', harvest_date: '', location: '', region: 'Karnataka', quality: 'A', image: '', description: '' });
    onOpenChange(false); onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('dashboard.addListing.title')}</DialogTitle>
          <DialogDescription>{t('dashboard.addListing.placeholder.desc')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label htmlFor="f-name">{t('dashboard.addListing.name')}</Label><Input id="f-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('dashboard.addListing.placeholder.name')} /></div>
            <div className="space-y-1.5"><Label>{t('dashboard.addListing.category')}</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label htmlFor="f-price">{t('dashboard.addListing.price')}</Label><Input id="f-price" type="number" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} placeholder="42" /></div>
            <div className="space-y-1.5"><Label htmlFor="f-qty">{t('dashboard.addListing.qty')}</Label><Input id="f-qty" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="1000" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label htmlFor="f-harvest">{t('dashboard.addListing.harvest')}</Label><Input id="f-harvest" type="date" value={form.harvest_date} onChange={(e) => setForm({ ...form, harvest_date: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>{t('dashboard.addListing.quality')}</Label><Select value={form.quality} onValueChange={(v) => setForm({ ...form, quality: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="A">A — Premium</SelectItem><SelectItem value="B">B — Standard</SelectItem><SelectItem value="C">C — Economy</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label htmlFor="f-loc">{t('dashboard.addListing.location')}</Label><Input id="f-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mandya" /></div>
            <div className="space-y-1.5"><Label>{t('dashboard.addListing.region')}</Label><Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="f-img">{t('dashboard.addListing.image')}</Label><Input id="f-img" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder={t('dashboard.addListing.placeholder.image')} /></div>
          <div className="space-y-1.5"><Label htmlFor="f-desc">{t('dashboard.addListing.desc')}</Label><Textarea id="f-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder={t('dashboard.addListing.placeholder.desc')} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.name || !form.price_per_unit || !form.quantity || !form.location}>{saving ? t('common.loading') : t('dashboard.addListing.submit')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
