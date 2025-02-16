import { Miniature } from './miniature';

export interface Folder {
    id: string;
    name: string;
    folders: Folder[];
    miniatures: Miniature[];
} 