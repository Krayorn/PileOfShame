export type MiniatureStatus = 'Painted' | 'Built' | 'Gray';

export interface Picture {
    id: string;
    path: string;
}

export interface Miniature {
    id: string;
    name: string;
    count: number;
    status: MiniatureStatus;
    pictures: Picture[];
} 