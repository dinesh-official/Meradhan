"use client";

import { useMemo } from "react";
import type { InvestmentByIssuerTypeResponse } from "@root/apiGateway";
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const ISSUER_SORT_ORDER = [
  "Government",
  "Sovereign",
  "PSU",
  "Corporate",
  "Tax Free",
  "Perpetual",
];

/** Blues aligned with reference: light → deep navy. */
const SLICE_COLORS = [
  "#93C5FD",
  "#60A5FA",
  "#1E3A5F",
  "#BFDBFE",
  "#2563EB",
  "#1D4ED8",
];

function sortIssuerAllocation(
  items: InvestmentByIssuerTypeResponse["issuerAllocation"],
) {
  return [...items].sort((a, b) => {
    const ia = ISSUER_SORT_ORDER.findIndex(
      (k) => k.toLowerCase() === String(a.issuerType).toLowerCase(),
    );
    const ib = ISSUER_SORT_ORDER.findIndex(
      (k) => k.toLowerCase() === String(b.issuerType).toLowerCase(),
    );
    const va = ia === -1 ? 999 : ia;
    const vb = ib === -1 ? 999 : ib;
    return va - vb;
  });
}

function formatIssuerLabel(raw: string): string {
  const s = String(raw).trim();
  if (!s) return "Other";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function formatInrLakh(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1e7) {
    return `₹${(value / 1e7).toFixed(2)} Cr`;
  }
  if (value >= 1e5) {
    return `₹${(value / 1e5).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatInrFull(value: number): string {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

type ChartRow = {
  name: string;
  value: number;
  bondCount: number;
};

type SliceLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  index: number;
};

export function DashboardPortfolioDonut({
  issuerByType,
  fallbackList,
}: {
  issuerByType: InvestmentByIssuerTypeResponse | null;
  fallbackList?: Array<{
    id: number;
    securityName: string;
    isin: string;
    investmentAmount: number;
  }>;
}) {
  const chartData: ChartRow[] = useMemo(() => {
    const raw = issuerByType?.issuerAllocation ?? [];
    const sorted = sortIssuerAllocation(raw);
    return sorted
      .filter((x) => x.investedAmount > 0 || x.bondCount > 0)
      .map((x) => ({
        name: formatIssuerLabel(x.issuerType),
        value: x.investedAmount,
        bondCount: x.bondCount,
      }));
  }, [issuerByType]);

  const totalBonds = useMemo(
    () => chartData.reduce((s, d) => s + d.bondCount, 0),
    [chartData],
  );

  const totalInvestment =
    issuerByType?.totalInvestment ??
    chartData.reduce((s, d) => s + d.value, 0);

  const hasChart = chartData.length > 0;

  if (!hasChart && fallbackList && fallbackList.length > 0) {
    return (
      <ul className="flex flex-col gap-3">
        {fallbackList.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
          >
            <div className="min-w-0">
              <p
                className="truncate font-medium text-gray-900"
                title={row.securityName}
              >
                {row.securityName}
              </p>
              <p className="text-sm text-muted-foreground">{row.isin}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-primary">
              ₹ {formatInrFull(row.investmentAmount)}
            </p>
          </li>
        ))}
      </ul>
    );
  }

  if (!hasChart) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No allocation breakdown yet.
      </p>
    );
  }

  const renderOuterLabel = (props: SliceLabelProps) => {
    const { cx, cy, midAngle, outerRadius, index } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 28;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const anchor = x > cx ? "start" : "end";
    const entry = chartData[index];
    if (!entry) return null;
    const sub =
      entry.bondCount > 0
        ? String(entry.bondCount)
        : formatInrLakh(entry.value).replace(/^₹/, "");

    return (
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="text-xs"
      >
        <tspan x={x} dy="-0.4em" fill="#111827" fontWeight={600}>
          {entry.name}
        </tspan>
        <tspan
          x={x}
          dy="1.15em"
          fill="#2563eb"
          fontWeight={700}
          className="tabular-nums"
        >
          ({sub})
        </tspan>
      </text>
    );
  };

  const renderLabelLine = (props: SliceLabelProps) => {
    const { cx, cy, midAngle, outerRadius, index } = props;
    const RADIAN = Math.PI / 180;
    const startX = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const startY = cy + outerRadius * Math.sin(-midAngle * RADIAN);
    const endX = cx + (outerRadius + 12) * Math.cos(-midAngle * RADIAN);
    const endY = cy + (outerRadius + 12) * Math.sin(-midAngle * RADIAN);
    const stroke = SLICE_COLORS[index % SLICE_COLORS.length];
    return (
      <path
        d={`M${startX},${startY} L${endX},${endY}`}
        stroke={stroke}
        strokeWidth={1}
        fill="none"
      />
    );
  };

  const CenterTotal = () => {
    const showBonds = totalBonds > 0;
    return (
      <g>
        <text
          x="50%"
          y="50%"
          dy="-0.15em"
          textAnchor="middle"
          fill="#6b7280"
          fontSize={12}
          fontWeight={500}
        >
          {showBonds ? "Bonds" : "Invested"}
        </text>
        <text
          x="50%"
          y="50%"
          dy="0.85em"
          textAnchor="middle"
          fill="#111827"
          fontSize={showBonds ? 26 : 18}
          fontWeight={700}
          className="tabular-nums"
        >
          {showBonds ? totalBonds : formatInrLakh(totalInvestment)}
        </text>
      </g>
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative mx-auto w-full min-w-0 max-w-[min(100%,380px)] flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={108}
              paddingAngle={1}
              stroke="#fff"
              strokeWidth={2}
              labelLine={renderLabelLine}
              label={renderOuterLabel}
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                />
              ))}
              <Label position="center" content={<CenterTotal />} />
            </Pie>
            <Tooltip
              formatter={(value: number) => [`₹ ${formatInrFull(value)}`, "Invested"]}
              labelFormatter={(_, payload) => {
                const p = payload as { payload?: { name?: string } }[] | undefined;
                return p?.[0]?.payload?.name ?? "";
              }}
              contentStyle={{ borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Total invested {formatInrLakh(totalInvestment)}
        </p>
      </div>

      <ul className="mx-auto flex w-full max-w-xs shrink-0 flex-col gap-3 lg:mx-0 lg:w-44">
        {chartData.map((d, i) => (
          <li key={d.name} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
              }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{d.name}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                ₹ {formatInrFull(d.value)}
                {d.bondCount > 0 ? (
                  <span className="text-primary"> · {d.bondCount} bonds</span>
                ) : null}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
