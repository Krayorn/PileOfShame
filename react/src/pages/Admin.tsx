import { useEffect, useState } from 'react';
import axios from 'axios';
import { adminApi } from '../api';
import { TerminalPanel } from '../components/ui/terminal-panel';
import { useTypewriter } from '../hooks/useTypewriter';
import { useCounter } from '../hooks/useCounter';
import { formatDistanceToNow } from 'date-fns';

interface UserStatistics {
  id: string;
  username: string;
  isAdmin: boolean;
  foldersCount: number;
  miniaturesCount: number;
  picturesCount: number;
}

interface GlobalStats {
  totalUsers: number;
  totalMiniatures: number;
  totalModels: number;
  totalFolders: number;
  totalPictures: number;
  totalProjects: number;
  statusBreakdown: {
    Gray: number;
    Built: number;
    Painted: number;
  };
  recentlyPainted: Array<{ name: string; paintedAt: string; username: string; count: number }>;
  topPainters: Array<{ username: string; paintedCount: number }>;
  biggestShames: Array<{ username: string; unpaintedCount: number }>;
}

type Tab = 'auspex' | 'census';

function StatCard({ label, value }: { label: string; value: number }) {
  const animatedValue = useCounter(value, { duration: 800, delay: 200 });
  return (
    <TerminalPanel>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-terminal-fg">{animatedValue}</p>
      </div>
    </TerminalPanel>
  );
}

function StatusBar({ label, count, total, colorClass }: { label: string; count: number; total: number; colorClass: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={`w-20 text-xs font-semibold uppercase tracking-wider ${colorClass.replace('bg-', 'text-')}`}>{label}</span>
      <div className="flex-1 h-5 bg-terminal-bg rounded overflow-hidden border border-terminal-borderDim">
        <div
          className={`h-full ${colorClass} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-24 text-right text-xs text-terminal-fgDim">
        {count} ({pct.toFixed(1)}%)
      </span>
    </div>
  );
}

export function Admin() {
  const [users, setUsers] = useState<UserStatistics[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('auspex');

  const typedTitle = useTypewriter('ADMINISTRATUM COMMAND TERMINAL', { speed: 30, delay: 100 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getGlobalStats(),
        ]);
        setUsers(usersRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Failed to load admin data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <TerminalPanel className="mt-12">
        <div className="p-6">
          <p className="text-terminal-fg animate-pulse uppercase tracking-wider">Querying Administratum archives...</p>
        </div>
      </TerminalPanel>
    );
  }

  if (error) {
    return (
      <TerminalPanel className="mt-12">
        <div className="p-6">
          <p className="text-red-400 uppercase tracking-wider">{error}</p>
        </div>
      </TerminalPanel>
    );
  }

  const totalMinis = stats
    ? stats.statusBreakdown.Gray + stats.statusBreakdown.Built + stats.statusBreakdown.Painted
    : 0;
  const combatReadiness = totalMinis > 0 && stats
    ? (stats.statusBreakdown.Painted / totalMinis) * 100
    : 0;

  const tabClass = (tab: Tab) =>
    `px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer ${
      activeTab === tab
        ? 'border-terminal-fg bg-terminal-fg/10 text-terminal-fg'
        : 'border-terminal-borderDim text-terminal-fgDim hover:text-terminal-fg hover:border-terminal-fg'
    }`;

  return (
    <div className="mt-12 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-terminal-fg tracking-widest">
          {typedTitle}
          <span className="animate-pulse">_</span>
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-4">
        <button className={tabClass('auspex')} onClick={() => setActiveTab('auspex')}>
          GLOBAL AUSPEX
        </button>
        <button className={tabClass('census')} onClick={() => setActiveTab('census')}>
          IMPERIAL CENSUS
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'auspex' && stats && (
        <div className="space-y-6">
          {/* Section A: Forge World Output */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-terminal-fgDim mb-3">
              ⚙ FORGE WORLD OUTPUT
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="REGISTERED OPERATIVES" value={stats.totalUsers} />
              <StatCard label="TOTAL ASSETS DEPLOYED" value={stats.totalModels} />
              <StatCard label="DISTINCT UNIT ENTRIES" value={stats.totalMiniatures} />
              <StatCard label="STRATEGIC DIVISIONS" value={stats.totalFolders} />
              <StatCard label="PICT-CAPTURES ON FILE" value={stats.totalPictures} />
              <StatCard label="ACTIVE CAMPAIGNS" value={stats.totalProjects} />
            </div>
          </div>

          {/* Section B: Combat Readiness */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-terminal-fgDim mb-3">
              ⚔ COMBAT READINESS
            </h2>
            <TerminalPanel>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                    OVERALL COMBAT READINESS
                  </span>
                  <span className="text-lg font-bold text-terminal-fg">
                    {combatReadiness.toFixed(1)}%
                  </span>
                </div>
                <StatusBar label="Gray" count={stats.statusBreakdown.Gray} total={totalMinis} colorClass="bg-terminal-gray" />
                <StatusBar label="Built" count={stats.statusBreakdown.Built} total={totalMinis} colorClass="bg-terminal-built" />
                <StatusBar label="Painted" count={stats.statusBreakdown.Painted} total={totalMinis} colorClass="bg-terminal-painted" />
              </div>
            </TerminalPanel>
          </div>

          {/* Section C: Honours & Shame */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-terminal-fgDim mb-3">
              🏆 HONOURS & SHAME
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hall of Heroes */}
              <TerminalPanel>
                <div className="p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">
                    HALL OF HEROES — TOP PAINTERS
                  </h3>
                  <div className="space-y-2">
                    {stats.topPainters.map((painter, i) => (
                      <div
                        key={painter.username}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className={i === 0 ? 'text-amber-500 font-bold' : 'text-terminal-fgDim'}>
                          #{i + 1} {painter.username}
                        </span>
                        <span className={i === 0 ? 'text-amber-500 font-bold' : 'text-terminal-fg'}>
                          {painter.paintedCount} painted
                        </span>
                      </div>
                    ))}
                    {stats.topPainters.length === 0 && (
                      <p className="text-terminal-fgDim text-xs">No data available.</p>
                    )}
                  </div>
                </div>
              </TerminalPanel>

              {/* Pile of Shame Leaderboard */}
              <TerminalPanel>
                <div className="p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">
                    PILE OF SHAME LEADERBOARD
                  </h3>
                  <div className="space-y-2">
                    {stats.biggestShames.map((shamer, i) => (
                      <div
                        key={shamer.username}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className={i === 0 ? 'text-red-400 font-bold' : 'text-terminal-fgDim'}>
                          #{i + 1} {shamer.username}
                        </span>
                        <span className={i === 0 ? 'text-red-400 font-bold' : 'text-terminal-fg'}>
                          {shamer.unpaintedCount} unpainted
                        </span>
                      </div>
                    ))}
                    {stats.biggestShames.length === 0 && (
                      <p className="text-terminal-fgDim text-xs">No data available.</p>
                    )}
                  </div>
                </div>
              </TerminalPanel>
            </div>
          </div>

          {/* Section D: Recent Field Reports */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-terminal-fgDim mb-3">
              📡 RECENT FIELD REPORTS
            </h2>
            <TerminalPanel>
              <div className="p-4">
                <div className="space-y-2">
                  {stats.recentlyPainted.map((entry, i) => (
                    <div
                      key={`${entry.name}-${entry.paintedAt}-${i}`}
                      className="flex items-center justify-between text-sm border-b border-terminal-borderDim pb-2 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <span className="text-terminal-fg font-semibold">{entry.name}</span>
                        <span className="text-terminal-fgDim"> × {entry.count}</span>
                        <span className="text-terminal-fgDim"> — </span>
                        <span className="text-amber-500">{entry.username}</span>
                      </div>
                      <span className="text-xs text-terminal-fgDim">
                        {formatDistanceToNow(new Date(entry.paintedAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                  {stats.recentlyPainted.length === 0 && (
                    <p className="text-terminal-fgDim text-xs">No recent field reports.</p>
                  )}
                </div>
              </div>
            </TerminalPanel>
          </div>
        </div>
      )}

      {activeTab === 'census' && (
        <div>
          <TerminalPanel>
            <div className="p-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-500 mb-4">
                IMPERIAL CENSUS — PERSONNEL DATABASE
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-terminal-borderDim">
                      <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-terminal-fg">Username</th>
                      <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-terminal-fg">Clearance</th>
                      <th className="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider text-terminal-fg">Divisions</th>
                      <th className="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider text-terminal-fg">Units</th>
                      <th className="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider text-terminal-fg">Pict-Captures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-terminal-borderDim/30 hover:bg-terminal-fg/5 transition-colors"
                      >
                        <td className="px-4 py-2 text-sm text-terminal-fg">{user.username}</td>
                        <td className="px-4 py-2 text-sm">
                          {user.isAdmin ? (
                            <span className="text-amber-500 font-bold uppercase tracking-wider text-xs">INQUISITOR</span>
                          ) : (
                            <span className="text-terminal-fgDim text-xs uppercase tracking-wider">Operative</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-terminal-fg">{user.foldersCount}</td>
                        <td className="px-4 py-2 text-sm text-right text-terminal-fg">{user.miniaturesCount}</td>
                        <td className="px-4 py-2 text-sm text-right text-terminal-fg">{user.picturesCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <p className="mt-4 text-terminal-fgDim text-xs uppercase tracking-wider">No operatives found in the census.</p>
              )}
            </div>
          </TerminalPanel>
        </div>
      )}
    </div>
  );
}
