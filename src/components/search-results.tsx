
'use client';

import { Product } from '@/app/lib/products';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Coins, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchResultsProps = {
  results: Product[];
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Uncommon': return 'text-green-500 border-green-500/20 bg-green-500/10';
      case 'Rare': return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
      case 'Epic': return 'text-purple-500 border-purple-500/20 bg-purple-500/10';
      default: return 'text-slate-500 border-slate-500/20 bg-slate-500/10';
    }
  };

  return (
    <div className="grid gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {results.map((product) => (
        <Card key={product.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className={cn("mb-2 border-none", getRarityColor(product.rarity))}>
                    {product.rarity}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-2xl font-bold text-primary">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span>{product.price.toFixed(2)}g</span>
                  </div>
                </div>
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">{product.name}</CardTitle>
                <CardDescription className="text-base line-clamp-2 mt-2">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">{product.category}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                  <Info className="w-3.5 h-3.5" />
                  Market value updated recently
                </div>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
