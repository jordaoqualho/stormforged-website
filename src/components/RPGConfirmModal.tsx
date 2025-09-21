"use client";

import { useRPGSounds } from "@/lib/sounds";
import { useEffect } from "react";

interface RPGConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
  icon?: string;
}

export default function RPGConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  icon = "⚠️",
}: RPGConfirmModalProps) {
  const { playClick, playError } = useRPGSounds();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    playClick();
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    playClick();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          border: "border-danger",
          iconColor: "text-danger",
          confirmBg: "bg-danger hover:bg-danger-dark border-danger-dark",
          glow: "shadow-glow-danger",
        };
      case "info":
        return {
          border: "border-mystic-blue",
          iconColor: "text-mystic-blue-light",
          confirmBg: "bg-mystic-blue hover:bg-mystic-blue-light border-mystic-blue-light",
          glow: "shadow-glow-blue",
        };
      default: // warning
        return {
          border: "border-warning",
          iconColor: "text-warning",
          confirmBg: "bg-warning hover:bg-warning-dark border-warning-dark",
          glow: "shadow-glow-gold",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 animate-fade-in"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className={`card-rpg bg-battlefield p-6 max-w-md w-full relative animate-slide-up ${styles.glow}`}>
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className={`icon-rpg pixel-glow text-2xl ${styles.iconColor}`}>
            {icon}
          </div>
          <h3 className="text-xl font-pixel text-gold text-glow">{title}</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p className="text-text-primary font-pixel-operator leading-relaxed">
            {message}
          </p>
        </div>

        {/* Warning Box for dangerous actions */}
        {type === "danger" && (
          <div className="bg-danger bg-opacity-20 border border-danger rounded-pixel p-4 mb-6">
            <p className="text-sm font-pixel text-danger">
              ⚠️ This action cannot be undone!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            className="btn-rpg flex-1 py-3 px-6 text-center"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>❌</span>
              <span>{cancelText}</span>
            </span>
          </button>
          
          <button
            onClick={handleConfirm}
            className={`btn-rpg flex-1 py-3 px-6 text-center ${styles.confirmBg}`}
          >
            <span className="flex items-center justify-center space-x-2">
              <span>{type === "danger" ? "💀" : type === "info" ? "✅" : "⚔️"}</span>
              <span>{confirmText}</span>
            </span>
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
          title="Close (Esc)"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>
    </div>
  );
}
