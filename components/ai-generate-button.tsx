"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface AIGenerateButtonProps {
  onClick: () => void
  isLoading?: boolean
  className?: string
}

export function AIGenerateButton({ onClick, isLoading = false, className }: AIGenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      {/* Animated background shimmer */}
      <span className="absolute inset-0 overflow-hidden">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </span>
      
      <span className="relative flex items-center gap-2">
        {isLoading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <span className="font-medium">
          {isLoading ? "Generating..." : "Auto-generate with AI"}
        </span>
      </span>
    </Button>
  )
}
