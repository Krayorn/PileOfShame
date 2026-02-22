import { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';
import { collectionApi, projectApi } from '../api';
import type { Miniature } from '../types/miniature';
import type { Project } from '../types/project';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from './ui/dialog';

type Source = 'collection' | 'all_projects' | 'project';

export function RandomMiniatureDialog() {
    const [open, setOpen] = useState(false);
    const [source, setSource] = useState<Source>('collection');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [result, setResult] = useState<Miniature | null>(null);
    const [empty, setEmpty] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        projectApi.getProjects().then(res => {
            setProjects(res.data);
        });
    }, [open]);

    useEffect(() => {
        if (!open) {
            setResult(null);
            setEmpty(false);
        }
    }, [open]);

    const handleDraw = async () => {
        setLoading(true);
        setResult(null);
        setEmpty(false);

        try {
            const response = await collectionApi.getRandomMiniature(
                source,
                source === 'project' ? selectedProjectId : undefined,
            );

            if (response.status === 204) {
                setEmpty(true);
            } else {
                setResult(response.data);
            }
        } catch {
            setEmpty(true);
        } finally {
            setLoading(false);
        }
    };

    const canDraw = source !== 'project' || selectedProjectId !== '';

    const statusColor = (status: string) => {
        switch (status) {
            case 'Built': return 'text-terminal-built';
            case 'Gray': return 'text-terminal-gray';
            default: return 'text-terminal-fgDim';
        }
    };

    const sourceOptions: { value: Source; label: string }[] = [
        { value: 'collection', label: 'FULL COLLECTION' },
        { value: 'all_projects', label: 'ALL PROJECTS' },
        { value: 'project', label: 'SINGLE PROJECT' },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-[10px] text-terminal-fg-dim/50 hover:text-terminal-fg-dim transition-colors uppercase tracking-widest flex items-center gap-1">
                    <Dices size={12} />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Random Miniature</DialogTitle>
                    <DialogDescription>
                        Draw a random unpainted miniature to work on next.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Source selector */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                            DRAW FROM:
                        </label>
                        <div className="flex gap-1">
                            {sourceOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        setSource(opt.value);
                                        setResult(null);
                                        setEmpty(false);
                                    }}
                                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-all ${
                                        source === opt.value
                                            ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                                            : 'border-terminal-border text-terminal-fgDim hover:border-terminal-fg hover:text-terminal-fg'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Project picker */}
                    {source === 'project' && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                                PROJECT:
                            </label>
                            <select
                                value={selectedProjectId}
                                onChange={e => {
                                    setSelectedProjectId(e.target.value);
                                    setResult(null);
                                    setEmpty(false);
                                }}
                                className="w-full bg-terminal-bg border border-terminal-border text-terminal-fg px-3 py-2 uppercase tracking-wider text-sm focus:outline-none focus:border-amber-500"
                            >
                                <option value="">SELECT PROJECT...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Draw button */}
                    <button
                        onClick={handleDraw}
                        disabled={!canDraw || loading}
                        className="w-full py-3 px-4 border-l-4 border-terminal-border bg-terminal-bg text-terminal-fg font-bold uppercase tracking-widest hover:border-amber-500 hover:bg-terminal-bgLight transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-terminal-border disabled:hover:bg-terminal-bg"
                    >
                        {loading ? 'ROLLING...' : result ? 'REROLL' : 'DRAW'}
                    </button>

                    {/* Result */}
                    {result && (
                        <div className="border border-amber-500 bg-amber-500/5 p-4">
                            <div className="text-xs text-amber-500 uppercase tracking-widest font-semibold mb-2">
                                THE EMPEROR HAS CHOSEN:
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-semibold uppercase tracking-wider text-terminal-fg">
                                    {result.name}
                                </span>
                                <span className="text-xs text-terminal-fgDim uppercase tracking-wider">
                                    x{result.count}
                                </span>
                                <span className={`text-xs uppercase tracking-wider ${statusColor(result.status)}`}>
                                    {result.status}
                                </span>
                            </div>
                        </div>
                    )}

                    {empty && (
                        <div className="border border-terminal-border p-4 text-center">
                            <span className="text-terminal-fgDim text-sm uppercase tracking-widest">
                                No unpainted miniatures found
                            </span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
