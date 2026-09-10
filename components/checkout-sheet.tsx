'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { useLang } from '@/components/lang-provider';
import { formatINR } from '@/lib/format';
import { supabase, TABLES } from '@/lib/supabase';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function CheckoutSheet({ open, onOpenChange, onSuccess }: Props) {
  const { t } = useLang();
  const { items, subtotal, bulkDiscount, total, clear } = useCart();
  const [retailerName, setRetailerName] = useState('');
  const [notes, setNotes] = useState('');
  const [method, setMethod] = useState('card');
  const [phase, setPhase] = useState<'form' | 'processing' | 'success'>('form');

  const handleCheckout = async () => {
    if (!retailerName || items.length === 0) return;
    setPhase('processing');
    await new Promise((r) => setTimeout(r, 1800));

    const orders = items.map((item) => ({
      crop_id: item.crop.id,
      crop_name: item.crop.name,
      farmer_name: item.crop.farmer_name,
      retailer_name: retailerName,
      quantity: item.quantity,
      unit: item.crop.unit,
      price_per_unit: item.crop.price_per_unit,
      total: item.crop.price_per_unit * item.quantity,
      status: 'placed' as const,
      notes: notes || null,
    }));

    const { error } = await supabase.from(TABLES.ORDERS).insert(orders);
    if (error) { toast.error(t('common.error')); setPhase('form'); return; }
    setPhase('success');
    toast.success(t('cart.checkout.success'));
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open && phase === 'success') {
      clear(); setRetailerName(''); setNotes(''); setPhase('form'); onSuccess();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        {phase === 'success' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{t('cart.checkout.success')}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{t('cart.checkout.successDesc')}</p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2 w-full">{t('common.close')}</Button>
          </div>
        ) : phase === 'processing' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">{t('cart.checkout.processing')}</p>
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{t('cart.checkout.title')}</SheetTitle>
              <SheetDescription>{t('cart.checkout.simulate')}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="co-name">{t('cart.name')}</Label>
                <Input id="co-name" value={retailerName} onChange={(e) => setRetailerName(e.target.value)} placeholder="FreshMart Stores" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-notes">{t('cart.notes')}</Label>
                <Textarea id="co-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Delivery instructions..." />
              </div>
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span className="font-medium">{formatINR(subtotal())}</span>
                </div>
                {bulkDiscount() > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>{t('cart.bulk')}</span>
                    <span className="font-medium">−{formatINR(bulkDiscount())}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between text-base font-bold">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary">{formatINR(total())}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('cart.checkout.payment')} {t('cart.checkout.method')}</Label>
                <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-2 gap-3">
                  <label htmlFor="m-card" className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem id="m-card" value="card" />
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('cart.checkout.card')}</span>
                  </label>
                  <label htmlFor="m-upi" className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem id="m-upi" value="upi" />
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('cart.checkout.upi')}</span>
                  </label>
                </RadioGroup>
              </div>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> {t('cart.checkout.simulate')}
              </p>
            </div>
            <SheetFooter>
              <Button onClick={handleCheckout} disabled={!retailerName || items.length === 0} className="w-full">
                {t('cart.checkout.placeOrder')} • {formatINR(total())}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
