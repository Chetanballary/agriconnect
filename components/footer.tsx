'use client';

import Link from 'next/link';
import { Sprout, Mail, Phone, MapPin } from 'lucide-react';
import { useLang } from '@/components/lang-provider';

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-foreground">Agri Direct</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">{t('footer.tagline')}</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@agridirect.in</span>
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 80 4567 8900</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Bengaluru, Karnataka</span>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t('footer.product')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-primary transition-colors">{t('nav.marketplace')}</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">{t('nav.farmer')}</Link></li>
              <li><Link href="/fair-price" className="hover:text-primary transition-colors">{t('nav.fairprice')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t('footer.company')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer.about')}</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer.faq')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Agri Direct. {t('footer.rights')}
          </p>
          <p className="text-xs text-muted-foreground/70">
            Built for farmers, by design.
          </p>
        </div>
      </div>
    </footer>
  );
}
