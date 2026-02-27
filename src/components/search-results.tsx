
'use client';

import { Item } from '@/app/actions/search-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Package, Info } from 'lucide-react';
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

  return (
    <div className="grid gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {results.map((item, index) => (
        <Card key={`${item.Display_lang}-${index}`} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-2xl font-extrabold group-hover:text-primary transition-colors">
                {item.Display_lang}
              </CardTitle>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 text-2xl font-black text-primary">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span>{formatGold(item.minBuyout)}</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Min Buyout</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="w-4 h-4" />
                <span className="font-semibold text-foreground">Market Value:</span>
                <span className="font-mono">{formatGold(item.marketValue)}</span>
              </div>
              <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-none font-bold">
                {item.numAuctions} active auctions
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t bg-slate-50/80 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1 opacity-70">
                <Info className="w-3.5 h-3.5" />
                <span>Last updated: {new Date(item.snapshot_time).toLocaleString()}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
