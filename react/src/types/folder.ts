import { Miniature } from './miniature';

export interface Folder {
    id: string;
    name: string;
    sortOrder: number;
    folders: Folder[];
    miniatures: Miniature[];
    parent: {
        id: string|null;
        name: string|null;
    };
} 