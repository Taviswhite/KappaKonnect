"use client";

import * as React from "react";
import {
  format,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DAYS_OF_WEEK = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

export interface MiniCalendarProps {
  /** Controlled selected date */
  selectedDate?: Date;
  /** Called when a day is selected */
  onSelectDate?: (date: Date) => void;
  /** Set of date strings (yyyy-MM-dd) that have events; show dot indicator */
  eventDates?: Set<string>;
  /** Optional class name for the root */
  className?: string;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate: controlledSelected,
  onSelectDate,
  eventDates,
  className,
}) => {
  const [internalSelected, setInternalSelected] = React.useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = React.useState<Date>(new Date());

  const selectedDate = controlledSelected ?? internalSelected;
  const setSelectedDate = React.useCallback(
    (date: Date) => {
      if (onSelectDate) onSelectDate(date);
      else setInternalSelected(date);
    },
    [onSelectDate]
  );

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 0 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 0 }),
  });

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow",
        className
      )}
    >
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-medium">
          {format(currentWeek, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center mb-2 px-4">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day.key}
            className="text-xs font-medium text-muted-foreground"
          >
            {day.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-4 pt-0">
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const isSelected = dateKey === format(selectedDate, "yyyy-MM-dd");
          const hasEvent = eventDates?.has(dateKey);

          return (
            <Button
              key={day.toString()}
              variant={isSelected ? "default" : "ghost"}
              className={cn(
                "h-9 w-9 p-0 font-normal flex flex-col items-center justify-center gap-0.5",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => setSelectedDate(day)}
            >
              <time dateTime={dateKey}>{format(day, "d")}</time>
              {hasEvent && (
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  )}
                  aria-hidden
                />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
