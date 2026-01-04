import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
    /**
     * Speed of typing in milliseconds per character
     * @default 50
     */
    speed?: number;
    /**
     * Delay before starting to type (in milliseconds)
     * @default 0
     */
    delay?: number;
    /**
     * Whether to restart the animation when text changes
     * @default true
     */
    restartOnChange?: boolean;
}

/**
 * Custom hook that creates a typewriter effect for text
 * @param text - The text to type out
 * @param options - Configuration options
 * @returns The current displayed text
 */
export function useTypewriter(
    text: string,
    options: UseTypewriterOptions = {}
): string {
    const {
        speed = 50,
        delay = 0,
        restartOnChange = true
    } = options;

    const [displayedText, setDisplayedText] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentTextRef = useRef(text);

    useEffect(() => {
        // Clear any existing timers immediately when text changes
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Reset displayed text immediately when text changes
        if (restartOnChange && currentTextRef.current !== text) {
            setDisplayedText('');
        }

        currentTextRef.current = text;

        if (!text) {
            setDisplayedText('');
            return;
        }

        // Start typing after delay
        timeoutRef.current = setTimeout(() => {
            let currentIndex = 0;

            intervalRef.current = setInterval(() => {
                // Check if text has changed during typing
                if (currentTextRef.current !== text) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    return;
                }

                if (currentIndex < text.length) {
                    setDisplayedText(text.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
            }, speed);
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
    }, [text, speed, delay, restartOnChange]);

    return displayedText;
}

