export type MiniatureStatus = 'painted' | 'built' | 'gray';

export interface Miniature {
    id: string;
    name: string;
    count: number;
    status: MiniatureStatus;
} 