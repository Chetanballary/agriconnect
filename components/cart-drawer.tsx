'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { useLang } from '@/components/lang-provider';
import { formatINR, formatNumber } from '@/lib/format';
import Link from 'next/link';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
};

export function CartDrawer({ open, onOpenChange, onCheckout }: Props) {
  const { t } = useLang();
  const { items, updateQty, remove, subtotal, bulkDiscount, total } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> {t('cart.title')}
          </SheetTitle>
          <SheetDescription>
            {items.length} {items.length === 1 ? t('cart.item') : t('cart.items')}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t('cart.empty')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('cart.empty.desc')}</p>
            </div>
            <Link href="/marketplace" onClick={() => onOpenChange(false)}>
              <Button>{t('cart.browse')}</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <div key={item.crop.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img src={item.crop.image} alt={item.crop.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{item.crop.name}</p>
                        <p className="text-xs text-muted-foreground">{item.crop.farmer_name}</p>
                      </div>
                      <button onClick={() => remove(item.crop.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label={t('cart.remove')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-lg border border-border">
                        <button onClick={() => updateQty(item.crop.id, item.quantity - 10)} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <Input type="number" value={item.quantity} onChange={(e) => updateQty(item.crop.id, Number(e.target.value) || 0)} className="h-7 w-16 border-0 text-center text-sm focus-visible:ring-0 px-0" />
                        <button onClick={() => updateQty(item.crop.id, item.quantity + 10)} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-primary">{formatINR(item.crop.price_per_unit * item.quantity)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatNumber(item.quantity)} kg × {formatINR(item.crop.price_per_unit)}/kg</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-4 py-4 space-y-2">
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
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>{t('cart.total')}</span>
                <span className="text-primary">{formatINR(total())}</span>
              </div>
              <Button onClick={onCheckout} className="w-full gap-2 mt-2">
                {t('cart.checkout')} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
