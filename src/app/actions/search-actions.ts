
'use server';

export type Item = {
  itemId: number | string;
  Display_lang: string;
  minBuyout: number;
  quantity: number;
  numAuctions: number;
  marketValue: number;
  snapshot_time: string;
};

export type HistoryPoint = {
  snapshot_time: string;
  minBuyout: number;
  marketValue: number;
  numAuctions: number;
  rolling_mean: number | null;
  rolling_stddev: number | null;
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

    let rawItems: any[] = [];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.items)) rawItems = data.items;
      else if (Array.isArray(data.results)) rawItems = data.results;
      else if (data.Display_lang || data.minBuyout) rawItems = [data];
    }

    const items: Item[] = rawItems
      .map((item: any) => {
        let displayName = "Unknown Item";
        if (typeof item.Display_lang === 'string') {
          displayName = item.Display_lang;
        } else if (item.Display_lang && typeof item.Display_lang === 'object') {
          displayName = item.Display_lang.en_US || 
                        item.Display_lang.en_GB || 
                        Object.values(item.Display_lang)[0] as string || 
                        "Unknown Item";
        }

        return {
          itemId: item.ID || item.item_id || item.itemId || 0,
          Display_lang: displayName,
          minBuyout: Number(item.minBuyout) || 0,
          quantity: Number(item.quantity) || 0,
          numAuctions: Number(item.numAuctions) || 0,
          marketValue: Number(item.marketValue) || 0,
          snapshot_time: item.snapshot_time || new Date().toISOString(),
        };
      })
      .filter(item => item.Display_lang !== "Unknown Item" && item.numAuctions > 0)
      .sort((a, b) => b.numAuctions - a.numAuctions);

    return { items };
  } catch (error) {
    console.error("Search Action Error:", error);
    return { items: [] };
  }
}

export async function getItemHistory(itemId: string | number, days: number = 7): Promise<HistoryPoint[]> {
  if (itemId === null || itemId === undefined) return [];
  
  try {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return [];

    const response = await fetch(`${apiUrl}/item/${itemId}/history?days=${days}`, {
      cache: 'no-store',
    });

    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((d: any) => ({
        snapshot_time: d.snapshot_time,
        numAuctions: d.numAuctions,
        rolling_mean: d.rolling_mean,
        rolling_stddev: d.rolling_stddev,
        marketValue: Number(d.marketValue || 0),
        minBuyout: Number(d.minBuyout || 0)
    }));
  } catch (error) {
    console.error("History Fetch Error:", error);
    return [];
  }
}

export type DowPoint = {
  day_num: number;
  day_of_week: string;
  avg_market_value: number;
  avg_min_buyout: number;
  snapshot_count: number;
};

export async function getItemDow(itemId: string | number): Promise<DowPoint[]> {
  if (!itemId) return [];
  try {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return [];
    const response = await fetch(`${apiUrl}/item/${itemId}/dow`, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((d: any) => ({
      day_num: d.day_num,
      day_of_week: d.day_of_week,
      snapshot_count: d.snapshot_count,
      avg_market_value: Number(d.marketValue || d.avg_market_value || 0),
      avg_min_buyout: Number(d.minBuyout || d.avg_min_buyout || 0),
    }));
  } catch (error) {
    console.error("DOW Fetch Error:", error);
    return [];
  }
}
