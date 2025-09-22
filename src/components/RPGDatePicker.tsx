"use client";

import { useRPGSounds } from "@/lib/sounds";
import { useEffect, useRef, useState } from "react";

interface RPGDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function RPGDatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  className = "",
  disabled = false,
}: RPGDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [displayValue, setDisplayValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { playClick, playSword } = useRPGSounds();

  // Initialize selected date from value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setDisplayValue(formatDisplayDate(date));
      }
    } else {
      setSelectedDate(null);
      setDisplayValue("");
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatValueDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDisplayValue(formatDisplayDate(date));
    onChange(formatValueDate(date));
    setIsOpen(false);
    playClick();
    playSword();
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      playClick();
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    playClick();
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPastDate = (date: Date): boolean => {
    // Allow all dates - no restrictions on past dates
    return false;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPast = isPastDate(date);
      const isTodayDate = isToday(date);
      const isSelectedDate = isSelected(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          className={`
            w-8 h-8 text-xs font-pixel border border-mystic-blue rounded-pixel
            transition-all duration-200 flex items-center justify-center
            ${
              isSelectedDate
                ? "bg-gold text-[#0D0D0D] shadow-[0_0_15px_rgba(255,215,0,0.6)] transform scale-110"
                : isTodayDate
                ? "bg-mystic-blue text-text-primary shadow-glow-blue"
                : "bg-[#2A2A2A] text-text-secondary hover:bg-mystic-blue hover:text-text-primary hover:scale-105"
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div
        onClick={handleInputClick}
        className={`
          input-rpg w-full px-4 py-3 text-base cursor-pointer
          flex items-center justify-between
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#3A3A3A]"}
          transition-colors duration-200
        `}
      >
        <span className={displayValue ? "text-text-primary" : "text-text-muted"}>{displayValue || placeholder}</span>
        <span className="text-gold text-lg">📅</span>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <div className="bg-[#2A2A2A] border-2 border-mystic-blue rounded-pixel shadow-[8px_8px_0px_rgba(0,0,0,0.8)] p-4 calendar-enter">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navigateMonth("prev")} className="btn-rpg text-sm px-3 py-1 hover:scale-105">
                ◀
              </button>
              <h3 className="font-pixel text-gold text-lg">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button onClick={() => navigateMonth("next")} className="btn-rpg text-sm px-3 py-1 hover:scale-105">
                ▶
              </button>
            </div>

            {/* Day Names Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="w-8 h-6 text-xs font-pixel text-text-muted text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-mystic-blue">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="font-pixel-operator">📅 Today</span>
                <span className="font-pixel-operator">⚔️ Select battle date</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
