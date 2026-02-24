
'use server';

import { products, Product } from '@/app/lib/products';
import { intelligentSearchSuggestion } from '@/ai/flows/intelligent-search-suggestion-flow';

export type SearchResult = {
  items: Product[];
  suggestions: string[];
};

export async function searchProducts(query: string): Promise<SearchResult> {
  const normalizedQuery = query.trim().toLowerCase();
  
  if (!normalizedQuery) {
    return { items: [], suggestions: [] };
  }

  const results = products.filter(
    (p) =>
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.category.toLowerCase().includes(normalizedQuery)
  );

  if (results.length > 0) {
    return { items: results, suggestions: [] };
  }

  // If no results, get AI suggestions
  try {
    const aiResponse = await intelligentSearchSuggestion({ searchQuery: query });
    return { items: [], suggestions: aiResponse.suggestions || [] };
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return { items: [], suggestions: [] };
  }
}
