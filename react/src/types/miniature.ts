export type MiniatureStatus = 'Painted' | 'Built' | 'Gray';

export interface Miniature {
    id: string;
    name: string;
    count: number;
    status: MiniatureStatus;
} 