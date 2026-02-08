import { useState, useEffect } from 'react';
import type { Project } from '../types/project';
import { projectApi } from '../api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from './ui/dialog';

interface AddToProjectDialogProps {
    miniatureId: string;
}

export function AddToProjectDialog({ miniatureId }: AddToProjectDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [addedProjectId, setAddedProjectId] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchProjects = async () => {
            setLoading(true);
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
        setAddedProjectId(null);
    }, [isOpen]);

    const handleAddToProject = async (projectId: string) => {
        try {
            await projectApi.addMiniature(projectId, miniatureId);
            setAddedProjectId(projectId);
        } catch (err) {
            console.error('Failed to add to project:', err);
        }
    };

    const isMiniatureInProject = (project: Project) => {
        return project.miniatures.some(m => m.id === miniatureId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="text-amber-500 hover:text-amber-400 transition-colors font-semibold uppercase tracking-wider text-sm">
                    Project
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add to Project</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Select a project to assign this miniature to.
                </DialogDescription>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-terminal-fg border-t-transparent mx-auto"></div>
                            <p className="mt-2 text-terminal-fgDim uppercase tracking-wider text-sm">Loading...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <p className="text-terminal-fgDim uppercase tracking-wider text-sm py-4">
                            No projects yet. Create one from the Projects page.
                        </p>
                    ) : (
                        projects.map(project => {
                            const alreadyIn = isMiniatureInProject(project);
                            const justAdded = addedProjectId === project.id;

                            return (
                                <button
                                    key={project.id}
                                    onClick={() => !alreadyIn && !justAdded && handleAddToProject(project.id)}
                                    disabled={alreadyIn || justAdded}
                                    className={`w-full text-left px-3 py-2 border-l-2 transition-all ${
                                        justAdded
                                            ? 'border-terminal-fg bg-terminal-fg/5'
                                            : alreadyIn
                                              ? 'border-terminal-fgDim opacity-50 cursor-not-allowed'
                                              : 'border-transparent hover:bg-terminal-bgLight hover:border-amber-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold uppercase tracking-wider text-terminal-fg">
                                                {project.name}
                                            </div>
                                            {project.targetDate && (
                                                <div className="text-xs text-amber-400 mt-0.5">
                                                    <span className="text-terminal-fgDim">TARGET:</span>{' '}
                                                    {new Date(project.targetDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs uppercase tracking-wider">
                                            {justAdded ? (
                                                <span className="text-terminal-fg">ADDED</span>
                                            ) : alreadyIn ? (
                                                <span className="text-terminal-fgDim">ASSIGNED</span>
                                            ) : null}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
