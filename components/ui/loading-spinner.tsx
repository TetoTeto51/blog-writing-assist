import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  variant?: "overlay" | "inline"
  size?: "sm" | "default" | "lg"
}

export function LoadingSpinner({ 
  className,
  variant = "inline",
  size = "default"
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  }

  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className={cn("h-8 w-8 animate-spin text-primary", className)} />
          <p className="text-sm text-muted-foreground">生成中...</p>
        </div>
      </div>
    )
  }

  return (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
  )
} 