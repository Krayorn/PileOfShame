import * as React from "react"
import { cn } from "@/lib/utils"

interface TerminalSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

/**
 * Terminal-styled select component with command prompt prefix
 * Features the Warhammer terminal aesthetic with '>' prompt
 */
export const TerminalSelect = React.forwardRef<HTMLSelectElement, TerminalSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-terminal-fg font-mono">{`>`}</span>
        <select
          ref={ref}
          className={cn(
            "flex-1 px-3 py-2 bg-terminal-bg border-l-4 border-terminal-border text-terminal-fg focus:outline-none focus:border-terminal-accent transition-all font-mono uppercase",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    )
  }
)
TerminalSelect.displayName = "TerminalSelect"

