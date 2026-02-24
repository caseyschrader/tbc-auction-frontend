'use client';

import { Item } from '@/app/actions/search-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Package, Info, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SearchResultsProps = {
  results: Item[];
  isLoading: boolean;
};

export function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 w-full animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  const formatGold = (copper: number) => {
    if (!copper || copper <= 0) return '0g 0s 0c';
    const gold = Math.floor(copper / 10000);
    const silver = Math.floor((copper % 10000) / 100);
    const copperLeft = copper % 100;
    return `${gold}g ${silver}s ${copperLeft}c`;
  };

  const isValidDate = (dateString: string) => {
    const d = new Date(dateString);
    return d instanceof Date && !isNaN(d.getTime()) && d.getFullYear() > 1970;
  };

  return (
    <div className="grid gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {results.map((item, index) => (
        <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-2xl font-extrabold group-hover:text-primary transition-colors line-clamp-2">
                {item.Display_lang}
              </CardTitle>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 text-2xl font-black text-primary">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span>{formatGold(item.minBuyout)}</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Buyout</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="w-4 h-4" />
                <span className="font-semibold text-foreground">Market:</span>
                <span className="font-mono">{formatGold(item.marketValue)}</span>
              </div>
              <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-none font-bold">
                {item.numAuctions || 0} active auctions
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t bg-slate-50/80 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Info className="w-3.5 h-3.5" />
              {isValidDate(item.snapshot_time) ? (
                <span>Last updated: {new Date(item.snapshot_time).toLocaleString()}</span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-destructive" /> 
                  Update time unavailable
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
