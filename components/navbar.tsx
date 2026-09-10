'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Sprout, ShoppingCart, LayoutDashboard, LogOut, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const { itemCount } = useCart();
  const pathname = usePathname();

  const isFarmer = profile?.role === 'FARMER';
  const isRetailer = profile?.role === 'RETAILER' || !user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Agri<span className="text-primary">Direct</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {(isRetailer || !user) && (
            <Link href="/marketplace">
              <Button
                variant={pathname === '/marketplace' ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                {t('marketplace')}
              </Button>
            </Link>
          )}

          {isRetailer && (
            <Link href="/marketplace/cart">
              <Button
                variant={pathname === '/marketplace/cart' ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2 relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {t('cart')}
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {isFarmer && (
            <Link href="/dashboard">
              <Button
                variant={pathname?.startsWith('/dashboard') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('dashboard')}
              </Button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {profile?.full_name?.split(' ')[0]}
              </span>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title={t('signOut')}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                {t('signIn')}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
