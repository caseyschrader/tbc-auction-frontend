'use server';

export type Item = {
  Display_lang: string;
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

    // Support both array responses (broad search) and object responses (specific search)
    let rawItems: any[] = [];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data && typeof data === 'object') {
      // Look for the first property that contains an array (e.g., "items", "results", etc.)
      const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
      if (arrayKey) {
        rawItems = data[arrayKey];
      } else {
        // Treat as a single item if no array is found but it looks like an item
        rawItems = [data];
      }
    }

    const items: Item[] = rawItems.map((raw: any) => {
      // Find the Display_lang property in a case-insensitive way
      let displayName = 'Unknown Item';
      const nameKey = Object.keys(raw).find(k => k.toLowerCase() === 'display_lang');
      const val = nameKey ? raw[nameKey] : null;

      if (typeof val === 'string') {
        displayName = val;
      } else if (val && typeof val === 'object') {
        // Handle localized object (e.g., { en_US: "..." })
        displayName = val.en_US || Object.values(val)[0] as string || displayName;
      }

      return {
        Display_lang: displayName,
        minBuyout: Number(raw.minBuyout || 0),
        marketValue: Number(raw.marketValue || 0),
        numAuctions: Number(raw.numAuctions || 0),
        snapshot_time: raw.snapshot_time || new Date().toISOString(),
      };
    })
    // Filter out items with no active auctions and those with missing names
    .filter(item => item.numAuctions > 0 && item.Display_lang !== 'Unknown Item');

    // Sort by numAuctions descending as requested
    const sortedItems = items.sort((a, b) => b.numAuctions - a.numAuctions);

    return { items: sortedItems };
  } catch (error) {
    console.error('Search error:', error);
    return { items: [] };
  }
}
