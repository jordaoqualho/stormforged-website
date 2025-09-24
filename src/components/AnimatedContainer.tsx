"use client";

import { useAnimationState } from "@/hooks/useAnimationState";
import { ReactNode } from "react";

interface AnimatedContainerProps {
  children: ReactNode;
  animationType: "fade-in" | "slide-up" | "initial-load";
  delay?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedContainer({
  children,
  animationType,
  delay = 0,
  duration = 800,
  className = "",
}: AnimatedContainerProps) {
  const { getAnimationClass } = useAnimationState({ delay, duration });

  return <div className={`${getAnimationClass(`animate-${animationType}`)} ${className}`}>{children}</div>;
}
