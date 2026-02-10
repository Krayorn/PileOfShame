import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SkullIcon } from '../ui/skull-icon';

interface TerminalLayoutProps {
  children: React.ReactNode;
}

export function TerminalLayout({ children }: TerminalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, logout } = useAuth();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

      <div className="border-l-2 border-r-2 border-terminal-border px-4 pt-8 pb-2 flex items-center justify-between flex-shrink-0">
        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-1 text-xs uppercase tracking-widest font-semibold">
              <span className="text-terminal-fg-dim mr-2">{'>'}  COGITATOR SYS // MODE:</span>
              <Link
                to="/collection"
                className={`px-3 py-1 border transition-all ${
                  isActive('/collection')
                    ? 'border-terminal-fg bg-terminal-fg/10 text-terminal-fg'
                    : 'border-transparent text-terminal-fg-dim hover:text-terminal-fg hover:border-terminal-border'
                }`}
              >
                COLLECTION
              </Link>
              <span className="text-terminal-fg-dim">//</span>
              <Link
                to="/projects"
                className={`px-3 py-1 border transition-all ${
                  isActive('/projects')
                    ? 'border-terminal-fg bg-terminal-fg/10 text-terminal-fg'
                    : 'border-transparent text-terminal-fg-dim hover:text-terminal-fg hover:border-terminal-border'
                }`}
              >
                PROJECTS
              </Link>
              {isAdmin && (
                <>
                  <span className="text-terminal-fg-dim">//</span>
                  <Link
                    to="/admin"
                    className={`px-3 py-1 border transition-all ${
                      isActive('/admin')
                        ? 'border-terminal-warning bg-terminal-warning/10 text-terminal-warning'
                        : 'border-transparent text-terminal-warning/60 hover:text-terminal-warning hover:border-terminal-warning/40'
                    }`}
                  >
                    ADMIN
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/about"
                className="text-[10px] text-terminal-fg-dim/50 hover:text-terminal-fg-dim transition-colors uppercase tracking-widest"
              >
                ABOUT
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-terminal-destructive/70 hover:text-terminal-destructive transition-colors uppercase tracking-widest font-semibold"
              >
                LOGOUT
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-end w-full">
            <Link
              to="/about"
              className="text-[10px] text-terminal-fg-dim/50 hover:text-terminal-fg-dim transition-colors uppercase tracking-widest"
            >
              ABOUT
            </Link>
          </div>
        )}
      </div>

      <div className="p-4 flex-grow border-l-2 border-r-2 border-terminal-border min-h-0 flex flex-col overflow-scroll">
        {children}
      </div>

      <div className="relative border-t-2 border-terminal-border flex-shrink-0">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-terminal-bg px-4">
          <SkullIcon className="size-10 text-terminal-fg" />
          
        </div>
      </div>
    </div>
  );
}
