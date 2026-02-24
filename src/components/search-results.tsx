'use client';

import { Item } from '@/app/actions/search-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Package, Info } from 'lucide-react';

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
    const gold = Math.floor(copper / 10000);
    const silver = Math.floor((copper % 10000) / 100);
    const copperLeft = copper % 100;
    return `${gold}g ${silver}s ${copperLeft}c`;
  };

  return (
    <div className="grid gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {results.map((item, index) => (
        <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                {item.name}
              </CardTitle>
              <div className="flex items-center gap-1.5 text-2xl font-bold text-primary">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>{formatGold(item.minBuyout)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span className="font-semibold text-foreground">Market Value:</span>
                <span>{formatGold(item.marketValue)}</span>
              </div>
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                <span className="font-bold text-foreground">{item.numAuctions}</span>
                <span>active auctions</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 border-t bg-slate-50/50 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
              <Info className="w-3.5 h-3.5" />
              Last updated: {new Date(item.snapshot_time).toLocaleString()}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
