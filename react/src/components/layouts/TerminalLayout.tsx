import React from 'react';

interface TerminalLayoutProps {
  children: React.ReactNode;
}

/**
 * Terminal layout with top and bottom borders and centered icons
 * Features Warhammer 40k Imperium terminal aesthetic
 */
export function TerminalLayout({ children }: TerminalLayoutProps) {
  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col p-4">
      <div className="relative border-b-2 border-terminal-border flex-shrink-0">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-terminal-bg px-4">
          <svg
            width="40"
            height="40"
            viewBox="0 0 25 25"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-terminal-fg-dim"
          >
            <path d="M 2.5 5 h 7.5 v 2 C 4 10 4 20 12.5 20 C 20 20 20 10 15 7 v -2 h 7.5 v 2 h -5 C 20 10 30 23 12.5 24 C -5 23 4 10 7.5 7 h -5 z" />
          </svg>
        </div>
      </div>

      <div className="p-4 flex-grow border-l-2 border-r-2 border-terminal-border min-h-0 flex flex-col overflow-scroll">
        {children}
      </div>

      <div className="relative border-t-2 border-terminal-border flex-shrink-0">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-terminal-bg px-4">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-terminal-fg"
          >
            <circle cx="12" cy="9" r="5" />
            <path d="M8 14 L8 17 L10 19 L14 19 L16 17 L16 14" />
            <circle cx="9.5" cy="8" r="1" />
            <circle cx="14.5" cy="8" r="1" />
            <path d="M10 11 Q12 12 14 11" />
            <path d="M9 14 L15 14" />
            <path d="M10 16 L14 16" />
          </svg>
        </div>
      </div>
    </div>
  );
}

