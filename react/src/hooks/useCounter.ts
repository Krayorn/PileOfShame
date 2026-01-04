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

    useEffect(() => {
        // Clear any existing timers immediately when target changes
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Reset count immediately when target changes
        if (restartOnChange) {
            setCount(0);
        }

        currentTargetRef.current = target;

        if (typeof target !== 'number' || isNaN(target)) {
            setCount(0);
            return;
        }

        const targetValue = Math.max(0, Math.floor(target));

        // If target is 0, set immediately
        if (targetValue === 0) {
            setCount(0);
            return;
        }

        // Start animation after delay
        timeoutRef.current = setTimeout(() => {
            const startValue = restartOnChange ? 0 : count;
            const difference = targetValue - startValue;
            startTimeRef.current = Date.now();

            intervalRef.current = setInterval(() => {
                // Check if target has changed during animation
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

                // Linear interpolation
                const currentValue = Math.floor(startValue + (difference * progress));

                // Ensure we don't exceed the target
                if (currentValue >= targetValue) {
                    setCount(targetValue);
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                } else {
                    setCount(currentValue);
                }
            }, 16); // ~60fps
        }, delay);

        // Cleanup function
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

