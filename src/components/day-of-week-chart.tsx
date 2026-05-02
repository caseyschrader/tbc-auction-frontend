'use client';

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { getItemDow, DowPoint } from "@/app/actions/search-actions";

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

function DowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DowPoint;
  const avg = payload.find((p: any) => p.dataKey === "avg_market_value");
  const buyout = payload.find((p: any) => p.dataKey === "avg_min_buyout");

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono shadow-2xl min-w-[180px] text-slate-200">
      <div className="text-slate-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
        {label}
      </div>
      {buyout && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-slate-500">Avg Buyout</span>
          <span className="text-slate-100 font-semibold">{copperToDisplay(buyout.value)}</span>
        </div>
      )}
      {avg && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-slate-500">Market Value</span>
          <span className="text-blue-400">{copperToDisplay(avg.value)}</span>
        </div>
      )}
      <div className="flex justify-between gap-4 mt-2 pt-2 border-t border-slate-800">
        <span className="text-slate-500">Snapshots</span>
        <span className="text-slate-400">{d.snapshot_count}</span>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

type ViewMode = "buyout" | "market";

export function DayOfWeekChart({
  itemId,
  itemName,
}: {
  itemId: string | number;
  itemName: string;
}) {
  const [data, setData] = useState<DowPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("buyout");

  const fetchDow = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      const json = await getItemDow(itemId);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchDow();
  }, [fetchDow]);

  const activeKey = viewMode === "buyout" ? "avg_min_buyout" : "avg_market_value";

  // Find best and worst days
  const bestDay = data.length
    ? data.reduce((a, b) => (a[activeKey] > b[activeKey] ? a : b))
    : null;
  const worstDay = data.length
    ? data.reduce((a, b) => (a[activeKey] < b[activeKey] ? a : b))
    : null;

  const avg =
    data.length > 0
      ? data.reduce((sum, d) => sum + d[activeKey], 0) / data.length
      : null;

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 mt-4 font-mono shadow-inner overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
            Day-of-Week Analysis
          </h4>
          <h3 className="text-sm font-bold text-slate-200">{itemName}</h3>
        </div>

        <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800">
          {(["buyout", "market"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`h-7 px-3 text-[10px] font-bold rounded-md transition-all ${
                viewMode === mode
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {mode === "buyout" ? "Min Buyout" : "Market Value"}
            </button>
          ))}
        </div>
      </div>

      {/* Best / Worst callouts */}
      {data.length > 0 && bestDay && worstDay && (
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-900/60 bg-emerald-950/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Best sell: {bestDay.day_of_week} — {copperToDisplay(bestDay[activeKey])}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/30 text-[10px] font-bold text-rose-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
            Cheapest: {worstDay.day_of_week} — {copperToDisplay(worstDay[activeKey])}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative h-[220px] w-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm z-10">
            <span className="text-xs text-slate-500 animate-pulse font-bold tracking-widest uppercase">
              Analyzing patterns...
            </span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-500 text-xs font-bold px-4 text-center">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest">
            No day-of-week data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barCategoryGap="25%"
            >
              <XAxis
                dataKey="day_of_week"
                tick={{ fill: "#475569", fontSize: 9, fontWeight: 600 }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatAxisCopper}
                tick={{ fill: "#475569", fontSize: 9, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<DowTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

              {/* Weekly average reference line */}
              {avg != null && (
                <ReferenceLine
                  y={avg}
                  stroke="#334155"
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  label={{
                    value: "avg",
                    fill: "#475569",
                    fontSize: 9,
                    fontWeight: 600,
                    position: "insideTopRight",
                  }}
                />
              )}

              <Bar dataKey={activeKey} radius={[4, 4, 0, 0]} maxBarSize={48}>
                {data.map((entry) => {
                  const isBest = entry.day_of_week === bestDay?.day_of_week;
                  const isWorst = entry.day_of_week === worstDay?.day_of_week;
                  const color = isBest
                    ? "#10b981"
                    : isWorst
                    ? "#f43f5e"
                    : "#334155";
                  return <Cell key={entry.day_of_week} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 border-t border-slate-900 pt-4">
        {[
          { color: "#10b981", label: "Highest price day" },
          { color: "#f43f5e", label: "Lowest price day" },
          { color: "#334155", label: "Other days" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: item.color }}
            />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
