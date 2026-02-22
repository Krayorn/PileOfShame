const MAP_WIDTH = 700;
const MAP_HEIGHT = 350;

interface VoidZoneInfo {
    maxPoints: number;
    isEdge: boolean;
}

interface MapSettings {
    zoneCount: number;
    voidZoneCount: number;
    voidZoneInfos: VoidZoneInfo[];
    totalPoints: number;
    padding: number;
}

type RGB = [number, number, number];

const VOID_ZONE_COLOR: RGB = [0, 0, 0];

const UNPAINTED_ZONE_COLOR: RGB = [180, 60, 60];
const PAINTED_ZONE_COLOR: RGB = [60, 160, 90];

const UNPAINTED_BORDER_COLOR: RGB = [220, 80, 80];
const PAINTED_BORDER_COLOR: RGB = [50, 255, 100];

interface Point {
    x: number;
    y: number;
}

interface ZonePoint extends Point {
    zone: number;
}

export interface BattleMapOptions {
    seed: string;
    zoneCount: number;
    paintedZones: boolean[];
    unpaintedIcon?: HTMLImageElement;
    paintedIcon?: HTMLImageElement;
}

// --- Seeded random number generator ---

function hashString(str: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(seed: string): () => number {
    let hash = hashString(seed);
    return () => {
        let t = (hash += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// --- Map generation steps ---

function generateZones(
    rng: () => number,
    w: number,
    h: number,
    s: MapSettings,
    paintedZones: boolean[],
): { centers: Point[]; colors: RGB[]; voidZoneIndices: number[] } {
    const centers: Point[] = [];
    const colors: RGB[] = [];
    const voidZoneIndices: number[] = [];

    for (let i = 0; i < s.zoneCount; i++) {
        centers.push({
            x: s.padding + rng() * (w - 2 * s.padding),
            y: s.padding + rng() * (h - 2 * s.padding),
        });
        colors.push([...(paintedZones[i] ? PAINTED_ZONE_COLOR : UNPAINTED_ZONE_COLOR)]);
    }

    for (let i = 0; i < s.voidZoneCount; i++) {
        const voidInfo = s.voidZoneInfos[i];
        let x: number, y: number;

        if (voidInfo.isEdge) {
            const edgeBand = s.padding * 1.5;
            const edge = Math.floor(rng() * 4);
            if (edge === 0) {
                x = s.padding + rng() * (w - 2 * s.padding);
                y = s.padding + rng() * edgeBand;
            } else if (edge === 1) {
                x = w - s.padding - rng() * edgeBand;
                y = s.padding + rng() * (h - 2 * s.padding);
            } else if (edge === 2) {
                x = s.padding + rng() * (w - 2 * s.padding);
                y = h - s.padding - rng() * edgeBand;
            } else {
                x = s.padding + rng() * edgeBand;
                y = s.padding + rng() * (h - 2 * s.padding);
            }
        } else {
            const centerMargin = s.padding * 2;
            x = centerMargin + rng() * (w - 2 * centerMargin);
            y = centerMargin + rng() * (h - 2 * centerMargin);
        }

        centers.push({ x, y });
        colors.push([...VOID_ZONE_COLOR]);
        voidZoneIndices.push(centers.length - 1);
    }

    return { centers, colors, voidZoneIndices };
}

function isVoidZone(zoneIndex: number, zoneCount: number): boolean {
    return zoneIndex >= zoneCount;
}

function assignPointsToZones(
    rng: () => number,
    w: number,
    h: number,
    centers: Point[],
    s: MapSettings,
    voidZoneIndices: number[],
): ZonePoint[] {
    const totalZoneCount = s.zoneCount + s.voidZoneCount;
    const points: ZonePoint[] = [];
    const voidPointCount = new Array(totalZoneCount).fill(0);

    const voidMaxPoints = new Map<number, number>();
    for (let i = 0; i < voidZoneIndices.length; i++) {
        voidMaxPoints.set(voidZoneIndices[i], s.voidZoneInfos[i].maxPoints);
    }

    for (let p = 0; p < s.totalPoints; p++) {
        const x = rng() * w;
        const y = rng() * h;

        const byDist = centers
            .map((c, z) => ({ z, d: (x - c.x) ** 2 + (y - c.y) ** 2 }))
            .sort((a, b) => a.d - b.d);

        let bestZone = 0;
        for (const { z } of byDist) {
            if (!isVoidZone(z, s.zoneCount)) {
                bestZone = z;
                break;
            }
            const maxPoints = voidMaxPoints.get(z) ?? 0;
            if (voidPointCount[z] < maxPoints) {
                bestZone = z;
                break;
            }
        }

        if (isVoidZone(bestZone, s.zoneCount)) {
            voidPointCount[bestZone]++;
        }
        points.push({ x, y, zone: bestZone });
    }

    return points;
}

function floodFillZones(w: number, h: number, points: ZonePoint[]): Int16Array {
    const owner = new Int16Array(w * h).fill(-1);
    const queue: Array<{ x: number; y: number; zone: number }> = [];

    for (const { x, y, zone } of points) {
        const cx = Math.max(0, Math.min(w - 1, Math.floor(x)));
        const cy = Math.max(0, Math.min(h - 1, Math.floor(y)));
        owner[cy * w + cx] = zone;
        queue.push({ x: cx, y: cy, zone });
    }

    while (queue.length > 0) {
        const { x, y, zone } = queue.shift()!;
        for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const ni = ny * w + nx;
            if (owner[ni] === -1) {
                owner[ni] = zone;
                queue.push({ x: nx, y: ny, zone });
            }
        }
    }

    return owner;
}

function detectBoundaries(w: number, h: number, owner: Int16Array): Uint8Array {
    const isBoundary = new Uint8Array(w * h);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const zone = owner[i];
            const left = x > 0 ? owner[i - 1] : zone;
            const right = x < w - 1 ? owner[i + 1] : zone;
            const top = y > 0 ? owner[i - w] : zone;
            const bottom = y < h - 1 ? owner[i + w] : zone;

            if (left !== zone || right !== zone || top !== zone || bottom !== zone) {
                isBoundary[i] = 1;
            }
        }
    }

    return isBoundary;
}

function detectAdjacentToBoundaries(w: number, h: number, isBoundary: Uint8Array): Uint8Array {
    const isAdjacent = new Uint8Array(w * h);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = y * w + x;
            if (isBoundary[i]) continue;

            const leftBoundary = x > 0 && isBoundary[i - 1];
            const rightBoundary = x < w - 1 && isBoundary[i + 1];
            const topBoundary = y > 0 && isBoundary[i - w];
            const bottomBoundary = y < h - 1 && isBoundary[i + w];

            if (leftBoundary || rightBoundary || topBoundary || bottomBoundary) {
                isAdjacent[i] = 1;
            }
        }
    }

    return isAdjacent;
}

function renderPixels(
    w: number,
    h: number,
    owner: Int16Array,
    isBoundary: Uint8Array,
    isAdjacent: Uint8Array,
    colors: RGB[],
    zoneCount: number,
    paintedZones: boolean[],
): ImageData {
    const img = new ImageData(w, h);
    const data = img.data;

    for (let i = 0; i < owner.length; i++) {
        const zone = owner[i];
        const isVoid = isVoidZone(zone, zoneCount);
        let r: number, g: number, b: number;

        if (isBoundary[i]) {
            [r, g, b] = [0, 0, 0];
        } else if (isAdjacent[i] && !isVoid) {
            [r, g, b] = paintedZones[zone] ? PAINTED_BORDER_COLOR : UNPAINTED_BORDER_COLOR;
        } else {
            [r, g, b] = colors[zone];
        }

        const di = i * 4;
        data[di] = r;
        data[di + 1] = g;
        data[di + 2] = b;
        data[di + 3] = 255;
    }

    return img;
}

function computeZoneCentroids(
    w: number,
    h: number,
    owner: Int16Array,
    zoneCount: number,
): Point[] {
    const sumX = new Float64Array(zoneCount);
    const sumY = new Float64Array(zoneCount);
    const count = new Uint32Array(zoneCount);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const zone = owner[y * w + x];
            if (zone >= 0 && zone < zoneCount) {
                sumX[zone] += x;
                sumY[zone] += y;
                count[zone]++;
            }
        }
    }

    const centroids: Point[] = [];
    for (let i = 0; i < zoneCount; i++) {
        if (count[i] > 0) {
            centroids.push({ x: sumX[i] / count[i], y: sumY[i] / count[i] });
        }
    }

    return centroids;
}

function drawZoneIcons(
    ctx: CanvasRenderingContext2D,
    centroids: Point[],
    paintedZones: boolean[],
    unpaintedIcon: HTMLImageElement,
    paintedIcon: HTMLImageElement,
    size: number,
): void {
    for (let i = 0; i < centroids.length; i++) {
        const c = centroids[i];
        const icon = paintedZones[i] ? paintedIcon : unpaintedIcon;
        ctx.drawImage(icon, c.x - size / 2, c.y - size / 2, size, size);
    }
}

// --- Public API ---

export { MAP_WIDTH, MAP_HEIGHT };

export function generateBattleMap(canvas: HTMLCanvasElement, options: BattleMapOptions): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = MAP_WIDTH;
    canvas.height = MAP_HEIGHT;

    const { seed, zoneCount, paintedZones, unpaintedIcon, paintedIcon } = options;
    const rng = mulberry32(seed);

    const voidZoneCount = 2 + Math.floor(rng() * 3);

    const edgeVoidCount = Math.floor(voidZoneCount / 2);
    const interiorVoidCount = voidZoneCount - edgeVoidCount;

    const voidZoneInfos: VoidZoneInfo[] = [];
    for (let i = 0; i < edgeVoidCount; i++) {
        voidZoneInfos.push({ maxPoints: 12, isEdge: true });
    }
    for (let i = 0; i < interiorVoidCount; i++) {
        voidZoneInfos.push({ maxPoints: 6, isEdge: false });
    }

    for (let i = voidZoneInfos.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [voidZoneInfos[i], voidZoneInfos[j]] = [voidZoneInfos[j], voidZoneInfos[i]];
    }

    const settings: MapSettings = {
        zoneCount,
        voidZoneCount,
        voidZoneInfos,
        totalPoints: 140,
        padding: 30,
    };

    const { centers, colors, voidZoneIndices } = generateZones(rng, MAP_WIDTH, MAP_HEIGHT, settings, paintedZones);
    const points = assignPointsToZones(rng, MAP_WIDTH, MAP_HEIGHT, centers, settings, voidZoneIndices);
    const owner = floodFillZones(MAP_WIDTH, MAP_HEIGHT, points);
    const isBoundary = detectBoundaries(MAP_WIDTH, MAP_HEIGHT, owner);
    const isAdjacent = detectAdjacentToBoundaries(MAP_WIDTH, MAP_HEIGHT, isBoundary);
    const imageData = renderPixels(MAP_WIDTH, MAP_HEIGHT, owner, isBoundary, isAdjacent, colors, settings.zoneCount, paintedZones);

    ctx.putImageData(imageData, 0, 0);

    if (unpaintedIcon && paintedIcon) {
        const centroids = computeZoneCentroids(MAP_WIDTH, MAP_HEIGHT, owner, settings.zoneCount);
        drawZoneIcons(ctx, centroids, paintedZones, unpaintedIcon, paintedIcon, 30);
    }
}
