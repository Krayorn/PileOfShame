import type { TerrainData } from './terrainGenerator';

export interface Frontline {
    percent: number;
    color: string;
    label: string;
}

interface RenderOptions {
    width: number;
    height: number;
    terrain: TerrainData;
    seed: string;
}

export function renderBattleMap(ctx: CanvasRenderingContext2D, options: RenderOptions) {
    const { width, height, terrain } = options;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#040804';
    ctx.fillRect(0, 0, width, height);

    // Fill zone cells
    for (let i = 0; i < terrain.cells.length; i++) {
        const cell = terrain.cells[i];
        const zone = terrain.zones[i];
        if (cell.length < 3) continue;

        ctx.beginPath();
        ctx.moveTo(cell[0].x, cell[0].y);
        for (let j = 1; j < cell.length; j++) {
            ctx.lineTo(cell[j].x, cell[j].y);
        }
        ctx.closePath();

        if (zone.isVoid) {
            ctx.fillStyle = '#040804';
        } else {
            const r = Math.floor(zone.shade * 18);
            const g = Math.floor(zone.shade * 75 + 35);
            const b = Math.floor(zone.shade * 12);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
        }
        ctx.fill();
    }

    // Draw edges as neon lines
    ctx.save();
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 6;

    for (const edge of terrain.edges) {
        if (edge.points.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(edge.points[0].x, edge.points[0].y);
        for (let i = 1; i < edge.points.length; i++) {
            ctx.lineTo(edge.points[i].x, edge.points[i].y);
        }
        ctx.stroke();
    }

    ctx.restore();
}
