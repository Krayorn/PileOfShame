import { useRef, useEffect, useState } from 'react';
import { generateBattleMap, MAP_WIDTH, MAP_HEIGHT } from './canvasGeneration';

interface BattleMapV2Props {
    seed: string;
    title?: string;
    className?: string;
}

export function BattleMapV2({ seed, title, className = '' }: BattleMapV2Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [seedOverride, setSeedOverride] = useState<string | null>(null);

    const activeSeed = seedOverride ?? seed;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        generateBattleMap(canvas, activeSeed);
    }, [activeSeed]);

    const randomizeSeed = () => {
        setSeedOverride(Math.random().toString(36).substring(2, 10));
    };

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
                <button
                    onClick={randomizeSeed}
                    className="absolute bottom-2 right-2 z-10 bg-terminal-bg/80 border border-amber-500/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-500 hover:bg-amber-500/20 cursor-pointer"
                >
                    🎲 Randomize
                </button>
            </div>
        </div>
    );
}
