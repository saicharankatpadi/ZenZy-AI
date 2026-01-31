import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props // This collects all other props (id, style, onClick, etc.)
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props} // This spreads them into the div
    />
  )
}

export { Skeleton }