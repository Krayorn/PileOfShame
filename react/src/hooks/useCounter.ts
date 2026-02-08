import { useState, useEffect, useRef } from 'react';

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
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentTargetRef = useRef(target);
    const startTimeRef = useRef<number | null>(null);
    const countRef = useRef(count);
    countRef.current = count;

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (restartOnChange) {
            setCount(0);
            countRef.current = 0;
        }

        currentTargetRef.current = target;

        if (typeof target !== 'number' || isNaN(target)) {
            setCount(0);
            return;
        }

        const targetValue = Math.max(0, Math.floor(target));

        if (targetValue === 0) {
            setCount(0);
            return;
        }

        const startValue = restartOnChange ? 0 : countRef.current;
        timeoutRef.current = setTimeout(() => {
            const difference = targetValue - startValue;
            startTimeRef.current = Date.now();

            intervalRef.current = setInterval(() => {
                if (currentTargetRef.current !== target) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    return;
                }

                if (!startTimeRef.current) {
                    startTimeRef.current = Date.now();
                }

                const elapsed = Date.now() - startTimeRef.current;
                const progress = Math.min(elapsed / duration, 1);

                const currentValue = Math.floor(startValue + (difference * progress));

                if (currentValue >= targetValue) {
                    setCount(targetValue);
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                } else {
                    setCount(currentValue);
                }
            }, 16);
        }, delay);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [target, duration, delay, restartOnChange]);

    return count;
}

