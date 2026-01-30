"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type MetricKey = "attendance" | "members" | "events" | "tasks" | "alumni";

export interface ChapterHealthChartProps {
  title?: string;
  subtitle?: string;
  /** Attendance % (0–100) */
  attendance?: number | null;
  /** Active members count */
  members?: number;
  /** Upcoming events count */
  events?: number;
  /** Tasks (e.g. overdue count) */
  tasks?: number;
  /** Alumni count */
  alumni?: number;
}

const METRIC_LABELS: Record<MetricKey, string> = {
  attendance: "Attendance %",
  members: "Members",
  events: "Events",
  tasks: "Tasks overdue",
  alumni: "Alumni",
};

const chartConfig = {
  attendance: {
    label: "Attendance %",
    color: "hsl(var(--chart-1, 217 91% 60%))",
  },
  members: {
    label: "Members",
    color: "hsl(var(--primary))",
  },
  events: {
    label: "Events",
    color: "hsl(var(--chart-2, 173 58% 39%))",
  },
  tasks: {
    label: "Tasks overdue",
    color: "hsl(var(--chart-3, 43 74% 66%))",
  },
  alumni: {
    label: "Alumni",
    color: "hsl(270 60% 55%)",
  },
} satisfies ChartConfig;

const ChapterHealthChart = ({
  title = "Chapter Health",
  subtitle = "Toggle metrics below to show or hide in the chart",
  attendance = null,
  members = 0,
  events = 0,
  tasks = 0,
  alumni = 0,
}: ChapterHealthChartProps) => {
  const [visibleMetrics, setVisibleMetrics] = useState<Record<MetricKey, boolean>>({
    attendance: true,
    members: true,
    events: true,
    tasks: true,
    alumni: true,
  });

  const toggleMetric = (key: MetricKey) => {
    setVisibleMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const chartData = useMemo(() => {
    const items: { name: string; value: number; key: MetricKey; fill: string }[] = [];
    if (visibleMetrics.attendance) {
      items.push({
        name: METRIC_LABELS.attendance,
        value: attendance != null ? attendance : 0,
        key: "attendance",
        fill: "var(--color-attendance)",
      });
    }
    if (visibleMetrics.members) {
      items.push({
        name: METRIC_LABELS.members,
        value: members,
        key: "members",
        fill: "var(--color-members)",
      });
    }
    if (visibleMetrics.events) {
      items.push({
        name: METRIC_LABELS.events,
        value: events,
        key: "events",
        fill: "var(--color-events)",
      });
    }
    if (visibleMetrics.tasks) {
      items.push({
        name: METRIC_LABELS.tasks,
        value: tasks,
        key: "tasks",
        fill: "var(--color-tasks)",
      });
    }
    if (visibleMetrics.alumni) {
      items.push({
        name: METRIC_LABELS.alumni,
        value: alumni,
        key: "alumni",
        fill: "var(--color-alumni)",
      });
    }
    return items;
  }, [visibleMetrics, attendance, members, events, tasks, alumni]);

  const formatValue = (key: MetricKey, value: number) => {
    if (key === "attendance") return `${value}%`;
    return value.toLocaleString();
  };

  return (
    <div className="min-h-0 w-full">
      {(title || subtitle) ? (
        <div className="mb-6">
          {title ? (
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">{title}</h2>
          ) : null}
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      ) : null}

      {/* Toggle each metric */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(METRIC_LABELS) as MetricKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleMetric(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              visibleMetrics[key]
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: visibleMetrics[key]
                  ? (chartConfig[key]?.color as string) ?? "currentColor"
                  : "hsl(var(--muted-foreground))",
              }}
            />
            {METRIC_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Bar chart using Chart primitives */}
      <div className="relative rounded-lg border border-border overflow-hidden">
        {chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-muted-foreground text-sm bg-card">
            Select at least one metric above to show the chart.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 88, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: number, _name: string, item: { color?: string }, _index: number, payload: { key?: MetricKey; name?: string }) => (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex flex-1 justify-between leading-none items-center gap-2">
                          <span className="text-muted-foreground">{payload?.name ?? "Value"}</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {formatValue(payload?.key ?? "members", value)}
                          </span>
                        </div>
                      </>
                    )}
                  />
                }
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={44} name="Value">
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
};

export { ChapterHealthChart };
export default ChapterHealthChart;
