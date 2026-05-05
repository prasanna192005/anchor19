"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  variant?: "dashboard" | "list" | "grid" | "detail";
}

export default function PageSkeleton({ variant = "list" }: PageSkeletonProps) {
  return (
    <div className="min-h-screen bg-background p-8 lg:p-12 pt-24 lg:pt-32 relative overflow-hidden">
      <div className="fixed inset-0 bg-mesh opacity-10 pointer-events-none" />
      
      {/* Header Skeleton */}
      <div className="mb-20 relative z-10 animate-pulse">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800" />
          <div className="space-y-3">
            <div className="w-32 h-2 bg-zinc-800 rounded-full" />
            <div className="w-64 h-12 bg-zinc-900 rounded-xl" />
          </div>
        </div>
        <div className="w-full max-w-2xl h-4 bg-zinc-900 rounded-full mb-4" />
        <div className="w-2/3 max-w-2xl h-4 bg-zinc-900 rounded-full" />
      </div>

      <div className="relative z-10">
        {variant === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 glass-card rounded-3xl border border-zinc-900 animate-pulse p-8 space-y-6">
                  <div className="w-20 h-2 bg-zinc-800 rounded-full" />
                  <div className="w-full h-8 bg-zinc-900 rounded-xl" />
                  <div className="space-y-3 pt-4">
                    <div className="w-full h-3 bg-zinc-900 rounded-full" />
                    <div className="w-5/6 h-3 bg-zinc-900 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4 h-[600px] glass-card rounded-3xl border border-zinc-900 animate-pulse p-8">
              <div className="w-20 h-2 bg-zinc-800 rounded-full mb-8" />
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="w-3/4 h-3 bg-zinc-900 rounded-full" />
                    <div className="w-1/2 h-2 bg-zinc-800 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {variant === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 glass-card rounded-3xl border border-zinc-900 animate-pulse p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900" />
                  <div className="w-4 h-4 rounded-full bg-zinc-900" />
                </div>
                <div className="w-full h-6 bg-zinc-900 rounded-lg" />
                <div className="w-2/3 h-3 bg-zinc-800 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {variant === "list" && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-20 glass-card rounded-2xl border border-zinc-900 animate-pulse flex items-center px-6 gap-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="w-1/3 h-4 bg-zinc-900 rounded-full" />
                  <div className="w-1/6 h-2 bg-zinc-800 rounded-full" />
                </div>
                <div className="w-20 h-6 bg-zinc-900 rounded-xl" />
                <div className="w-8 h-8 rounded-lg bg-zinc-900" />
              </div>
            ))}
          </div>
        )}

        {variant === "detail" && (
          <div className="max-w-4xl mx-auto space-y-12 animate-pulse pt-12">
            <div className="space-y-4">
              <div className="w-full h-8 bg-zinc-900 rounded-xl" />
              <div className="w-full h-8 bg-zinc-900 rounded-xl" />
              <div className="w-2/3 h-8 bg-zinc-900 rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="w-full h-4 bg-zinc-900 rounded-full" />
              <div className="w-full h-4 bg-zinc-900 rounded-full" />
              <div className="w-full h-4 bg-zinc-900 rounded-full" />
              <div className="w-5/6 h-4 bg-zinc-900 rounded-full" />
              <div className="w-4/6 h-4 bg-zinc-900 rounded-full" />
            </div>
            <div className="h-96 w-full bg-zinc-950/50 border border-zinc-900 rounded-3xl" />
          </div>
        )}
      </div>

      {/* Decorative Blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-accent opacity-[0.02] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-primary opacity-[0.02] blur-[120px] rounded-full pointer-events-none"></div>
    </div>
  );
}
