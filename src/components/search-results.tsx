
'use client';

import { Product } from '@/app/lib/products';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Package, ShoppingCart, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchResultsProps = {
  results: Product[];
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
};

export function SearchResults({ results, suggestions, onSuggestionClick, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 w-full animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (results.length === 0 && suggestions.length === 0) {
    return null;
  }

  if (results.length === 0 && suggestions.length > 0) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/50 border border-dashed border-primary/30 p-8 rounded-2xl text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-primary mx-auto opacity-50" />
          <h3 className="text-xl font-semibold text-foreground">No direct matches found</h3>
          <p className="text-muted-foreground">Our AI suggests you might be looking for:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-all text-sm font-medium border border-primary/20"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {results.map((product) => (
        <Card key={product.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="mb-2 bg-accent/10 text-accent hover:bg-accent/20 border-none">
                    {product.category}
                  </Badge>
                  <span className="text-2xl font-bold text-primary">
                    ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
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
                    <span className={cn(
                      "font-medium",
                      product.availability === 'In Stock' ? "text-green-600" : "text-amber-600"
                    )}>
                      {product.availability}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>Free Shipping</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <button className="w-full bg-primary text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-primary/90 transition-all">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
