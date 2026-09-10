'use client';

import { useState } from 'react';
import { FAIR_PRICE_DATA } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Info } from 'lucide-react';

export function FairPriceEstimator() {
  const cropNames = Object.keys(FAIR_PRICE_DATA);
  const [selectedCrop, setSelectedCrop] = useState(cropNames[0]);

  const data = FAIR_PRICE_DATA[selectedCrop];
  const range = data.max - data.min;
  const lowRange = data.min + range * 0.33;
  const highRange = data.max - range * 0.33;

  return (
    <Card className="border-border/60 bg-gradient-to-br from-accent/40 to-secondary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Fair Price Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cropNames.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-3">
          {/* Price bar visualization */}
          <div className="relative h-8 rounded-full overflow-hidden bg-muted">
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-red-200/60" />
              <div className="flex-1 bg-green-300/70" />
              <div className="flex-1 bg-amber-200/60" />
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
              <span>{formatCurrency(data.min)}</span>
              <span className="text-primary font-bold">{formatCurrency(data.avg)}</span>
              <span>{formatCurrency(data.max)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-red-50 p-2">
              <div className="text-xs text-muted-foreground">Below Fair</div>
              <div className="text-sm font-semibold text-red-600">
                &lt; {formatCurrency(Math.round(lowRange))}
              </div>
            </div>
            <div className="rounded-md bg-green-50 p-2">
              <div className="text-xs text-muted-foreground">Fair Range</div>
              <div className="text-sm font-semibold text-green-600">
                {formatCurrency(Math.round(lowRange))}–{formatCurrency(Math.round(highRange))}
              </div>
            </div>
            <div className="rounded-md bg-amber-50 p-2">
              <div className="text-xs text-muted-foreground">Premium</div>
              <div className="text-sm font-semibold text-amber-600">
                &gt; {formatCurrency(Math.round(highRange))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background/60 rounded-md p-2.5">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Market average for {selectedCrop}: <strong className="text-foreground">{formatCurrency(data.avg)}/{data.unit}</strong>. Selling below fair range risks undercutting.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
