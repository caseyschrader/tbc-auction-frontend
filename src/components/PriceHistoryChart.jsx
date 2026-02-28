
WoW Auction Data Pipeline
/
1772235538756_image.png
This is how the current results are shown. As I want this to ultimately be used similar to a stock price watcher (buy low sell high) I'm thinking of putting some time-series chart underneath each result?

4:40 PM
That's a great idea! A price history chart would really elevate this from a simple lookup tool into something that actually supports trading decisions — you'd be able to visually spot when a price is depressed relative to its historical range.

Before diving in, a few things worth thinking through:

Data availability

Your current pipeline stores snapshots to GCS/BigQuery each time the fetcher runs, so you already have the raw material for time-series charts. The chart will only be as useful as how frequently you're running the pipeline and how much history you've accumulated. If you're only fetching once a day, the chart will be sparse at first but will fill in over time.

What to show on the chart

For a mean reversion / buy-low-sell-high use case, the most useful overlay would be min buyout as the main line, with market value as a secondary reference line. You could also add a shaded band at ±1 standard deviation around the rolling market value to visually highlight when the current price is statistically cheap or expensive — that's your buy signal zone.

Backend changes needed

Your current /item/{item_name} endpoint only returns 20 rows ordered by numAuctions, not a time series. You'd want a new endpoint like /item/{item_id}/history that returns all snapshots for a specific item ordered by snapshot_time, probably with a configurable lookback window (e.g., last 30 days).

Frontend

Something like Recharts (already available in React/Next.js ecosystem) would handle this well — a ComposedChart with a Line for min buyout, a Line for market value, and optionally a ReferenceArea for the std dev band.

Want me to start with the backend endpoint for price history, or sketch out what the chart component would look like on the frontend?

Right now I'm fetching data hourly. So yea a new endpoint and a sketch for the frontend

Feb 27
Let's start with the backend endpoint, then the frontend component.


Reading the SKILL.md for frontend design
Reading the SKILL.md for frontend design
Backend endpoint first:


New price history endpoint to add to main.py
New price history endpoint to add to main.py
Now the frontend chart component:


Created a file, read a file
Created a file, read a file
Here's a breakdown of what each piece does:

Backend (price_history_endpoint.py) — drop this into your main.py. The key addition is the BigQuery window function that computes a rolling 24-snapshot mean and standard deviation (24 snapshots = 24 hours given your hourly cadence). The days query param defaults to 7 but is adjustable from the frontend.

Frontend (PriceHistoryChart.jsx) — takes itemId and itemName as props so you can render it directly below each existing result card. A few things worth noting:

The white line is min buyout (the price you'd actually pay), blue is market value, and the dashed blue is the 24h rolling mean
The shaded band is ±1σ around the rolling mean — when the white line dips below the bottom edge, that's your buy signal
The teal dashed line is the explicit buy zone threshold (mean − 1σ), and the badge at the top lights up green when the current price is below it
The time window buttons (24h / 3d / 7d / 30d) re-fetch from the backend with the appropriate days param
One thing to check: your existing /item/{item_name} endpoint returns ID from the join, so you already have itemId available in your search results — just pass it through as a prop when rendering the chart below each result card.

Price history endpoint
PY 
Pricehistorychart
Code · JSX 
Should I replace my current query with this or this is an addition?

8:45 AM
Addition. Your existing /item/{item_name} endpoint stays exactly as-is — it's what powers the search results card you showed me.

The new /item/{item_id}/history endpoint is only called after a user searches and clicks/expands a result. The flow is:

User searches "Arcane Dust" → hits your existing endpoint → gets the card with min buyout, market value, active auctions
The card renders <PriceHistoryChart itemId={row.ID} itemName={row.Display_lang} /> underneath it
That component calls the new history endpoint to fetch and display the time-series chart
The two endpoints serve different purposes — one is for lookup, one is for historical analysis. Keep both.

where do I just the jsx file?

8:48 AM
In your Next.js frontend project, create it at:

components/PriceHistoryChart.jsx
Then import and use it in whatever page file renders your search results, e.g.:

jsx
import PriceHistoryChart from "@/components/PriceHistoryChart";

// inside your results rendering:
<PriceHistoryChart itemId={result.ID} itemName={result.Display_lang} />
Also make sure Recharts is installed since the component depends on it:

bash
npm install recharts






Claude is AI and can make mistakes. Please double-check responses.
Pricehistorychart · JSX
Copy

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ── helpers ──────────────────────────────────────────────────────────────────

function copperToDisplay(copper) {
  if (copper == null) return "—";
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  return [g && `${g}g`, s && `${s}s`, `${c}c`].filter(Boolean).join(" ");
}

function formatAxisCopper(copper) {
  if (copper >= 10000) return `${(copper / 10000).toFixed(1)}g`;
  if (copper >= 100) return `${Math.floor(copper / 100)}s`;
  return `${copper}c`;
}

// ── custom tooltip ────────────────────────────────────────────────────────────

function PriceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const d = payload[0]?.payload;
  const isBuySignal =
    d?.minBuyout != null &&
    d?.rolling_mean != null &&
    d?.rolling_stddev != null &&
    d.minBuyout < d.rolling_mean - d.rolling_stddev;

  return (
    <div
      style={{
        background: "#0f1117",
        border: "1px solid #2a2d3a",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12,
        color: "#c9d1e0",
        minWidth: 180,
      }}
    >
      <div style={{ color: "#6b7280", marginBottom: 6 }}>
        {new Date(label).toLocaleString()}
      </div>
      {d?.minBuyout != null && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "#6b7280" }}>Min Buyout</span>
          <span style={{ color: isBuySignal ? "#22d3a5" : "#e2e8f0", fontWeight: 600 }}>
            {copperToDisplay(d.minBuyout)}
            {isBuySignal && " 🟢"}
          </span>
        </div>
      )}
      {d?.marketValue != null && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "#6b7280" }}>Market Value</span>
          <span style={{ color: "#60a5fa" }}>{copperToDisplay(d.marketValue)}</span>
        </div>
      )}
      {d?.rolling_mean != null && d?.rolling_stddev != null && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 4, borderTop: "1px solid #2a2d3a", paddingTop: 4 }}>
          <span style={{ color: "#6b7280" }}>Buy Zone ≤</span>
          <span style={{ color: "#22d3a5" }}>
            {copperToDisplay(Math.round(d.rolling_mean - d.rolling_stddev))}
          </span>
        </div>
      )}
      {d?.numAuctions != null && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "#6b7280" }}>Auctions</span>
          <span>{d.numAuctions}</span>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const WINDOWS = [
  { label: "24h", days: 1 },
  { label: "3d", days: 3 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
];

export default function PriceHistoryChart({ itemId, itemName }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeWindow, setActiveWindow] = useState(7);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const fetchHistory = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/item/${itemId}/history?days=${activeWindow}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [itemId, activeWindow, API_BASE]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Derive the std-dev band as [mean - 1σ, mean + 1σ] for the shaded area
  const chartData = data.map((d) => ({
    ...d,
    snapshot_time: d.snapshot_time,
    bandLow:
      d.rolling_mean != null && d.rolling_stddev != null
        ? Math.round(d.rolling_mean - d.rolling_stddev)
        : null,
    bandHigh:
      d.rolling_mean != null && d.rolling_stddev != null
        ? Math.round(d.rolling_mean + d.rolling_stddev)
        : null,
  }));

  // Current buy zone threshold (last data point)
  const latest = chartData[chartData.length - 1];
  const buyZoneThreshold =
    latest?.rolling_mean != null && latest?.rolling_stddev != null
      ? Math.round(latest.rolling_mean - latest.rolling_stddev)
      : null;

  const currentPrice = latest?.minBuyout;
  const isBuySignal = currentPrice != null && buyZoneThreshold != null && currentPrice < buyZoneThreshold;

  return (
    <div
      style={{
        background: "#0f1117",
        border: "1px solid #1e2130",
        borderRadius: 12,
        padding: "20px 24px",
        marginTop: 12,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Price History
          </div>
          <div style={{ fontSize: 14, color: "#e2e8f0", marginTop: 2 }}>{itemName}</div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {WINDOWS.map((w) => (
            <button
              key={w.days}
              onClick={() => setActiveWindow(w.days)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid",
                borderColor: activeWindow === w.days ? "#3b82f6" : "#2a2d3a",
                background: activeWindow === w.days ? "#1e3a5f" : "transparent",
                color: activeWindow === w.days ? "#60a5fa" : "#6b7280",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buy signal badge */}
      {buyZoneThreshold != null && (
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 20,
              border: `1px solid ${isBuySignal ? "#22d3a5" : "#2a2d3a"}`,
              background: isBuySignal ? "rgba(34,211,165,0.08)" : "transparent",
              fontSize: 11,
              color: isBuySignal ? "#22d3a5" : "#6b7280",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: isBuySignal ? "#22d3a5" : "#4b5563", display: "inline-block" }} />
            {isBuySignal
              ? `BUY SIGNAL — ${copperToDisplay(currentPrice)} (zone ≤ ${copperToDisplay(buyZoneThreshold)})`
              : `Buy zone ≤ ${copperToDisplay(buyZoneThreshold)}`}
          </div>
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#4b5563", fontSize: 12 }}>
          Loading…
        </div>
      ) : error ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: 12 }}>
          {error}
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#4b5563", fontSize: 12 }}>
          No history available for this window.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            {/* ±1σ band */}
            <Area
              type="monotone"
              dataKey="bandHigh"
              stroke="none"
              fill="transparent"
              legendType="none"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="bandLow"
              stroke="none"
              fill="#1e3a5f"
              fillOpacity={0.5}
              legendType="none"
              isAnimationActive={false}
            />

            <XAxis
              dataKey="snapshot_time"
              tickFormatter={(v) => {
                const d = new Date(v);
                return activeWindow <= 1
                  ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : d.toLocaleDateString([], { month: "short", day: "numeric" });
              }}
              tick={{ fill: "#4b5563", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
              axisLine={{ stroke: "#1e2130" }}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tickFormatter={formatAxisCopper}
              tick={{ fill: "#4b5563", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />

            <Tooltip content={<PriceTooltip />} />

            {/* Rolling mean reference */}
            <Line
              type="monotone"
              dataKey="rolling_mean"
              stroke="#3b82f6"
              strokeWidth={1}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />

            {/* Market value */}
            <Line
              type="monotone"
              dataKey="marketValue"
              stroke="#60a5fa"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />

            {/* Min buyout — the primary line */}
            <Line
              type="monotone"
              dataKey="minBuyout"
              stroke="#e2e8f0"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#e2e8f0", stroke: "#0f1117", strokeWidth: 2 }}
              isAnimationActive={false}
            />

            {/* Buy zone threshold */}
            {buyZoneThreshold != null && (
              <ReferenceLine
                y={buyZoneThreshold}
                stroke="#22d3a5"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 10, color: "#4b5563" }}>
        {[
          { color: "#e2e8f0", label: "Min Buyout" },
          { color: "#60a5fa", label: "Market Value" },
          { color: "#3b82f6", label: "24h Rolling Mean", dashed: true },
          { color: "#22d3a5", label: "Buy Zone (−1σ)", dashed: true },
          { color: "#1e3a5f", label: "±1σ Band", box: true },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {item.box ? (
              <div style={{ width: 12, height: 8, background: item.color, borderRadius: 2 }} />
            ) : (
              <div
                style={{
                  width: 16,
                  height: 2,
                  background: item.color,
                  borderRadius: 1,
                  borderTop: item.dashed ? `2px dashed ${item.color}` : undefined,
                  background: item.dashed ? "transparent" : item.color,
                }}
              />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
