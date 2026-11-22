import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "card" | "table-row";
}

export default function SkeletonLoader({
  className = "",
  variant = "text",
}: SkeletonProps) {
  if (variant === "circular") {
    return (
      <div
        className={`rounded-full bg-white/10 animate-pulse shrink-0 ${className}`}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse flex flex-col gap-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-6 w-1/3 bg-white/10 rounded-md" />
          <div className="h-6 w-16 bg-white/10 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-4/5 bg-white/10 rounded" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className="h-8 w-20 bg-white/10 rounded-lg" />
          <div className="h-8 w-20 bg-white/10 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div
        className={`flex items-center justify-between p-4 border-b border-white/5 animate-pulse ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
        </div>
        <div className="h-6 w-24 bg-white/10 rounded-full" />
      </div>
    );
  }

  if (variant === "rectangular") {
    return (
      <div
        className={`rounded-xl bg-white/10 animate-pulse ${className}`}
      />
    );
  }

  return (
    <div
      className={`h-4 w-full bg-white/10 rounded animate-pulse ${className}`}
    />
  );
}
