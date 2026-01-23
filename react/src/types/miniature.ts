export type MiniatureStatus = 'Painted' | 'Built' | 'Gray';

export interface Picture {
    id: string;
    path: string;
    uploadedAt: string; // ISO date string
    rotation: number;
}

export interface PictureWithMiniature extends Picture {
    miniatureName: string;
}

export interface Miniature {
    id: string;
    name: string;
    count: number;
    status: MiniatureStatus;
    pictures: Picture[];
} 