import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

export type MetricKey = "attendance" | "members" | "tasks" | "alumni";

export interface ChapterHealthChartProps {
  title?: string;
  subtitle?: string;
  /** Attendance % (0–100) */
  attendance?: number | null;
  /** Active members count */
  members?: number;
  /** Tasks (e.g. overdue count) */
  tasks?: number;
  /** Alumni count */
  alumni?: number;
}

const METRIC_LABELS: Record<MetricKey, string> = {
  attendance: "Attendance %",
  members: "Members",
  tasks: "Tasks",
  alumni: "Alumni",
};

const METRIC_COLORS: Record<MetricKey, string> = {
  attendance: "hsl(var(--chart-1, 217 91% 60%))",
  members: "hsl(var(--primary))",
  tasks: "hsl(var(--chart-3, 43 74% 66%))",
  alumni: "hsl(270 60% 55%)",
};

const ChapterHealthChart = ({
  title = "Chapter Health",
  subtitle = "Toggle metrics below to show or hide in the chart",
  attendance = null,
  members = 0,
  tasks = 0,
  alumni = 0,
}: ChapterHealthChartProps) => {
  const [visibleMetrics, setVisibleMetrics] = useState<Record<MetricKey, boolean>>({
    attendance: true,
    members: true,
    tasks: true,
    alumni: true,
  });

  const toggleMetric = (key: MetricKey) => {
    setVisibleMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const chartData = useMemo(() => {
    const items: { name: string; value: number; key: MetricKey }[] = [];
    if (visibleMetrics.attendance) {
      items.push({
        name: METRIC_LABELS.attendance,
        value: attendance != null ? attendance : 0,
        key: "attendance",
      });
    }
    if (visibleMetrics.members) {
      items.push({ name: METRIC_LABELS.members, value: members, key: "members" });
    }
    if (visibleMetrics.tasks) {
      items.push({ name: METRIC_LABELS.tasks, value: tasks, key: "tasks" });
    }
    if (visibleMetrics.alumni) {
      items.push({ name: METRIC_LABELS.alumni, value: alumni, key: "alumni" });
    }
    return items;
  }, [visibleMetrics, attendance, members, tasks, alumni]);

  const formatValue = (key: MetricKey, value: number) => {
    if (key === "attendance") return `${value}%`;
    return String(value);
  };

  return (
    <div className="min-h-0 w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Filter: toggle each metric */}
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
              style={{ backgroundColor: visibleMetrics[key] ? "currentColor" : "hsl(var(--muted-foreground))" }}
            />
            {METRIC_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="relative bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6">
          {chartData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
              Select at least one metric above to show the chart.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 88, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number, _name: string, props: { payload: { key: MetricKey; name: string } }) => [
                      formatValue(props.payload.key, value),
                      props.payload.name,
                    ]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={44} name="Value">
                    {chartData.map((entry) => (
                      <Cell key={entry.key} fill={METRIC_COLORS[entry.key]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ChapterHealthChart };
export default ChapterHealthChart;
