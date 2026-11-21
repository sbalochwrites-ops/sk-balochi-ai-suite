import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { TransactionEntity } from '../database/entities';

interface WeeklyProfitTrendChartProps {
  transactions: TransactionEntity[];
}

interface DailyStats {
  date: string;
  dayLabel: string;
  sales: number;
  expenses: number;
  netProfit: number;
}

export const WeeklyProfitTrendChart: React.FC<WeeklyProfitTrendChartProps> = ({
  transactions,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DailyStats | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Group transactions by date and extract 7-day trend
  const dailyData: DailyStats[] = useMemo(() => {
    const map = new Map<string, { sales: number; expenses: number }>();

    for (const tx of transactions) {
      const cur = map.get(tx.date) ?? { sales: 0, expenses: 0 };
      if (tx.type === 'SALE') cur.sales += tx.amount;
      else cur.expenses += tx.amount;
      map.set(tx.date, cur);
    }

    // Get sorted dates or synthesize a contiguous 7-day window
    const sortedDates = Array.from(map.keys()).sort();
    const anchorDateStr = sortedDates[sortedDates.length - 1] ?? '2026-11-02';
    const anchorDate = new Date(anchorDateStr);

    const result: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(anchorDate);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const stats = map.get(iso) ?? { sales: 0, expenses: 0 };
      const dayLabel = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      result.push({
        date: iso,
        dayLabel,
        sales: stats.sales,
        expenses: stats.expenses,
        netProfit: stats.sales - stats.expenses,
      });
    }

    return result;
  }, [transactions]);

  // Dimensions
  const width = 760;
  const height = 240;
  const margin = { top: 25, right: 30, bottom: 35, left: 55 };

  // D3 Scales
  const xScale = useMemo(() => {
    return d3
      .scalePoint<string>()
      .domain(dailyData.map((d) => d.dayLabel))
      .range([margin.left, width - margin.right])
      .padding(0.4);
  }, [dailyData, margin.left, margin.right, width]);

  const yScale = useMemo(() => {
    const netProfits = dailyData.map((d) => d.netProfit);
    const minVal = Math.min(0, ...netProfits);
    const maxVal = Math.max(10000, ...netProfits);
    return d3
      .scaleLinear()
      .domain([minVal, maxVal])
      .nice()
      .range([height - margin.bottom, margin.top]);
  }, [dailyData, margin.bottom, margin.top, height]);

  // D3 Line & Area Generators
  const lineGenerator = useMemo(() => {
    return d3
      .line<DailyStats>()
      .x((d) => xScale(d.dayLabel) ?? 0)
      .y((d) => yScale(d.netProfit))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale]);

  const areaGenerator = useMemo(() => {
    const zeroY = yScale(0);
    return d3
      .area<DailyStats>()
      .x((d) => xScale(d.dayLabel) ?? 0)
      .y0(zeroY)
      .y1((d) => yScale(d.netProfit))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale]);

  const yTicks = yScale.ticks(5);

  return (
    <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[var(--text)]">
              Weekly Profit Trend (7-Day D3 Analytics)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-num font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Live Vector D3
            </span>
          </div>
          <p className="text-xs text-[var(--text-sec)] urdu mt-0.5">
            گزشتہ 7 دنوں کا خالص منافع اور رجحان (روزانہ بکری بمقابلہ خرچہ)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B5E20]"></span>
            <span className="text-[var(--text-sec)]">Net Profit (منافع)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]"></span>
            <span className="text-[var(--text-sec)]">Sales (بکری)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C62828]"></span>
            <span className="text-[var(--text-sec)]">Expenses (خرچہ)</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[600px] select-none"
        >
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={margin.left}
                y1={yScale(tick)}
                x2={width - margin.right}
                y2={yScale(tick)}
                stroke="currentColor"
                className="text-[var(--border)]"
                strokeDasharray="3 3"
              />
              <text
                x={margin.left - 8}
                y={yScale(tick) + 3}
                textAnchor="end"
                className="text-[10px] font-mono-num fill-[var(--text-ter)]"
              >
                {tick >= 1000 ? `${Math.round(tick / 1000)}k` : tick}
              </text>
            </g>
          ))}

          {/* Zero baseline */}
          <line
            x1={margin.left}
            y1={yScale(0)}
            x2={width - margin.right}
            y2={yScale(0)}
            stroke="currentColor"
            className="text-[var(--text-ter)]"
            strokeWidth="1.5"
          />

          {/* Area fill */}
          {areaGenerator(dailyData) && (
            <path
              d={areaGenerator(dailyData)!}
              fill="url(#profitGradient)"
            />
          )}

          {/* Smooth Line Path */}
          {lineGenerator(dailyData) && (
            <path
              d={lineGenerator(dailyData)!}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {dailyData.map((d) => {
            const cx = xScale(d.dayLabel) ?? 0;
            const cy = yScale(d.netProfit);
            const isHovered = hoveredPoint?.date === d.date;

            return (
              <g
                key={d.date}
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoveredPoint(d);
                  setTooltipPos({ x: cx, y: cy });
                }}
                onMouseLeave={() => {
                  setHoveredPoint(null);
                  setTooltipPos(null);
                }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={d.netProfit >= 0 ? 'var(--primary)' : 'var(--expense)'}
                  stroke="var(--surface)"
                  strokeWidth="2"
                  className="transition-all duration-150 shadow"
                />
                {/* X Axis Label */}
                <text
                  x={cx}
                  y={height - margin.bottom + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono-num ${
                    isHovered
                      ? 'fill-[var(--primary)] font-bold'
                      : 'fill-[var(--text-sec)]'
                  }`}
                >
                  {d.dayLabel.split(',')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Hover Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl text-xs space-y-1.5 transition-transform"
            style={{
              left: `${(tooltipPos.x / width) * 100}%`,
              top: `${Math.max(10, (tooltipPos.y / height) * 100 - 35)}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-bold text-[var(--text)] pb-1 border-b border-[var(--border)]">
              {hoveredPoint.dayLabel} ({hoveredPoint.date})
            </div>
            <div className="flex items-center justify-between gap-4 font-mono-num">
              <span className="text-[var(--text-sec)]">Sales (آمدن):</span>
              <span className="text-[var(--sale)] font-semibold">
                PKR {hoveredPoint.sales.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 font-mono-num">
              <span className="text-[var(--text-sec)]">Expenses (خرچہ):</span>
              <span className="text-[var(--expense)] font-semibold">
                PKR {hoveredPoint.expenses.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 font-mono-num pt-1 border-t border-[var(--border)] font-bold">
              <span className="text-[var(--text)]">Net Profit (منافع):</span>
              <span
                className={
                  hoveredPoint.netProfit >= 0
                    ? 'text-[var(--profit)]'
                    : 'text-[var(--expense)]'
                }
              >
                PKR {hoveredPoint.netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
