import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCounterOptions {
    /**
     * Duration of the animation in milliseconds
     * @default 1000
     */
    duration?: number;
    /**
     * Delay before starting the animation (in milliseconds)
     * @default 0
     */
    delay?: number;
    /**
     * Whether to restart the animation when target changes
     * @default true
     */
    restartOnChange?: boolean;
}

/**
 * Custom hook that animates a number from 0 to a target value
 * @param target - The target number to count to
 * @param options - Configuration options
 * @returns The current animated number
 */
export function useCounter(
    target: number,
    options: UseCounterOptions = {}
): number {
    const {
        duration = 1000,
        delay = 0,
        restartOnChange = true
    } = options;

    const [count, setCount] = useState(0);
    const animationRef = useRef<{ interval: NodeJS.Timeout | null; timeout: NodeJS.Timeout | null }>({
        interval: null,
        timeout: null,
    });

    const cleanup = useCallback(() => {
        if (animationRef.current.interval) {
            clearInterval(animationRef.current.interval);
            animationRef.current.interval = null;
        }
        if (animationRef.current.timeout) {
            clearTimeout(animationRef.current.timeout);
            animationRef.current.timeout = null;
        }
    }, []);

    useEffect(() => {
        cleanup();

        if (typeof target !== 'number' || isNaN(target)) {
            setCount(0);
            return;
        }

        const targetValue = Math.max(0, Math.floor(target));

        if (targetValue === 0) {
            setCount(0);
            return;
        }

        const startValue = restartOnChange ? 0 : undefined;
        if (restartOnChange) {
            setCount(0);
        }

        animationRef.current.timeout = setTimeout(() => {
            const startTime = Date.now();

            setCount((current) => {
                const resolvedStart = startValue ?? current;

                animationRef.current.interval = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const difference = targetValue - resolvedStart;
                    const currentValue = Math.floor(resolvedStart + (difference * progress));

                    if (currentValue >= targetValue) {
                        setCount(targetValue);
                        if (animationRef.current.interval) {
                            clearInterval(animationRef.current.interval);
                            animationRef.current.interval = null;
                        }
                    } else {
                        setCount(currentValue);
                    }
                }, 16);

                return resolvedStart;
            });
        }, delay);

        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, duration, delay, restartOnChange]);

    return count;
}
