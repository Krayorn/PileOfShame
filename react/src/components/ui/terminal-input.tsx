import * as React from "react"
import { cn } from "@/lib/utils"

interface TerminalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/**
 * Terminal-styled input component with command prompt prefix
 * Features the Warhammer terminal aesthetic with '>' prompt
 */
export const TerminalInput = React.forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-terminal-fg font-mono">{`>`}</span>
        <input
          ref={ref}
          className={cn(
            "flex-1 px-3 py-2 bg-terminal-bg border-l-4 border-terminal-border text-terminal-fg focus:outline-none focus:border-terminal-accent transition-all font-mono",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
TerminalInput.displayName = "TerminalInput"

