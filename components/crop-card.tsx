'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Calendar, User, Package } from 'lucide-react';
import type { Crop } from '@/lib/types';
import { formatINR, formatNumber, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLang } from '@/components/lang-provider';

const qualityColors: Record<string, string> = {
  A: 'bg-success/15 text-success border-success/30',
  B: 'bg-warning/15 text-warning border-warning/30',
  C: 'bg-muted text-muted-foreground border-border',
};

type Props = {
  crop: Crop;
  onAddCart?: (crop: Crop) => void;
  onInquire?: (crop: Crop) => void;
  index?: number;
};

export function CropCard({ crop, onAddCart, onInquire, index = 0 }: Props) {
  const { t } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={crop.image}
          alt={crop.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge className="bg-background/90 backdrop-blur text-foreground border-border/50 shadow-sm">
            {crop.category}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-bold backdrop-blur', qualityColors[crop.quality] || qualityColors.C)}>
            {t('market.quality')} {crop.quality}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-white/90">
            <MapPin className="h-3.5 w-3.5" /> {crop.location}, {crop.region}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-bold text-foreground leading-tight">{crop.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" /> {crop.farmer_name}
          </p>
        </div>

        {crop.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{crop.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            {formatNumber(crop.quantity)} {crop.quantity_unit}
          </span>
          {crop.harvest_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(crop.harvest_date)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">
              {formatINR(crop.price_per_unit)}
            </span>
            <span className="text-xs text-muted-foreground">{t('market.perKg')}</span>
          </div>
          <div className="flex gap-1.5">
            {onInquire && (
              <Button size="sm" variant="outline" onClick={() => onInquire(crop)} className="h-8 px-3 text-xs">
                {t('market.inquire')}
              </Button>
            )}
            {onAddCart && (
              <Button size="sm" onClick={() => onAddCart(crop)} className="h-8 px-3 text-xs">
                {t('market.addCart')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
