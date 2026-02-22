import { useRef, useEffect, useState } from 'react';
import { generateBattleMap } from './canvasGeneration';
import type { Miniature } from '@/types/miniature';
import skullUrl from '@/assets/icons/skull.svg';
import aquilaUrl from '@/assets/icons/aquila.svg';

interface BattleMapV2Props {
    seed: string;
    miniatures: Miniature[];
    className?: string;
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

export function BattleMapV2({ seed, miniatures, className = '' }: BattleMapV2Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [icons, setIcons] = useState<{ skull: HTMLImageElement; aquila: HTMLImageElement } | null>(null);

    useEffect(() => {
        Promise.all([loadImage(skullUrl), loadImage(aquilaUrl)]).then(([skull, aquila]) =>
            setIcons({ skull, aquila }),
        );
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !icons) return;

        const zoneCount = miniatures.length;
        const paintedZones = miniatures.map(m => m.status === 'Painted');

        generateBattleMap(canvas, {
            seed,
            zoneCount,
            paintedZones,
            unpaintedIcon: icons.skull,
            paintedIcon: icons.aquila,
        });
    }, [seed, miniatures, icons]);

    return (
        <div className={className}>
            <div className="relative border border-terminal-border overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="block w-full h-auto"
                />
            </div>
        </div>
    );
}
