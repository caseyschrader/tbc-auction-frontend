
'use server';

export type Item = {
  Display_lang: string;
  minBuyout: number;
  quantity: number;
  numAuctions: number;
  marketValue: number;
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
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      console.error("API_URL is missing in environment");
      return { items: [] };
    }

    const response = await fetch(`${apiUrl}/item/${encodeURIComponent(normalizedQuery)}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return { items: [] };
    }

    const data = await response.json();

    // Robustly handle various response shapes (array, items object, results object, single object)
    let rawItems: any[] = [];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.items)) rawItems = data.items;
      else if (Array.isArray(data.results)) rawItems = data.results;
      else if (data.Display_lang || data.minBuyout) rawItems = [data]; // Likely a single item object
    }

    const items: Item[] = rawItems
      .map((item: any) => {
        // Map Display_lang carefully. Handle string or nested object { en_US: "..." }
        let displayName = "Unknown Item";
        if (typeof item.Display_lang === 'string') {
          displayName = item.Display_lang;
        } else if (item.Display_lang && typeof item.Display_lang === 'object') {
          // Some WoW APIs return localized objects
          displayName = item.Display_lang.en_US || 
                        item.Display_lang.en_GB || 
                        Object.values(item.Display_lang)[0] as string || 
                        "Unknown Item";
        }

        return {
          Display_lang: displayName,
          minBuyout: Number(item.minBuyout) || 0,
          quantity: Number(item.quantity) || 0,
          numAuctions: Number(item.numAuctions) || 0,
          marketValue: Number(item.marketValue) || 0,
          snapshot_time: item.snapshot_time || new Date().toISOString(),
        };
      })
      // Filter: must have a valid name and at least one active auction
      .filter(item => item.Display_lang !== "Unknown Item" && item.numAuctions > 0)
      // Sort: highest auction volume first
      .sort((a, b) => b.numAuctions - a.numAuctions);

    return { items };
  } catch (error) {
    console.error("Search Action Error:", error);
    return { items: [] };
  }
}
