"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type ScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollArea>;

interface XScrollProps extends ScrollAreaProps {}

export default function XScroll({
  children,
  className,
  ...props
}: XScrollProps) {
  return (
    <div className="flex">
      <ScrollArea
        className={cn("w-full flex-1", className)}
        {...props}
      >
        {children}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
