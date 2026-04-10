/**
 * Simple skeleton loader for page loading states.
 *
 * This component is used across the app to render neutral loading
 * placeholders while content is fetching.
 */
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/60", className)}
      {...props}
    />
  )
}

export { Skeleton }
