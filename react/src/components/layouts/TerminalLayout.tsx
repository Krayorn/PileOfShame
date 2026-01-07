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
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-terminal-fg"
            viewBox="145 250 500 400"
          >
            <path d="M380.5 225.1c-27.5 4.2-52.8 16.1-74.8 35.2-13.6 11.7-32.5 38.7-36.7 52.5-2.8 9.1-4.4 23.8-3.7 35.6.6 12 4.9 26.5 12.9 43.4 12.5 26.5 11.8 36.3-4.2 56.8-4 5.1-4.5 6.3-4.5 10.9.1 7.2 2 11 9.3 19 3.5 3.8 6.8 8.1 7.3 9.4s1.4 6.6 1.9 11.8c1.4 13.3 3.3 16.3 12.5 20.4q11.25 4.95 25.5-.9c4.1-1.7 8.6-3.3 10-3.4 2.4-.3 2.5-.1 2.8 6.8.2 5.9-.2 8.1-2.7 14-3.9 9.2-7.1 26.9-6.2 35.1.3 2.8 3.3 4.3 9 4.3 7.9 0 9.2-1.2 10.2-9.5.5-3.8 1.2-7.2 1.6-7.6.5-.4 2.2-.9 3.8-1.1l3-.3.7 6.9c.4 3.8 1.1 7.3 1.6 7.8 1.2 1.2 8.1 1.7 10.7.8 1.5-.5 2.2-2.2 3-7.1.9-5.9 1.2-6.4 3.5-6.4s2.5.4 3 5.8c.3 3.6 1.1 6.2 2 6.7.8.5 4.1 1 7.2 1 7.3 0 8.8-1.4 8.8-8.3 0-6.8.9-8 6-8s6 1.2 6 8c0 6.9 1.5 8.3 8.8 8.3 3.1 0 6.4-.5 7.2-1 .9-.5 1.7-3.1 2-6.7.5-5.4.7-5.8 3-5.8s2.6.5 3.5 6.4c.8 4.9 1.5 6.6 3 7.1 2.6.9 9.5.4 10.7-.8.5-.5 1.2-4 1.6-7.8l.7-6.9 3 .3c1.7.2 3.3.7 3.8 1.1.4.4 1.1 3.8 1.6 7.6 1 8.3 2.3 9.5 10.2 9.5 5.7 0 8.7-1.5 9-4.3.9-8.1-2.3-25.8-6.2-35.3-2.5-6-2.9-8.3-2.7-14 .3-6.7.4-6.9 2.8-6.6 1.4.1 5.9 1.7 10 3.4q14.25 5.85 25.5.9c9.2-4.1 11.1-7.1 12.5-20.4.5-5.2 1.4-10.5 1.9-11.8s3.8-5.6 7.3-9.4c7.3-8 9.2-11.8 9.3-19 0-4.6-.5-5.8-4.5-10.9-9.6-12.3-13-19.7-13-28.7 0-5.8 3.4-16.7 8.8-28.1 8-16.9 12.3-31.4 12.9-43.4.7-11.8-.9-26.5-3.7-35.6-4.2-13.8-23.1-40.8-36.7-52.5-19.3-16.7-40.8-27.8-65.3-33.5-6.7-1.5-13-2-29.5-2.3-11.5-.2-23.7 0-27 .6m-36.8 217.1c13.1 5.2 39.7 19.9 40.1 22.1.4 2.1-6 6.1-16.5 10.4-10.7 4.3-38.4 12.3-45 13-5.1.6-5.4.4-8.5-3-5.8-6.4-11.4-24.9-10.5-34.5.7-6.3 1.7-7.8 6-8.8 1.8-.3 4.6-1.3 6.2-2.2 7.4-3.8 12.4-3.3 28.2 3m148.8-3c1.7.9 4.4 1.9 6.2 2.2 4.3 1 5.3 2.5 6 8.8.9 9.6-4.7 28.1-10.5 34.5-3.1 3.4-3.4 3.6-8.5 3-6.6-.7-34.3-8.7-45-13-10.5-4.3-16.9-8.3-16.5-10.4.4-2.2 27-16.9 40.2-22.1 15.8-6.3 20.6-6.8 28.1-3m-82.6 45.2c2.9 2.6 9.7 12.6 11.2 16.3.6 1.5 1.7 6.1 2.5 10.2 1.2 6.2 1.2 7.7.1 8.8-1 1.1-1.8.8-4.5-1.7-3-2.7-11.3-6-15.2-6s-12.2 3.3-15.2 6c-2.7 2.5-3.5 2.8-4.5 1.7-1.1-1.1-1.1-2.6.1-8.8 1.8-9.2 2.8-11.8 6.7-17.7 5.7-8.4 8.7-11 12.7-10.9 2.3 0 4.6.8 6.1 2.1"/>
          </svg>
          
        </div>
      </div>
    </div>
  );
}

