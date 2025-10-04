"use client";

import { useRPGSounds } from "@/lib/sounds";
import { ReactNode } from "react";

interface PixelButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "eye";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  title?: string;
}

export default function PixelButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  title,
}: PixelButtonProps) {
  const { playHover } = useRPGSounds();
  const baseClasses = "font-pixel transition-all duration-200 hover:scale-105 active:scale-95";

  const variantClasses = {
    primary:
      "bg-gold hover:bg-gold-light border-2 border-[#B8860B] hover:border-gold-light text-[#0D0D0D] shadow-glow-gold",
    secondary: "bg-[#3A3A3A] hover:bg-[#4A4A4A] border-2 border-[#4A4A4A] hover:border-[#5A5A5A] text-gold",
    danger: "bg-danger hover:bg-danger-light border-2 border-danger-dark hover:border-danger text-[#0D0D0D]",
    eye: "bg-mystic-blue hover:bg-mystic-blue-light border-2 border-mystic-blue-light hover:border-mystic-blue text-gold shadow-glow-blue",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed hover:scale-100" : "";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => !disabled && playHover()}
      disabled={disabled}
      title={title}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
        rounded-pixel
      `}
    >
      {children}
    </button>
  );
}
