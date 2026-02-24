
'use client';

import { useState, useTransition } from 'react';
import { Search, Gavel, Coins } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchResults } from '@/components/search-results';
import { searchProducts, SearchResult } from '@/app/actions/search-actions';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ items: [] });
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    startTransition(async () => {
      const response = await searchProducts(query);
      setResults(response);
    });
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-primary p-2.5 rounded-xl text-white shadow-lg shadow-primary/20">
              <Gavel className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Auction House <span className="text-primary">Price Search</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Track real-time market values for Azeroth's most essential trade goods and reagents.
          </p>
        </header>

        {/* Search Section */}
        <section className="relative">
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search items: Arcane Dust, Mageweave Cloth, Rugged Leather..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-32 h-16 rounded-2xl border-2 border-white bg-white/80 backdrop-blur-sm shadow-xl focus-visible:ring-primary focus-visible:border-primary transition-all text-lg"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                >
                  {isPending ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </form>
          
          <div className="absolute -z-10 -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -z-10 -bottom-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
        </section>

        {/* Results Section */}
        <section className="space-y-6">
          {!hasSearched && !isPending && (
            <div className="text-center py-20 opacity-40">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                <Coins className="w-10 h-10" />
              </div>
              <p className="text-xl font-medium">Enter an item name to begin</p>
            </div>
          )}

          <SearchResults 
            results={results.items} 
            isLoading={isPending}
          />

          {hasSearched && results.items.length > 0 && !isPending && (
            <div className="flex items-center justify-center gap-2 pt-8 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <p>Showing {results.items.length} current listings</p>
            </div>
          )}
        </section>
      </div>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-30" />
    </main>
  );
}
