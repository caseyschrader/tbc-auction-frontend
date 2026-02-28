'use client';

import { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getItemHistory, HistoryPoint } from "@/app/actions/search-actions";
import { Button } from "@/components/ui/button";

// ── helpers ──────────────────────────────────────────────────────────────────

function copperToDisplay(copper: number | null) {
  if (copper == null) return "—";
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  return [g && `${g}g`, s && `${s}s`, `${c}c`].filter(Boolean).join(" ");
}

function formatAxisCopper(copper: number) {
  if (copper >= 10000) return `${(copper / 10000).toFixed(1)}g`;
  if (copper >= 100) return `${Math.floor(copper / 100)}s`;
  return `${copper}c`;
}

// ── custom tooltip ────────────────────────────────────────────────────────────

function PriceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const d = payload[0]?.payload;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono shadow-2xl min-w-[200px] text-slate-200">
      <div className="text-slate-500 mb-2 border-b border-slate-800 pb-1">
        {new Date(label).toLocaleString()}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex justify-between gap-4 mb-1">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-semibold">{copperToDisplay(entry.value)}</span>
        </div>
      ))}
      {d?.numAuctions != null && (
        <div className="flex justify-between gap-4 mt-2 pt-2 border-t border-slate-800">
          <span className="text-slate-500">Auctions</span>
          <span className="text-slate-300">{d.numAuctions}</span>
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

export function PriceHistoryChart({ itemId, itemName }: { itemId: string | number, itemName: string }) {
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeWindow, setActiveWindow] = useState(7);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      const json = await getItemHistory(itemId, activeWindow);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [itemId, activeWindow]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 mt-4 font-mono shadow-inner overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
            Price History
          </h4>
          <h3 className="text-sm font-bold text-slate-200">{itemName}</h3>
        </div>

        <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800">
          {WINDOWS.map((w) => (
            <Button
              key={w.days}
              size="sm"
              variant={activeWindow === w.days ? "secondary" : "ghost"}
              onClick={() => setActiveWindow(w.days)}
              className={`h-7 px-3 text-[10px] font-bold transition-all ${
                activeWindow === w.days 
                ? "bg-slate-700 text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {w.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[240px] w-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm z-10">
            <span className="text-xs text-slate-500 animate-pulse font-bold tracking-widest uppercase">Syncing Timeline...</span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-500 text-xs font-bold px-4 text-center">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest">
            No Historical Data Found
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis
                dataKey="snapshot_time"
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return activeWindow <= 1
                    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : d.toLocaleDateString([], { month: "short", day: "numeric" });
                }}
                tick={{ fill: "#475569", fontSize: 9, fontWeight: 600 }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis
                tickFormatter={formatAxisCopper}
                tick={{ fill: "#475569", fontSize: 9, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />

              <Tooltip content={<PriceTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />

              <Line
                name="Market Value"
                type="monotone"
                dataKey="marketValue"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                name="Min Buyout"
                type="monotone"
                dataKey="minBuyout"
                stroke="#f8fafc"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#f8fafc", stroke: "#020617", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 border-t border-slate-900 pt-4">
        {[
          { color: "#f8fafc", label: "Actual Price" },
          { color: "#60a5fa", label: "Market Avg" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-4 h-0.5 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
