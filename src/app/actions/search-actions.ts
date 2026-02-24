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
    const response = await fetch(`${process.env.API_URL}/item/${encodeURIComponent(normalizedQuery)}`);
    if (!response.ok) {
      return { items: [] };
    }
    
    const data = await response.json();

    // Flexible response parsing for arrays or nested objects
    let rawItems: any[] = [];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.items)) {
        rawItems = data.items;
      } else if (Array.isArray(data.results)) {
        rawItems = data.results;
      } else if (data.Display_lang || data.name || data.itemName) {
        // It's a single item object
        rawItems = [data];
      }
    }

    const items: Item[] = rawItems.map((raw: any) => {
      // Robust name resolution
      let name = 'Unknown Item';
      if (typeof raw.Display_lang === 'string') {
        name = raw.Display_lang;
      } else if (raw.Display_lang && typeof raw.Display_lang === 'object') {
        name = raw.Display_lang.en_US || Object.values(raw.Display_lang)[0] as string || name;
      } else {
        name = raw.name || raw.itemName || raw.item_name || name;
      }

      return {
        name,
        minBuyout: Number(raw.minBuyout || raw.buyout || 0),
        marketValue: Number(raw.marketValue || raw.market_value || 0),
        numAuctions: Number(raw.numAuctions || raw.auctions || 0),
        snapshot_time: raw.snapshot_time || raw.updated_at || new Date().toISOString(),
      };
    }).filter(item => item.numAuctions > 0 && item.name !== 'Unknown Item');

    // Sort by numAuctions descending
    const sortedItems = items.sort((a, b) => b.numAuctions - a.numAuctions);

    return { items: sortedItems };
  } catch (error) {
    console.error('Search error:', error);
    return { items: [] };
  }
}
