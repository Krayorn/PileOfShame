import { createSeededRandom } from '@/lib/seededRandom';

export interface Point {
    x: number;
    y: number;
}

export interface ZoneSeed {
    x: number;
    y: number;
    shade: number;
    isVoid: boolean;
}

export interface TerrainEdge {
    points: Point[];
    zones: [number, number];
}

export interface TerrainData {
    zones: ZoneSeed[];
    edges: TerrainEdge[];
    cells: Point[][];
    width: number;
    height: number;
}

export interface TerrainOptions {
    zoneCount?: number;
    subdivisions?: number;
    displacement?: number;
}

export function generateTerrain(
    seed: string,
    width: number,
    height: number,
    options: TerrainOptions = {},
): TerrainData {
    const rng = createSeededRandom(seed);
    const zoneTarget = options.zoneCount ?? rng.int(9, 16);
    const subdivisions = options.subdivisions ?? 3;
    const displacement = options.displacement ?? 0.15;

    // Place zone seeds — some slightly outside canvas
    const zones: ZoneSeed[] = [];
    let attempts = 0;
    const minDist = width * Math.max(0.03, 0.8 / zoneTarget);

    while (zones.length < zoneTarget && attempts < 500) {
        attempts++;
        const x = rng.range(-width * 0.05, width * 1.05);
        const y = rng.range(-height * 0.05, height * 1.05);
        const tooClose = zones.some(z => Math.hypot(z.x - x, z.y - y) < minDist);
        if (tooClose) continue;
        zones.push({ x, y, shade: rng.range(0.3, 0.85), isVoid: false });
    }

    // Mark some zones as void
    const voidCount = rng.int(1, Math.min(4, Math.floor(zones.length * 0.25)));
    const voidCandidates = zones.map((_, i) => i).filter(i => {
        const z = zones[i];
        return z.x > 0 && z.x < width && z.y > 0 && z.y < height;
    });
    for (let i = 0; i < voidCount && voidCandidates.length > 0; i++) {
        const pick = rng.int(0, voidCandidates.length);
        zones[voidCandidates[pick]].isVoid = true;
        voidCandidates.splice(pick, 1);
    }

    // Compute Voronoi
    const rawEdges = computeVoronoiEdges(zones, width, height);

    // Subdivide edges for irregularity
    const edges: TerrainEdge[] = rawEdges.map(e => ({
        points: subdivideEdge(rng, e.from, e.to, subdivisions, displacement),
        zones: e.zones,
    }));

    // Build zone polygons from subdivided edges
    const cells = buildCells(zones, edges, width, height);

    return { zones, edges, cells, width, height };
}

function subdivideEdge(
    rng: ReturnType<typeof createSeededRandom>,
    from: Point,
    to: Point,
    iterations: number,
    displacement: number,
): Point[] {
    let points = [from, to];

    for (let iter = 0; iter < iterations; iter++) {
        const next: Point[] = [points[0]];
        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i];
            const b = points[i + 1];
            const edgeLen = Math.hypot(b.x - a.x, b.y - a.y);
            if (edgeLen < 3) {
                next.push(b);
                continue;
            }
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const px = -(b.y - a.y) / edgeLen;
            const py = (b.x - a.x) / edgeLen;
            const offset = edgeLen * displacement * (rng.next() * 2 - 1);
            next.push({ x: mx + px * offset, y: my + py * offset });
            next.push(b);
        }
        points = next;
    }

    return points;
}

// ---- Voronoi computation ----

interface RawEdge {
    from: Point;
    to: Point;
    zones: [number, number];
}

function computeVoronoiEdges(zones: ZoneSeed[], width: number, height: number): RawEdge[] {
    const n = zones.length;
    if (n < 2) return [];

    const edges: RawEdge[] = [];
    const vertices: { p: Point; seeds: number[] }[] = [];

    // Find Voronoi vertices via circumcenters
    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                const cc = circumcenter(zones[i], zones[j], zones[k]);
                if (!cc) continue;
                const pad = Math.max(width, height);
                if (cc.x < -pad || cc.x > width + pad || cc.y < -pad || cc.y > height + pad) continue;

                const dist = Math.hypot(cc.x - zones[i].x, cc.y - zones[i].y);
                let valid = true;
                for (let m = 0; m < n; m++) {
                    if (m === i || m === j || m === k) continue;
                    if (Math.hypot(cc.x - zones[m].x, cc.y - zones[m].y) < dist - 0.001) {
                        valid = false;
                        break;
                    }
                }
                if (valid) vertices.push({ p: cc, seeds: [i, j, k] });
            }
        }
    }

    // Connect vertices sharing exactly 2 seeds
    for (let a = 0; a < vertices.length; a++) {
        for (let b = a + 1; b < vertices.length; b++) {
            const shared = vertices[a].seeds.filter(s => vertices[b].seeds.includes(s));
            if (shared.length === 2) {
                edges.push({
                    from: vertices[a].p,
                    to: vertices[b].p,
                    zones: [shared[0], shared[1]],
                });
            }
        }
    }

    // Extend unpaired edges to a far boundary (well beyond canvas)
    for (const vertex of vertices) {
        const { seeds } = vertex;
        for (let si = 0; si < 3; si++) {
            const s1 = seeds[si];
            const s2 = seeds[(si + 1) % 3];
            const pairCount = vertices.filter(v => v.seeds.includes(s1) && v.seeds.includes(s2)).length;
            if (pairCount !== 1) continue;

            const mid = { x: (zones[s1].x + zones[s2].x) / 2, y: (zones[s1].y + zones[s2].y) / 2 };
            const dx = zones[s2].x - zones[s1].x;
            const dy = zones[s2].y - zones[s1].y;
            const len = Math.hypot(dx, dy);
            if (len === 0) continue;
            const nx = -dy / len;
            const ny = dx / len;

            const s3 = seeds.find(s => s !== s1 && s !== s2)!;
            const dot = (zones[s3].x - mid.x) * nx + (zones[s3].y - mid.y) * ny;
            const dirX = dot > 0 ? -nx : nx;
            const dirY = dot > 0 ? -ny : ny;

            const ext = Math.max(width, height) * 2;
            const target = { x: vertex.p.x + dirX * ext, y: vertex.p.y + dirY * ext };
            const clipped = clipToRect(vertex.p, target, width, height);
            if (clipped) {
                edges.push({ from: vertex.p, to: clipped, zones: [s1, s2] });
            }
        }
    }

    return edges;
}

// ---- Build zone cell polygons from edges ----

function buildCells(zones: ZoneSeed[], edges: TerrainEdge[], width: number, height: number): Point[][] {
    const cells: Point[][] = [];

    for (let zi = 0; zi < zones.length; zi++) {
        // Collect edge segments for this zone, oriented CCW
        const segments: Point[][] = [];

        for (const edge of edges) {
            if (edge.zones[0] !== zi && edge.zones[1] !== zi) continue;

            // Orient: zone zi should be on the left side of from->to
            const pts = [...edge.points];
            const mid = { x: (pts[0].x + pts[pts.length - 1].x) / 2, y: (pts[0].y + pts[pts.length - 1].y) / 2 };
            const dx = pts[pts.length - 1].x - pts[0].x;
            const dy = pts[pts.length - 1].y - pts[0].y;
            // Left normal
            const leftX = -dy;
            const leftY = dx;
            const toSeed = { x: zones[zi].x - mid.x, y: zones[zi].y - mid.y };
            if (leftX * toSeed.x + leftY * toSeed.y < 0) {
                pts.reverse();
            }

            segments.push(pts);
        }

        if (segments.length === 0) continue;

        // Order segments by connecting endpoints
        const polygon = orderSegments(segments, width, height);
        cells.push(polygon);
    }

    return cells;
}

function orderSegments(segments: Point[][], width: number, height: number): Point[] {
    if (segments.length === 0) return [];

    const used = new Array(segments.length).fill(false);
    const result: Point[] = [...segments[0]];
    used[0] = true;
    let usedCount = 1;

    const EPS = 2;

    while (usedCount < segments.length) {
        const last = result[result.length - 1];
        let bestIdx = -1;
        let bestDist = Infinity;

        for (let i = 0; i < segments.length; i++) {
            if (used[i]) continue;
            const d = Math.hypot(segments[i][0].x - last.x, segments[i][0].y - last.y);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }

        if (bestIdx < 0) break;

        // If there's a gap, walk along the canvas border
        if (bestDist > EPS) {
            const borderPts = walkBorder(last, segments[bestIdx][0], width, height);
            result.push(...borderPts);
        }

        // Add segment points (skip first if close to last)
        const seg = segments[bestIdx];
        const startIdx = Math.hypot(seg[0].x - result[result.length - 1].x, seg[0].y - result[result.length - 1].y) < EPS ? 1 : 0;
        for (let i = startIdx; i < seg.length; i++) {
            result.push(seg[i]);
        }
        used[bestIdx] = true;
        usedCount++;
    }

    // Close: walk border from last point back to first if needed
    const first = result[0];
    const last = result[result.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) > EPS) {
        const borderPts = walkBorder(last, first, width, height);
        result.push(...borderPts);
    }

    return result;
}

function walkBorder(from: Point, to: Point, width: number, height: number): Point[] {
    const snapFrom = snapToBorder(from, width, height);
    const snapTo = snapToBorder(to, width, height);
    const tFrom = borderParam(snapFrom, width, height);
    const tTo = borderParam(snapTo, width, height);

    const points: Point[] = [snapFrom];
    const corners = [
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height },
        { x: 0, y: 0 },
    ];
    const cornerParams = [1, 2, 3, 4];

    // Walk clockwise from tFrom to tTo
    const t = tFrom;
    const target = tTo <= tFrom ? tTo + 4 : tTo;

    for (let ci = 0; ci < 4; ci++) {
        let cp = cornerParams[ci];
        if (cp <= t) cp += 4;
        if (cp < target) {
            points.push({ ...corners[ci] });
        }
    }

    points.push(snapTo);
    return points;
}

function snapToBorder(p: Point, width: number, height: number): Point {
    // Find closest border point
    const candidates = [
        { x: p.x, y: 0, d: Math.abs(p.y) },
        { x: width, y: p.y, d: Math.abs(p.x - width) },
        { x: p.x, y: height, d: Math.abs(p.y - height) },
        { x: 0, y: p.y, d: Math.abs(p.x) },
    ];
    candidates.sort((a, b) => a.d - b.d);
    return { x: Math.max(0, Math.min(width, candidates[0].x)), y: Math.max(0, Math.min(height, candidates[0].y)) };
}

function borderParam(p: Point, width: number, height: number): number {
    // Parameter 0-4 going clockwise: top(0-1), right(1-2), bottom(2-3), left(3-4)
    if (Math.abs(p.y) < 1) return p.x / width;
    if (Math.abs(p.x - width) < 1) return 1 + p.y / height;
    if (Math.abs(p.y - height) < 1) return 2 + (width - p.x) / width;
    return 3 + (height - p.y) / height;
}

// ---- Geometry utils ----

function circumcenter(a: Point, b: Point, c: Point): Point | null {
    const D = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
    if (Math.abs(D) < 0.0001) return null;
    const asq = a.x * a.x + a.y * a.y;
    const bsq = b.x * b.x + b.y * b.y;
    const csq = c.x * c.x + c.y * c.y;
    return {
        x: (asq * (b.y - c.y) + bsq * (c.y - a.y) + csq * (a.y - b.y)) / D,
        y: (asq * (c.x - b.x) + bsq * (a.x - c.x) + csq * (b.x - a.x)) / D,
    };
}

function clipToRect(from: Point, to: Point, width: number, height: number): Point | null {
    let x0 = from.x, y0 = from.y, x1 = to.x, y1 = to.y;

    const clip = (x: number, y: number): number => {
        let code = 0;
        if (x < 0) code |= 1;
        else if (x > width) code |= 2;
        if (y < 0) code |= 4;
        else if (y > height) code |= 8;
        return code;
    };

    let c0 = clip(x0, y0);
    let c1 = clip(x1, y1);

    for (let i = 0; i < 10; i++) {
        if ((c0 | c1) === 0) return { x: x1, y: y1 };
        if ((c0 & c1) !== 0) return null;

        const code = c1 !== 0 ? c1 : c0;
        let x = 0, y = 0;
        const dx = x1 - x0, dy = y1 - y0;

        if (code & 8) { y = height; x = x0 + dx * (height - y0) / dy; }
        else if (code & 4) { y = 0; x = x0 + dx * (0 - y0) / dy; }
        else if (code & 2) { x = width; y = y0 + dy * (width - x0) / dx; }
        else if (code & 1) { x = 0; y = y0 + dy * (0 - x0) / dx; }

        if (code === c1) { x1 = x; y1 = y; c1 = clip(x1, y1); }
        else { x0 = x; y0 = y; c0 = clip(x0, y0); }
    }

    return { x: x1, y: y1 };
}
