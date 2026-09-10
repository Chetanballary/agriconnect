'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sprout, Store, Tractor, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const { user, profile, signIn, signUp, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('RETAILER');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && profile) {
      router.push(profile.role === 'FARMER' ? '/dashboard' : '/marketplace');
    }
  }, [user, profile, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Welcome back!');
      }
    } else {
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, role);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Account created! Welcome to Agri Direct.');
      }
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 hero-gradient">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto mb-2">
              <Sprout className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">
              {mode === 'signin' ? t('signIn') : t('signUp')}
            </CardTitle>
            <CardDescription>
              {mode === 'signin'
                ? 'Sign in to your Agri Direct account'
                : 'Create your account to start trading'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Mode Toggle */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
              <button
                onClick={() => setMode('signin')}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-all',
                  mode === 'signin' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                )}
              >
                {t('signIn')}
              </button>
              <button
                onClick={() => setMode('signup')}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-all',
                  mode === 'signup' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                )}
              >
                {t('signUp')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('fullName')}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Rajesh Kumar"
                          required
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('iAmA')}</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('FARMER')}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                            role === 'FARMER'
                              ? 'border-primary bg-accent text-accent-foreground'
                              : 'border-border hover:border-primary/40'
                          )}
                        >
                          <Tractor className="h-6 w-6" />
                          <span className="text-sm font-medium">{t('farmer')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('RETAILER')}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                            role === 'RETAILER'
                              ? 'border-primary bg-accent text-accent-foreground'
                              : 'border-border hover:border-primary/40'
                          )}
                        >
                          <Store className="h-6 w-6" />
                          <span className="text-sm font-medium">{t('retailer')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || loading}
              >
                {submitting ? 'Please wait...' : mode === 'signin' ? t('signIn') : t('signUp')}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-6">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-primary font-medium hover:underline"
              >
                {mode === 'signin' ? t('signUp') : t('signIn')}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
