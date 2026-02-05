import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-sm leading-relaxed">
      <Link
        to="/collection"
        className="inline-flex items-center gap-1.5 text-terminal-fg-dim hover:text-terminal-fg transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        <span>Back to collection</span>
      </Link>

      <h1 className="text-lg">About</h1>

      <p>
        Hi, I'm <span className="text-terminal-fg">Krayorn</span> and I made this website. If you have any feedback, ideas or suggestions please send them my way! You can also just send me a message to chat, I'd be delighted!
      </p>

      <div className="flex flex-wrap gap-4">
        <a
          href="https://x.com/Krayorn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-terminal-fg hover:text-terminal-accent transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>@Krayorn</span>
        </a>
        <a
          href="https://github.com/Krayorn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-terminal-fg hover:text-terminal-accent transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span>Krayorn</span>
        </a>
        <span className="text-terminal-fg">
          me@krayorn.com
        </span>
      </div>

      <p>
        You can find more stuff I made on my{' '}
        <a
          href="https://krayorn.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-terminal-fg hover:text-terminal-accent transition-colors underline"
        >
          blog
        </a>
        . And if you like miniatures and are also into board games, take a look at{' '}
        <a
          href="https://tabletop.krayorn.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-terminal-fg hover:text-terminal-accent transition-colors underline"
        >
          tabletop.krayorn.com
        </a>
        {' '}to track your games and get some fun statistics like win rate of a certain player, characters pick rate, average score, and more!
      </p>
    </div>
  );
}
