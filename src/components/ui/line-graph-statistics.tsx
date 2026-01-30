"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

export type PeriodKey = "Last 3 months" | "Last 30 days" | "Last 7 days";

export interface PeriodData {
  dates: string[];
  mobile: number[];
  desktop: number[];
  peak: number;
  average: number;
  growth: string;
}

export interface LineGraphStatisticsProps {
  /** Override title */
  title?: string;
  /** Override subtitle */
  subtitle?: string;
  /** Optional: drive chart from chapter metrics (members + attendance/events) */
  members?: number;
  attendance?: number | null;
  events?: number;
  tasks?: number;
  /** Use shadcn theme classes (border-border, bg-card, etc.) */
  className?: string;
}

const DEFAULT_DATA: Record<PeriodKey, PeriodData> = {
  "Last 3 months": {
    dates: ["Jun 1", "Jun 3", "Jun 5", "Jun 7", "Jun 9", "Jun 12", "Jun 15", "Jun 18", "Jun 21", "Jun 24", "Jun 27", "Jun 30"],
    mobile: [290, 270, 310, 280, 260, 350, 320, 340, 400, 370, 420, 480],
    desktop: [200, 180, 220, 255, 230, 280, 260, 270, 300, 285, 310, 320],
    peak: 480,
    average: 315,
    growth: "+15%",
  },
  "Last 30 days": {
    dates: ["Jun 1", "Jun 3", "Jun 5", "Jun 7", "Jun 9", "Jun 12", "Jun 15", "Jun 18", "Jun 21", "Jun 24", "Jun 27", "Jun 30"],
    mobile: [290, 270, 310, 280, 260, 350, 320, 340, 400, 370, 420, 480],
    desktop: [200, 180, 220, 255, 230, 280, 260, 270, 300, 285, 310, 320],
    peak: 480,
    average: 315,
    growth: "+12%",
  },
  "Last 7 days": {
    dates: ["Jun 24", "Jun 25", "Jun 26", "Jun 27", "Jun 28", "Jun 29", "Jun 30"],
    mobile: [370, 420, 380, 450, 480, 520, 550],
    desktop: [285, 310, 295, 340, 320, 365, 380],
    peak: 550,
    average: 458,
    growth: "+18%",
  },
};

function generateSmoothPath(
  values: number[],
  maxValue: number,
  height: number,
  width: number,
  padding: number,
  isArea: boolean
): string {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = values.map((value, index) => ({
    x: padding + (index / Math.max(values.length - 1, 1)) * chartWidth,
    y: padding + (1 - value / maxValue) * chartHeight,
  }));

  if (points.length < 2) return "";

  let path = `M ${points[0].x},${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
    const cp1y = prev.y;
    const cp2x = curr.x - (next ? (next.x - curr.x) * 0.3 : 0);
    const cp2y = curr.y;
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
  }

  if (isArea) {
    path += ` L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;
  }

  return path;
}

const LineGraphStatistics = ({
  title = "Total Visitors",
  subtitle = "Total for the last 3 months",
  members = 0,
  attendance = null,
  events = 0,
  tasks = 0,
  className,
}: LineGraphStatisticsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("Last 30 days");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [chartVisible, setChartVisible] = useState(false);

  const data = useMemo((): Record<PeriodKey, PeriodData> => {
    if (members > 0 || (attendance != null && attendance > 0) || events > 0) {
      const baseMembers = Math.max(members, 1);
      const baseAttendance = attendance != null ? attendance : 50;
      const dates7 = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
      const dates12 = Array.from({ length: 12 }, (_, i) => `Day ${i + 1}`);
      const membersSeries = Array.from({ length: 7 }, (_, i) =>
        Math.round(baseMembers * (0.85 + (i / 6) * 0.15))
      );
      const attendanceSeries = Array.from({ length: 7 }, (_, i) =>
        Math.round(baseAttendance * (0.9 + (i / 6) * 0.1))
      );
      const membersSeries12 = Array.from({ length: 12 }, (_, i) =>
        Math.round(baseMembers * (0.8 + (i / 11) * 0.2))
      );
      const attendanceSeries12 = Array.from({ length: 12 }, (_, i) =>
        Math.round(baseAttendance * (0.85 + (i / 11) * 0.15))
      );
      const peak = Math.max(...membersSeries, ...attendanceSeries, ...membersSeries12, ...attendanceSeries12);
      const avg = Math.round(
        [...membersSeries, ...attendanceSeries].reduce((a, b) => a + b, 0) /
          (membersSeries.length + attendanceSeries.length)
      );
      return {
        "Last 7 days": {
          dates: dates7,
          mobile: membersSeries,
          desktop: attendanceSeries,
          peak: Math.max(...membersSeries, ...attendanceSeries) + 10,
          average: avg,
          growth: "+12%",
        },
        "Last 30 days": {
          dates: dates12,
          mobile: membersSeries12,
          desktop: attendanceSeries12,
          peak: Math.max(...membersSeries12, ...attendanceSeries12) * 1.1,
          average: Math.round(
            [...membersSeries12, ...attendanceSeries12].reduce((a, b) => a + b, 0) /
              (membersSeries12.length + attendanceSeries12.length)
          ),
          growth: "+15%",
        },
        "Last 3 months": {
          dates: dates12,
          mobile: membersSeries12,
          desktop: attendanceSeries12,
          peak: Math.max(...membersSeries12, ...attendanceSeries12) * 1.15,
          average: Math.round(
            [...membersSeries12, ...attendanceSeries12].reduce((a, b) => a + b, 0) /
              (membersSeries12.length + attendanceSeries12.length)
          ),
          growth: "+18%",
        },
      };
    }
    return DEFAULT_DATA;
  }, [members, attendance, events]);

  const currentData = data[selectedPeriod];
  const maxValue = Math.max(...currentData.mobile, ...currentData.desktop) * 1.1;
  const width = 800;
  const height = 340;
  const padding = 60;

  const pathMobile = generateSmoothPath(
    currentData.mobile,
    maxValue,
    height,
    width,
    padding,
    false
  );
  const pathMobileArea = generateSmoothPath(
    currentData.mobile,
    maxValue,
    height,
    width,
    padding,
    true
  );
  const pathDesktop = generateSmoothPath(
    currentData.desktop,
    maxValue,
    height,
    width,
    padding,
    false
  );
  const pathDesktopArea = generateSmoothPath(
    currentData.desktop,
    maxValue,
    height,
    width,
    padding,
    true
  );

  useEffect(() => {
    setChartVisible(false);
    setAnimationPhase(0);
    const timers = [
      setTimeout(() => setAnimationPhase(1), 100),
      setTimeout(() => setAnimationPhase(2), 400),
      setTimeout(() => setAnimationPhase(3), 800),
      setTimeout(() => setChartVisible(true), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [selectedPeriod]);

  const periods: { label: PeriodKey; size: string; color: string }[] = [
    { label: "Last 3 months", size: "2.32 KB", color: "bg-emerald-500" },
    { label: "Last 30 days", size: "1.45 KB", color: "bg-primary" },
    { label: "Last 7 days", size: "0.89 KB", color: "bg-amber-500" },
  ];

  const metrics = [
    {
      label: "Peak",
      value: currentData.peak,
      color: "border-primary",
    },
    {
      label: "Average",
      value: currentData.average,
      color: "border-amber-500",
    },
    {
      label: "Growth",
      value: currentData.growth,
      color: "border-emerald-500",
    },
  ];

  const isCustomData = members > 0 || (attendance != null && attendance > 0) || events > 0;
  const seriesALabel = isCustomData ? "Members" : "Mobile";
  const seriesBLabel = isCustomData ? "Attendance" : "Desktop";

  return (
    <div className={cn("min-h-0 w-full font-light", className)}>
      <div className="w-full p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-extralight text-foreground mb-2 tracking-tight transition-all duration-1000",
              animationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "text-base md:text-lg text-muted-foreground font-light transition-all duration-1000 delay-200",
              animationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {subtitle}
          </p>
        </div>

        {/* Main Chart Container */}
        <div className="relative bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          {/* Legend */}
          <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-6">
            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-800 delay-300",
                animationPhase >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )}
            >
              <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary/10" />
              <span className="text-muted-foreground font-medium">{seriesALabel}</span>
              <span className="text-foreground font-semibold">
                {currentData.mobile[currentData.mobile.length - 1]}
              </span>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-800 delay-400",
                animationPhase >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )}
            >
              <div className="w-3 h-3 rounded-full border-2 border-foreground/80 bg-muted" />
              <span className="text-muted-foreground font-medium">{seriesBLabel}</span>
              <span className="text-foreground font-semibold">
                {currentData.desktop[currentData.desktop.length - 1]}
              </span>
            </div>
          </div>

          {/* Period Selection */}
          <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
            {periods.map((period, index) => (
              <button
                key={period.label}
                type="button"
                onClick={() => setSelectedPeriod(period.label)}
                className={cn(
                  "cursor-pointer transition-all duration-700 hover:scale-105 hover:shadow-md rounded-lg px-4 py-2.5 min-w-[120px] text-left",
                  selectedPeriod === period.label
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background text-muted-foreground hover:bg-muted border border-border",
                  animationPhase >= 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                )}
                style={{ transitionDelay: `${500 + index * 150}ms` }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className={cn("w-2 h-2 rounded-full", period.color)} />
                  <span className="text-xs font-medium opacity-90">{period.size}</span>
                </div>
                <div className="text-xs font-medium">{period.label}</div>
              </button>
            ))}
          </div>

          {/* Chart Area */}
          <div className="p-6 pt-20 pb-12">
            <div className="h-72 md:h-80 relative">
              <svg className="w-full h-full" viewBox={`0 0 ${width} ${height + 40}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                  <pattern id="line-grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width={width} height={height + 40} fill="url(#line-grid)" />

                {/* Desktop Area */}
                <path
                  d={pathDesktopArea}
                  fill="hsl(var(--muted) / 0.5)"
                  className={cn("transition-all duration-2000", chartVisible ? "opacity-100" : "opacity-0")}
                  style={{
                    transform: chartVisible ? "scale(1)" : "scale(0.95)",
                    transformOrigin: "center bottom",
                  }}
                />
                {/* Mobile Area */}
                <path
                  d={pathMobileArea}
                  fill="hsl(var(--primary) / 0.12)"
                  className={cn("transition-all duration-2000", chartVisible ? "opacity-100" : "opacity-0")}
                  style={{
                    transform: chartVisible ? "scale(1)" : "scale(0.95)",
                    transformOrigin: "center bottom",
                    transitionDelay: "300ms",
                  }}
                />
                {/* Desktop Line */}
                <path
                  d={pathDesktop}
                  fill="none"
                  stroke="hsl(var(--foreground) / 0.8)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={cn("transition-all duration-2000", chartVisible ? "opacity-100" : "opacity-0")}
                  style={{
                    strokeDasharray: chartVisible ? "none" : "1000",
                    strokeDashoffset: chartVisible ? 0 : 1000,
                    transitionDelay: "600ms",
                  }}
                />
                {/* Mobile Line */}
                <path
                  d={pathMobile}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={cn("transition-all duration-2000", chartVisible ? "opacity-100" : "opacity-0")}
                  style={{
                    strokeDasharray: chartVisible ? "none" : "1000",
                    strokeDashoffset: chartVisible ? 0 : 1000,
                    transitionDelay: "900ms",
                  }}
                />

                {/* Data Points */}
                {currentData.dates.map((_date, index) => {
                  const chartWidth = width - padding * 2;
                  const chartHeight = height - padding * 2;
                  const x = padding + (index / Math.max(currentData.dates.length - 1, 1)) * chartWidth;
                  const mobileY = padding + (1 - currentData.mobile[index] / maxValue) * chartHeight;
                  const desktopY = padding + (1 - currentData.desktop[index] / maxValue) * chartHeight;
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={desktopY}
                        r={hoveredPoint === index ? 5 : 3}
                        fill="hsl(var(--foreground) / 0.8)"
                        className={cn(
                          "transition-all duration-500 cursor-pointer",
                          chartVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
                        )}
                        style={{ transitionDelay: `${1200 + index * 50}ms` }}
                        onMouseEnter={() => setHoveredPoint(index)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <circle
                        cx={x}
                        cy={mobileY}
                        r={hoveredPoint === index ? 5 : 3}
                        fill="hsl(var(--primary))"
                        className={cn(
                          "transition-all duration-500 cursor-pointer",
                          chartVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
                        )}
                        style={{ transitionDelay: `${1300 + index * 50}ms` }}
                        onMouseEnter={() => setHoveredPoint(index)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}

                {/* X-axis Labels */}
                {currentData.dates.map((date, index) => {
                  const chartWidth = width - padding * 2;
                  const x = padding + (index / Math.max(currentData.dates.length - 1, 1)) * chartWidth;
                  return (
                    <text
                      key={index}
                      x={x}
                      y={height - 20}
                      textAnchor="middle"
                      fill="hsl(var(--muted-foreground))"
                      fontSize="12"
                      fontWeight="400"
                      className={cn("transition-all duration-500", chartVisible ? "opacity-100" : "opacity-0")}
                      style={{ transitionDelay: `${1500 + index * 30}ms` }}
                    >
                      {date}
                    </text>
                  );
                })}

                {/* Hover Tooltip */}
                {hoveredPoint !== null && (
                  <g>
                    <rect
                      x={padding + (hoveredPoint / Math.max(currentData.dates.length - 1, 1)) * (width - padding * 2) - 48}
                      y={16}
                      width={96}
                      height={58}
                      fill="hsl(var(--background))"
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      rx="6"
                      className="drop-shadow-lg"
                    />
                    <text
                      x={padding + (hoveredPoint / Math.max(currentData.dates.length - 1, 1)) * (width - padding * 2)}
                      y={34}
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {currentData.dates[hoveredPoint]}
                    </text>
                    <text
                      x={padding + (hoveredPoint / Math.max(currentData.dates.length - 1, 1)) * (width - padding * 2)}
                      y={48}
                      textAnchor="middle"
                      fill="hsl(var(--primary))"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {seriesALabel}: {currentData.mobile[hoveredPoint]}
                    </text>
                    <text
                      x={padding + (hoveredPoint / Math.max(currentData.dates.length - 1, 1)) * (width - padding * 2)}
                      y={62}
                      textAnchor="middle"
                      fill="hsl(var(--foreground) / 0.8)"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {seriesBLabel}: {currentData.desktop[hoveredPoint]}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Bottom Metrics */}
          <div className="px-6 pb-6 flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-wrap gap-3">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={cn(
                    "bg-card rounded-lg shadow-sm border-2 p-4 min-w-[100px] transition-all duration-800 hover:scale-105 hover:shadow-md",
                    metric.color,
                    animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  )}
                  style={{ transitionDelay: `${1800 + index * 200}ms` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                  </div>
                  <div className="text-xl font-bold text-foreground mb-0.5">{metric.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{metric.label}</div>
                </div>
              ))}
            </div>
            <div
              className={cn(
                "bg-primary text-primary-foreground px-4 py-3 rounded-lg transition-all duration-800",
                animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
              style={{ transitionDelay: "2400ms" }}
            >
              <div className="flex items-center gap-3">
                <span className="opacity-90 font-medium text-sm">Summary</span>
                <span className="font-bold text-sm">
                  Peak {currentData.peak} · Avg {currentData.average}
                </span>
              </div>
              <div className="w-32 h-1.5 bg-primary-foreground/20 rounded-full mt-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-primary-foreground/80 rounded-full transition-all duration-2000",
                    chartVisible ? "w-full" : "w-0"
                  )}
                  style={{ transitionDelay: "2800ms" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineGraphStatistics;
export { LineGraphStatistics };
