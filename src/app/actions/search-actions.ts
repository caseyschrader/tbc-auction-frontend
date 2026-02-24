
'use server';

import { products, Product } from '@/app/lib/products';

export type SearchResult = {
  items: Product[];
};

export async function searchProducts(query: string): Promise<SearchResult> {
  const normalizedQuery = query.trim().toLowerCase();
  
  if (!normalizedQuery) {
    return { items: [] };
  }

  const results = products.filter(
    (p) =>
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.category.toLowerCase().includes(normalizedQuery)
  );

  return { items: results };
}
