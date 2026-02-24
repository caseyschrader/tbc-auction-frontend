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

    // The API might return an array directly for broad searches, or a nested object
    let rawItems: any[] = [];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data && typeof data === 'object') {
      // Check for common wrapper keys or if it's a single item object
      if (Array.isArray(data.items)) {
        rawItems = data.items;
      } else if (Array.isArray(data.results)) {
        rawItems = data.results;
      } else if (data.Display_lang) {
        // It's a single item object
        rawItems = [data];
      }
    }

    const items: Item[] = rawItems.map((raw: any) => {
      // Robust Display_lang resolution as per requirements
      let name = 'Unknown Item';
      if (typeof raw.Display_lang === 'string') {
        name = raw.Display_lang;
      } else if (raw.Display_lang && typeof raw.Display_lang === 'object') {
        // Handle localized object format { en_US: "...", ... }
        name = raw.Display_lang.en_US || Object.values(raw.Display_lang)[0] as string || name;
      }

      return {
        name,
        minBuyout: Number(raw.minBuyout || 0),
        marketValue: Number(raw.marketValue || 0),
        numAuctions: Number(raw.numAuctions || 0),
        snapshot_time: raw.snapshot_time || new Date().toISOString(),
      };
    })
    // Filter out items with no active auctions and those with unknown names
    .filter(item => item.numAuctions > 0 && item.name !== 'Unknown Item');

    // Sort by numAuctions descending
    const sortedItems = items.sort((a, b) => b.numAuctions - a.numAuctions);

    return { items: sortedItems };
  } catch (error) {
    console.error('Search error:', error);
    return { items: [] };
  }
}
