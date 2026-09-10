'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Truck,
  Loader2,
  Package,
} from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('upi');
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const bulkDiscount = total > 5000 ? total * 0.05 : 0;
  const finalTotal = total - bulkDiscount;

  async function handleCheckout() {
    if (!user || items.length === 0) return;
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }
    setProcessing(true);

    const orders = items.map((item) => ({
      crop_id: item.crop.id,
      retailer_id: user.id,
      farmer_id: item.crop.farmer_id,
      quantity: item.quantity,
      total_price: item.crop.price_per_unit * item.quantity * (total > 5000 ? 0.95 : 1),
      status: 'placed' as const,
    }));

    const { error } = await supabase.from('orders').insert(orders);

    setProcessing(false);

    if (error) {
      toast.error('Order could not be placed. Please try again.');
      return;
    }

    setOrderComplete(true);
    clearCart();
  }

  function handleCloseCheckout() {
    setCheckoutOpen(false);
    if (orderComplete) {
      setOrderComplete(false);
      router.push('/marketplace');
    }
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-dashed border-border/60 text-center">
          <CardContent className="p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Browse the marketplace to find fresh crops from verified farmers.
            </p>
            <Link href="/marketplace">
              <Button className="gap-2">
                Browse Marketplace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Your Cart</h1>
      <p className="text-muted-foreground mb-8">{items.length} item{items.length !== 1 ? 's' : ''} from verified farmers</p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Cart Items */}
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.crop.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <Card className="border-border/60">
                  <CardContent className="p-4 flex gap-4">
                    {item.crop.image_url && (
                      <img
                        src={item.crop.image_url}
                        alt={item.crop.name}
                        className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{item.crop.name}</h3>
                          <p className="text-xs text-muted-foreground">{item.crop.location}</p>
                          <Badge variant="secondary" className="mt-1 text-xs">{item.crop.category}</Badge>
                        </div>
                        <button
                          onClick={() => removeItem(item.crop.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.crop.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.crop.id, parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.crop.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-muted-foreground ml-1">{item.crop.unit}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {formatCurrency(item.crop.price_per_unit * item.quantity)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(item.crop.price_per_unit)}/{item.crop.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-20 h-fit">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {bulkDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Bulk discount (5%)</span>
                  <span>–{formatCurrency(bulkDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(finalTotal)}</span>
              </div>

              {bulkDiscount === 0 && total > 0 && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                  Add {formatCurrency(5000 - total)} more for 5% bulk discount!
                </p>
              )}

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => setCheckoutOpen(true)}
              >
                <CreditCard className="h-4 w-4" />
                Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={handleCloseCheckout}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {orderComplete ? (
            <div className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </motion.div>
              <h2 className="text-xl font-bold">Order Placed!</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Your order has been sent to the farmers. You'll receive updates as your crops are packed and shipped.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                Track status in your orders
              </div>
              <Button className="w-full mt-6" onClick={handleCloseCheckout}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Checkout</DialogTitle>
                <DialogDescription>Complete your purchase securely.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Delivery Address */}
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <Input
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Shop/Store address, city, pincode"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi' as const, label: 'UPI', icon: '📱' },
                      { id: 'card' as const, label: 'Card', icon: '💳' },
                      { id: 'cod' as const, label: 'COD', icon: '📦' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                          paymentMethod === method.id
                            ? 'border-primary bg-accent text-accent-foreground'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <span className="text-lg">{method.icon}</span>
                        <span className="text-xs font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Details */}
                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                )}
                {paymentMethod === 'upi' && (
                  <div className="space-y-2">
                    <Label>UPI ID</Label>
                    <Input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@bank"
                    />
                  </div>
                )}
                {paymentMethod === 'cod' && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
                    Pay with cash when your order is delivered. A small COD fee may apply.
                  </p>
                )}

                {/* Summary */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {bulkDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Bulk discount</span>
                      <span>–{formatCurrency(bulkDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCheckout} disabled={processing} className="gap-2">
                    {processing ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Package className="h-4 w-4" /> Place Order</>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
