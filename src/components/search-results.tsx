
'use client';

import { Item } from '@/app/actions/search-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Package, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PriceHistoryChart } from '@/components/price-history-chart';
import { DayOfWeekChart } from '@/components/day-of-week-chart';

type SearchResultsProps = {
  results: Item[];
  isLoading: boolean;
};

export function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 w-full animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted rounded-xl w-full" />
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
    <div className="grid gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {results.map((item, index) => {
        const isUndervalued = item.minBuyout < item.marketValue;
        
        return (
          <Card key={`${item.Display_lang}-${index}`} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all group bg-white/60 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
                    {item.Display_lang}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      ID: {item.itemId}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-none font-black text-xs px-3 py-1">
                      {item.numAuctions} ACTIVE LISTINGS
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-w-[200px]">
                  <div className="flex items-center gap-2 text-2xl font-black text-slate-900">
                    <Coins className="w-6 h-6 text-amber-500" />
                    <span>{formatGold(item.minBuyout)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Current Min Buyout</span>
                    {isUndervalued ? (
                      <TrendingDown className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-rose-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="py-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Reference</p>
                    <p className="font-mono font-bold text-slate-700">{formatGold(item.marketValue)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Info className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className={`text-xs font-bold ${isUndervalued ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {isUndervalued 
                        ? `POTENTIALLY UNDERVALUED (${Math.round((1 - item.minBuyout/item.marketValue) * 100)}% DISCOUNT)` 
                        : 'MARKET PRICE STABLE'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price History Section */}
              <div className="animate-in fade-in zoom-in-95 duration-700 delay-300">
                <PriceHistoryChart itemId={item.itemId} itemName={item.Display_lang} />
              </div>

              {/* Day of Week Analysis Section */}
              <div className="animate-in fade-in zoom-in-95 duration-700 delay-500">
              <DayOfWeekChart itemId={item.itemId} itemName={item.Display_lang} />
              </div>

            </CardContent>
            
            <CardFooter className="pt-2 border-t bg-slate-50/80 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 opacity-50" />
                <span>Sync Time: {new Date(item.snapshot_time).toLocaleString()}</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
