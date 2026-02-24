'use server';

export type Item = {
  name: string;
  minBuyout: number;
  marketValue: number;
  numAuctions: number;
  snapshot_time: string;
};

export type SearchResult = {
  items: Item[];
};

export async function searchProducts(query: string): Promise<SearchResult> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return { items: [] };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/item/${encodeURIComponent(normalizedQuery)}`);
    if (!response.ok) {
      return { items: [] };
    }
    const data = await response.json();

    // Ensure data is an array and sort by numAuctions descending as requested
    const items: Item[] = Array.isArray(data) ? data : [];
    const sortedItems = items.sort((a, b) => b.numAuctions - a.numAuctions);

    return { items: sortedItems };
  } catch (error) {
    return { items: [] };
  }
}
