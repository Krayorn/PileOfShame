import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Project } from '../types/project';
import { projectApi, collectionApi } from '../api';
import type { Miniature } from '../types/miniature';
import { TerminalPanel } from '../components/ui/terminal-panel';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Skull } from 'lucide-react';

function getProjectProgress(project: Project) {
    const total = project.miniatures.reduce((sum, m) => sum + m.count, 0);
    const painted = project.miniatures
        .filter(m => m.status === 'Painted')
        .reduce((sum, m) => sum + m.count, 0);
    const percent = total === 0 ? 0 : Math.round((painted / total) * 100);
    return { total, painted, percent };
}

function skullColor(percent: number) {
    if (percent >= 75) return 'text-green-500';
    if (percent >= 50) return 'text-amber-500';
    if (percent >= 25) return 'text-orange-500';
    return 'text-red-500';
}

function shortId(id: string) {
    return id.substring(0, 6).toUpperCase();
}

export function Projects() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectTargetDate, setNewProjectTargetDate] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Miniature[]>([]);
    const [searching, setSearching] = useState(false);

    const selectedProjectId = searchParams.get('projectId');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await projectApi.getProjects();
                setProjects(response.data);
            } catch (err) {
                console.error('Failed to fetch projects:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        if (!selectedProjectId) {
            setSelectedProject(null);
            return;
        }

        const fetchProject = async () => {
            try {
                const response = await projectApi.getProject(selectedProjectId);
                setSelectedProject(response.data);
            } catch (err) {
                console.error('Failed to fetch project:', err);
                setSelectedProject(null);
            }
        };

        fetchProject();
    }, [selectedProjectId]);

    const handleSelectProject = (projectId: string) => {
        setSearchParams({ projectId });
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        try {
            const data: { name: string; targetDate?: string } = { name: newProjectName.trim() };
            if (newProjectTargetDate) {
                data.targetDate = newProjectTargetDate;
            }
            const response = await projectApi.createProject(data);
            setProjects(prev => [...prev, response.data]);
            setSearchParams({ projectId: response.data.id });
            setNewProjectName('');
            setNewProjectTargetDate('');
            setCreateDialogOpen(false);
        } catch (err) {
            console.error('Failed to create project:', err);
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;

        try {
            await projectApi.deleteProject(selectedProject.id);
            setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
            setSelectedProject(null);
            setSearchParams({});
        } catch (err) {
            console.error('Failed to delete project:', err);
        }
    };

    const handleRemoveMiniature = async (miniatureId: string) => {
        if (!selectedProject) return;

        try {
            await projectApi.removeMiniature(selectedProject.id, miniatureId);
            const updated = {
                ...selectedProject,
                miniatures: selectedProject.miniatures.filter(m => m.id !== miniatureId)
            };
            setSelectedProject(updated);
            setProjects(prev => prev.map(p =>
                p.id === selectedProject.id ? updated : p
            ));
        } catch (err) {
            console.error('Failed to remove miniature:', err);
        }
    };

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await collectionApi.searchMiniatures(searchQuery);
                setSearchResults(response.data);
            } catch (err) {
                console.error('Failed to search miniatures:', err);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleAddMiniatureFromSearch = async (miniature: Miniature) => {
        if (!selectedProject) return;

        try {
            await projectApi.addMiniature(selectedProject.id, miniature.id);
            const updated = {
                ...selectedProject,
                miniatures: [...selectedProject.miniatures, miniature]
            };
            setSelectedProject(updated);
            setProjects(prev => prev.map(p =>
                p.id === selectedProject.id ? updated : p
            ));
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            console.error('Failed to add miniature:', err);
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'Painted': return 'text-terminal-painted';
            case 'Built': return 'text-terminal-built';
            case 'Gray': return 'text-terminal-gray';
            default: return 'text-terminal-fgDim';
        }
    };

    const detailProgress = selectedProject ? getProjectProgress(selectedProject) : null;

    return (
        <div className="flex gap-6">
            {/* Left Panel - Project List */}
            <div className="w-72 shrink-0 flex flex-col gap-2">
                <div className="flex justify-end mb-1">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <button className="text-xs text-amber-500 hover:text-amber-400 uppercase tracking-wider font-semibold transition-colors">
                                [+ NEW PROJECT]
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New Project</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                Create a new painting project to track your progress.
                            </DialogDescription>
                            <form onSubmit={handleCreateProject} className="space-y-3">
                                <div>
                                    <label className="text-xs text-terminal-fgDim uppercase tracking-wider font-semibold">
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="PROJECT NAME"
                                        value={newProjectName}
                                        onChange={e => setNewProjectName(e.target.value)}
                                        className="bg-terminal-bg border border-terminal-border text-terminal-fg px-3 py-2 uppercase tracking-wider text-sm w-full focus:outline-none focus:border-terminal-accent mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-terminal-fgDim uppercase tracking-wider font-semibold">
                                        Target Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newProjectTargetDate}
                                        onChange={e => setNewProjectTargetDate(e.target.value)}
                                        className="bg-terminal-bg border border-terminal-border text-terminal-fg px-3 py-2 uppercase tracking-wider text-sm w-full focus:outline-none focus:border-terminal-accent mt-1"
                                    />
                                </div>
                                <Button type="submit" variant="outline" className="w-full border-amber-500 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400">
                                    Initialize Project
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-terminal-fg border-t-transparent mx-auto"></div>
                        <p className="mt-2 text-terminal-fgDim uppercase tracking-wider text-sm">Loading...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="border border-terminal-border p-4">
                        <p className="text-terminal-fgDim uppercase tracking-wider text-sm text-center">No active projects</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {projects.map(project => {
                            const { percent, painted, total } = getProjectProgress(project);
                            const isSelected = selectedProjectId === project.id;

                            return (
                                <button
                                    key={project.id}
                                    onClick={() => handleSelectProject(project.id)}
                                    className={`w-full text-left px-3 py-2.5 transition-all border ${
                                        isSelected
                                            ? 'border-amber-500 bg-amber-500/5'
                                            : 'border-terminal-border hover:border-terminal-fg hover:bg-terminal-bgLight'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-mono shrink-0 ${isSelected ? 'text-amber-500' : 'text-terminal-fgDim'}`}>
                                                    #{shortId(project.id)}
                                                </span>
                                                {project.targetDate && (
                                                    <span className="text-xs text-amber-400/70 font-mono">
                                                        {new Date(project.targetDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-sm font-semibold uppercase tracking-wider text-terminal-fg mt-1">
                                                {project.name}
                                            </div>

                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className="flex-1 h-1.5 bg-terminal-bg border border-terminal-border overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-500"
                                                        style={{
                                                            width: `${percent}%`,
                                                            backgroundColor: percent === 100 ? 'var(--foreground)' : 'var(--chart-3)',
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono text-terminal-fgDim whitespace-nowrap">
                                                    {painted}/{total}
                                                </span>
                                            </div>
                                        </div>

                                        <Skull className={`size-5 shrink-0 mt-0.5 ${skullColor(percent)}`} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right Panel - Project Detail */}
            <div className="flex-1 min-w-0">
                {!selectedProject ? (
                    <div className="flex items-center justify-center h-64 border border-terminal-border">
                        <p className="text-terminal-fgDim uppercase tracking-wider text-sm">
                            Select a project to view details
                        </p>
                    </div>
                ) : (
                    <TerminalPanel>
                        <div className="p-5">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-amber-500">#{shortId(selectedProject.id)}</span>
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-terminal-fg">
                                            {selectedProject.name}
                                        </h2>
                                    </div>
                                    {selectedProject.targetDate && (
                                        <p className="text-xs text-amber-400 mt-1 font-mono">
                                            DEADLINE: {new Date(selectedProject.targetDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleDeleteProject}
                                    className="text-xs text-terminal-destructive uppercase tracking-wider hover:text-terminal-fg transition-colors font-semibold"
                                >
                                    [DELETE]
                                </button>
                            </div>

                            {/* Progress Bar */}
                            {detailProgress && detailProgress.total > 0 && (
                                <div className="mb-5">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-terminal-fgDim uppercase tracking-wider font-semibold">
                                            Progress
                                        </span>
                                        <span className="text-xs font-mono text-terminal-fgDim">
                                            {detailProgress.painted}/{detailProgress.total} PAINTED — {detailProgress.percent}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-terminal-bg border border-terminal-border overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-500"
                                            style={{
                                                width: `${detailProgress.percent}%`,
                                                backgroundColor: detailProgress.percent === 100 ? 'var(--foreground)' : 'var(--chart-3)',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-terminal-border mb-4" />

                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="SEARCH UNITS TO ADD..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="bg-terminal-bg border border-terminal-border text-terminal-fg px-3 py-2 uppercase tracking-wider text-sm w-full focus:outline-none focus:border-amber-500"
                                    />
                                    {searching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-terminal-fg border-t-transparent"></div>
                                        </div>
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="mt-1 border border-terminal-border max-h-48 overflow-y-auto">
                                        {searchResults.map(miniature => {
                                            const alreadyAdded = selectedProject?.miniatures.some(m => m.id === miniature.id);
                                            return (
                                                <button
                                                    key={miniature.id}
                                                    onClick={() => !alreadyAdded && handleAddMiniatureFromSearch(miniature)}
                                                    disabled={alreadyAdded}
                                                    className={`w-full text-left px-3 py-2 flex items-center justify-between border-b border-terminal-border last:border-b-0 transition-all ${
                                                        alreadyAdded
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : 'hover:bg-terminal-bgLight'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-semibold uppercase tracking-wider text-terminal-fg">
                                                            {miniature.name}
                                                        </span>
                                                        <span className="text-xs text-terminal-fgDim uppercase tracking-wider">
                                                            x{miniature.count}
                                                        </span>
                                                        <span className={`text-xs uppercase tracking-wider ${statusColor(miniature.status)}`}>
                                                            {miniature.status}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs uppercase tracking-wider">
                                                        {alreadyAdded ? (
                                                            <span className="text-terminal-fgDim">ASSIGNED</span>
                                                        ) : (
                                                            <span className="text-amber-500">[ADD]</span>
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-terminal-border mb-4" />

                            {/* Unit List */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-terminal-fg">
                                    Assigned Units
                                </h3>
                                {selectedProject.miniatures.length > 0 && (
                                    <span className="text-xs font-mono text-terminal-fgDim">
                                        {selectedProject.miniatures.length} {selectedProject.miniatures.length === 1 ? 'ENTRY' : 'ENTRIES'}
                                    </span>
                                )}
                            </div>

                            {selectedProject.miniatures.length === 0 ? (
                                <p className="text-terminal-fgDim uppercase tracking-wider text-sm py-4 text-center">
                                    No units assigned — use search above to add
                                </p>
                            ) : (
                                <div>
                                    {selectedProject.miniatures.map(miniature => (
                                        <div
                                            key={miniature.id}
                                            className="flex items-center justify-between px-3 py-2 border-b border-terminal-border last:border-b-0"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-semibold uppercase tracking-wider text-terminal-fg">
                                                    {miniature.name}
                                                </span>
                                                <span className="text-xs text-terminal-fgDim uppercase tracking-wider">
                                                    x{miniature.count}
                                                </span>
                                                <span className={`text-xs uppercase tracking-wider ${statusColor(miniature.status)}`}>
                                                    {miniature.status}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMiniature(miniature.id)}
                                                className="text-xs text-terminal-destructive uppercase tracking-wider hover:text-terminal-fg transition-colors"
                                            >
                                                [REMOVE]
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TerminalPanel>
                )}
            </div>
        </div>
    );
}
