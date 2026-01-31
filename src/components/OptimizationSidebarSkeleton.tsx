import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizationSidebarSkeletonProps {
  isDark?: boolean
}

export function OptimizationSidebarSkeleton({ isDark = false }: OptimizationSidebarSkeletonProps) {
  return (
    <div className={cn(
      "w-full h-full flex flex-col overflow-hidden font-['Inter',sans-serif] rounded-2xl",
      isDark ? "bg-zinc-900" : "bg-white"
    )}>
      {/* LinkedIn Score Header Skeleton */}
      <div className={cn(
        "p-6 border-b flex-shrink-0",
        isDark ? "border-white/10" : "border-gray-100"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className={cn(
              "h-8 w-40 mb-3",
              isDark ? "bg-zinc-800" : "bg-gray-200"
            )} />
            <Skeleton className={cn(
              "h-4 w-32",
              isDark ? "bg-zinc-800" : "bg-gray-200"
            )} />
          </div>
          {/* Score circle skeleton */}
          <Skeleton className={cn(
            "w-20 h-20 rounded-full",
            isDark ? "bg-zinc-800" : "bg-gray-200"
          )} />
        </div>
      </div>

      {/* Summary/Description Skeleton */}
      <div className={cn(
        "p-6 border-b",
        isDark ? "border-white/10" : "border-gray-100"
      )}>
        <Skeleton className={cn(
          "h-4 w-full mb-2",
          isDark ? "bg-zinc-800" : "bg-gray-200"
        )} />
        <Skeleton className={cn(
          "h-4 w-5/6 mb-2",
          isDark ? "bg-zinc-800" : "bg-gray-200"
        )} />
        <Skeleton className={cn(
          "h-4 w-4/6",
          isDark ? "bg-zinc-800" : "bg-gray-200"
        )} />
      </div>

      {/* Section Cards Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "p-4 rounded-xl border transition-all",
              isDark ? "bg-zinc-800/50 border-white/10" : "bg-gray-50 border-gray-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Icon skeleton */}
                <Skeleton className={cn(
                  "w-10 h-10 rounded-lg flex-shrink-0",
                  isDark ? "bg-zinc-700" : "bg-gray-200"
                )} />
                <div className="flex-1">
                  {/* Title skeleton */}
                  <Skeleton className={cn(
                    "h-5 w-32 mb-2",
                    isDark ? "bg-zinc-700" : "bg-gray-200"
                  )} />
                  {/* Description skeleton */}
                  <Skeleton className={cn(
                    "h-3 w-48",
                    isDark ? "bg-zinc-700" : "bg-gray-200"
                  )} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Badge skeleton */}
                <Skeleton className={cn(
                  "h-6 w-16 rounded-full",
                  isDark ? "bg-zinc-700" : "bg-gray-200"
                )} />
                {/* Arrow skeleton */}
                <Skeleton className={cn(
                  "w-5 h-5 rounded",
                  isDark ? "bg-zinc-700" : "bg-gray-200"
                )} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
