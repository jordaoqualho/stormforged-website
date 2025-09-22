"use client";

import { useRPGSounds } from "@/lib/sounds";
import { useEffect, useRef, useState } from "react";

interface WeekOption {
  value: number;
  label: string;
  range: string;
}

interface RPGWeekSelectorProps {
  selectedWeek: number | null;
  onWeekChange: (week: number | null) => void;
  availableWeeks: number[];
  currentWeekNumber: number | null;
  getWeekRange: (week: number) => { start: string; end: string };
  className?: string;
}

export default function RPGWeekSelector({
  selectedWeek,
  onWeekChange,
  availableWeeks,
  currentWeekNumber,
  getWeekRange,
  className = "",
}: RPGWeekSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { playClick } = useRPGSounds();

  // Generate week options, avoiding duplicates with current week
  const weekOptions: WeekOption[] = [
    { value: 0, label: "Current Week", range: "Live Data (Fri-Thu)" },
    ...availableWeeks
      .filter((week) => week !== currentWeekNumber) // Filter out current week to avoid duplicates
      .map((week) => {
        const range = getWeekRange(week);
        return {
          value: week,
          label: `Week ${week}`,
          range: `${range.start} – ${range.end} (Fri-Thu)`,
        };
      }),
  ];

  // Filter options based on search
  const filteredOptions = weekOptions.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.range.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleToggle = () => {
    playClick();
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery("");
    }
  };

  const handleSelect = (week: number | null) => {
    playClick();
    onWeekChange(week);
    setIsOpen(false);
    setSearchQuery("");
  };

  const selectedOption =
    weekOptions.find((option) => option.value === selectedWeek || (selectedWeek === null && option.value === 0)) ||
    weekOptions[0];

  return (
    <div className={`relative overflow-visible ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className={`
          w-full px-4 py-3 pr-8
          bg-[#2A2A2A] border-2 border-mystic-blue
          text-text-primary font-pixel-operator text-sm
          rounded-pixel
          shadow-inner-glow
          transition-all duration-200
          hover:border-gold hover:shadow-glow-gold
          focus:border-gold focus:shadow-glow-gold focus:outline-none
          cursor-pointer
          text-left
          ${isOpen ? "border-gold shadow-glow-gold" : ""}
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-pixel text-gold text-sm">{selectedOption.label}</div>
            <div className="text-xs text-text-muted">{selectedOption.range}</div>
          </div>
          <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            <span className="text-gold">▼</span>
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[9999] animate-slide-up">
          <div className="card-rpg bg-battlefield border-2 border-gold shadow-glow-gold">
            {/* Search Input */}
            <div className="p-3 border-b border-mystic-blue">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search weeks..."
                className="input-rpg w-full text-sm"
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value === 0 ? null : option.value)}
                    className={`
                      w-full px-4 py-3 text-left
                      transition-all duration-200
                      hover:bg-mystic-blue hover:bg-opacity-20
                      border-b border-dark-gray last:border-b-0
                      ${
                        selectedWeek === option.value || (selectedWeek === null && option.value === 0)
                          ? "bg-gold bg-opacity-20 text-gold"
                          : "text-text-primary"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-pixel text-sm">{option.label}</div>
                        <div className="text-xs text-text-muted">{option.range}</div>
                      </div>
                      {(selectedWeek === option.value || (selectedWeek === null && option.value === 0)) && (
                        <span className="text-gold">✓</span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-text-muted text-sm text-center">No weeks found</div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-mystic-blue bg-[#1A1A1A]">
              <div className="text-xs text-text-muted font-pixel-operator text-center">
                {filteredOptions.length} week{filteredOptions.length !== 1 ? "s" : ""} available
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
