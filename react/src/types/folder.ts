import { Miniature } from './miniature';

export interface Folder {
    id: string;
    name: string;
    folders: Folder[];
    miniatures: Miniature[];
    parent: {
        id: string|null;
        name: string|null;
    };
} 