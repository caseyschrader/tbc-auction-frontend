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
      if (Array.isArray(data.items)) {
        rawItems = data.items;
      } else if (Array.isArray(data.results)) {
        rawItems = data.results;
      } else if (data.Display_lang) {
        rawItems = [data];
      }
    }

    const items: Item[] = rawItems.map((raw: any) => {
      // Handle Display_lang as a string or a localized object (e.g., { en_US: "..." })
      let displayName = 'Unknown Item';
      if (typeof raw.Display_lang === 'string') {
        displayName = raw.Display_lang;
      } else if (raw.Display_lang && typeof raw.Display_lang === 'object') {
        displayName = raw.Display_lang.en_US || Object.values(raw.Display_lang)[0] as string || displayName;
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
