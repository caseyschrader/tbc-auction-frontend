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

    const rawItems = Array.isArray(data) ? data : [];
    
    // Map and sanitize the data to ensure property names match our expected Item type
    // and filter out entries that have neither a name nor a valid price
    const items: Item[] = rawItems.map((raw: any) => ({
      name: raw.name || raw.itemName || raw.item_name || 'Unknown Item',
      minBuyout: Number(raw.minBuyout || raw.buyout || 0),
      marketValue: Number(raw.marketValue || raw.market_value || 0),
      numAuctions: Number(raw.numAuctions || raw.auctions || 0),
      snapshot_time: raw.snapshot_time || raw.updated_at || new Date().toISOString(),
    })).filter(item => item.minBuyout > 0 || item.name !== 'Unknown Item');

    // Sort by numAuctions descending as requested
    const sortedItems = items.sort((a, b) => b.numAuctions - a.numAuctions);

    return { items: sortedItems };
  } catch (error) {
    return { items: [] };
  }
}
