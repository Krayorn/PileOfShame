export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash + char) | 0;
    }
    return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
    let s = seed | 0;
    return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function createSeededRandom(seed: string) {
    const rng = mulberry32(hashString(seed));

    return {
        next: () => rng(),
        range: (min: number, max: number) => min + rng() * (max - min),
        int: (min: number, max: number) => Math.floor(min + rng() * (max - min)),
        pick: <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)],
    };
}
