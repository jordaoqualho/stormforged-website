"use client";

import { useEffect, useState } from "react";

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export default function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  useEffect(() => {
    notifications.forEach((notification) => {
      const duration = notification.duration || 3000;
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, duration);
      return () => clearTimeout(timer);
    });
  }, [notifications, onRemove]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            relative overflow-hidden
            px-4 py-3 rounded-pixel border-2
            font-pixel text-sm
            shadow-[8px_8px_0px_rgba(0,0,0,0.8)]
            animate-success-pop
            ${
              notification.type === "success"
                ? "bg-success border-success-dark text-[#0D0D0D] shadow-glow-success"
                : notification.type === "error"
                ? "bg-danger border-danger-dark text-text-primary shadow-glow-danger animate-error-shake"
                : "bg-mystic-blue border-mystic-blue-light text-text-primary shadow-glow-blue"
            }
          `}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {notification.type === "success" ? "⚔️" : notification.type === "error" ? "💀" : "📜"}
            </span>
            <span className="flex-1">{notification.message}</span>
            <button onClick={() => onRemove(notification.id)} className="text-lg hover:text-gold transition-colors">
              ✕
            </button>
          </div>

          {/* RPG-style progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
            <div
              className="h-full bg-gold transition-all ease-linear"
              style={{
                width: "100%",
                animation: `shrink ${notification.duration || 3000}ms linear forwards`,
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const showSuccess = (message: string, duration?: number) => {
    addNotification({ type: "success", message, duration });
  };

  const showError = (message: string, duration?: number) => {
    addNotification({ type: "error", message, duration });
  };

  const showInfo = (message: string, duration?: number) => {
    addNotification({ type: "info", message, duration });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
  };
}
