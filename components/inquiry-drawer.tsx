'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { supabase, TABLES } from '@/lib/supabase';
import type { Crop } from '@/lib/types';
import { useLang } from '@/components/lang-provider';
import { toast } from 'sonner';

type Props = {
  crop: Crop | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InquiryDrawer({ crop, open, onOpenChange }: Props) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);

  if (!crop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop || !name || !message) return;
    setSending(true);
    const { error } = await supabase.from(TABLES.INQUIRIES).insert({
      crop_id: crop.id,
      crop_name: crop.name,
      farmer_name: crop.farmer_name,
      retailer_name: name,
      message,
      contact: contact || null,
    });
    setSending(false);
    if (error) { toast.error(t('common.error')); return; }
    toast.success(t('market.inquiry.sent'));
    setName(''); setMessage(''); setContact('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>{t('market.inquiry.title')}</SheetTitle>
          <SheetDescription>
            {t('market.inquiry.to')} <span className="font-semibold text-foreground">{crop.farmer_name}</span> — {crop.name}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex-1 space-y-4 px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="inq-name">{t('market.inquiry.name')}</Label>
            <Input id="inq-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="FreshMart Stores" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inq-contact">{t('market.inquiry.contact')}</Label>
            <Input id="inq-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inq-msg">{t('market.inquiry.message')}</Label>
            <Textarea id="inq-msg" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder={t('market.inquiry.placeholder')} />
          </div>
        </form>
        <SheetFooter>
          <Button onClick={handleSubmit} disabled={sending || !name || !message} className="gap-2 w-full">
            <Send className="h-4 w-4" /> {sending ? t('common.loading') : t('market.inquiry.send')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
