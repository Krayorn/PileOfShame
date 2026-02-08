import type { Miniature } from './miniature';

export interface Project {
    id: string;
    name: string;
    targetDate: string | null;
    miniatures: Miniature[];
    createdAt: string;
}
