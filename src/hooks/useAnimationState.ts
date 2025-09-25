"use client";

import { useEffect, useRef, useState } from "react";

interface UseAnimationStateOptions {
  delay?: number;
  duration?: number;
}

export function useAnimationState(options: UseAnimationStateOptions = {}) {
  const { delay = 0, duration = 800 } = options;
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isComplete) return;

    // Start animation after delay
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(true);

      // Mark as complete after animation duration
      setTimeout(() => {
        setIsComplete(true);
        setIsAnimating(false);
      }, duration);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, duration, isComplete]);

  const getAnimationClass = (baseClass: string) => {
    if (isComplete) {
      return `${baseClass} animation-complete`;
    }
    if (isAnimating) {
      return baseClass;
    }
    return baseClass;
  };

  return {
    isAnimating,
    isComplete,
    getAnimationClass,
    animationRef,
  };
}
