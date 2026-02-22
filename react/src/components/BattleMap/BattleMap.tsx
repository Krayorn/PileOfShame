import { useRef, useEffect, useMemo, useState } from 'react';
import { generateTerrain } from './terrainGenerator';
import { renderBattleMap } from './renderer';

interface BattleMapProps {
    seed: string;
    title?: string;
    className?: string;
    debug?: boolean;
}

const MAP_WIDTH = 700;
const MAP_HEIGHT = 350;

export function BattleMap({ seed: initialSeed, title, className = '', debug = false }: BattleMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [seedOverride, setSeedOverride] = useState('');
    const [zoneCount, setZoneCount] = useState(12);
    const [subdivisions, setSubdivisions] = useState(3);
    const [displacement, setDisplacement] = useState(15);

    const activeSeed = seedOverride || initialSeed;

    const terrain = useMemo(
        () => generateTerrain(activeSeed, MAP_WIDTH, MAP_HEIGHT, {
            zoneCount,
            subdivisions,
            displacement: displacement / 100,
        }),
        [activeSeed, zoneCount, subdivisions, displacement],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = MAP_WIDTH;
        canvas.height = MAP_HEIGHT;

        renderBattleMap(ctx, {
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            terrain,
            seed: activeSeed,
        });
    }, [terrain, activeSeed]);

    return (
        <div className={className}>
            <div className="relative border border-terminal-border overflow-hidden">
                {title && (
                    <div className="absolute top-0 left-0 right-0 z-10 flex justify-center">
                        <div className="bg-terminal-bg/80 border border-amber-500/50 px-4 py-1 mt-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                                {title}
                            </span>
                        </div>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
                    className="block w-full h-auto"
                />
            </div>

            {debug && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs text-terminal-fgDim uppercase tracking-wider block mb-1">
                            Seed
                        </label>
                        <input
                            type="text"
                            value={seedOverride}
                            onChange={e => setSeedOverride(e.target.value)}
                            placeholder={initialSeed.substring(0, 8)}
                            className="bg-terminal-bg border border-terminal-border text-terminal-fg px-2 py-1 text-xs w-full font-mono focus:outline-none focus:border-amber-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-terminal-fgDim uppercase tracking-wider block mb-1">
                            Areas: {zoneCount}
                        </label>
                        <input
                            type="range"
                            min={3}
                            max={30}
                            value={zoneCount}
                            onChange={e => setZoneCount(Number(e.target.value))}
                            className="w-full accent-[#00ff41]"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-terminal-fgDim uppercase tracking-wider block mb-1">
                            Subdivisions: {subdivisions}
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={5}
                            value={subdivisions}
                            onChange={e => setSubdivisions(Number(e.target.value))}
                            className="w-full accent-[#00ff41]"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-terminal-fgDim uppercase tracking-wider block mb-1">
                            Displacement: {displacement}%
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={40}
                            value={displacement}
                            onChange={e => setDisplacement(Number(e.target.value))}
                            className="w-full accent-[#00ff41]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
