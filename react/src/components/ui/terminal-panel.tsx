import * as React from "react"
import { cn } from "@/lib/utils"

interface TerminalPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * A terminal-styled panel component with Warhammer terminal borders
 * Features full top/bottom borders with corner segments on the sides
 */
export function TerminalPanel({ 
  children, 
  className,
  ...props 
}: TerminalPanelProps) {
  return (
    <div 
      className={cn(
        "bg-terminal-bgLight relative border-t-[2px] border-b-[2px] border-[var(--foreground)]", 
        className
      )}
      {...props}
    >
      <div className="absolute left-0 top-0 w-[2px] h-[15px] bg-[var(--foreground)]"></div>
      <div className="absolute left-0 bottom-0 w-[2px] h-[15px] bg-[var(--foreground)]"></div>
      <div className="absolute right-0 top-0 w-[2px] h-[15px] bg-[var(--foreground)]"></div>
      <div className="absolute right-0 bottom-0 w-[2px] h-[15px] bg-[var(--foreground)]"></div>
      {children}
    </div>
  )
}