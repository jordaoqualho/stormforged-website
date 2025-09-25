"use client";

import { formatDate } from "@/lib/calculations";
import { calculatePoints } from "@/lib/points";
import { useRPGSounds } from "@/lib/sounds";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useEffect, useMemo, useRef, useState } from "react";
import BattleResultSelector, { BattleResult } from "./BattleResultSelector";
import PlayerAutocomplete from "./PlayerAutocomplete";
import RPGDatePicker from "./RPGDatePicker";

interface AddAttackFormProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function AddAttackForm({ onSuccess, onError }: AddAttackFormProps) {
  const [playerName, setPlayerName] = useState("");
  const [date, setDate] = useState(formatDate(new Date()));
  const [battleResults, setBattleResults] = useState<BattleResult[]>(Array(5).fill("victory"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showNameRequiredWarning, setShowNameRequiredWarning] = useState(false);
  const playerInputRef = useRef<HTMLInputElement>(null);

  // Fixed attacks per entry (always 5)
  const attacks = 5;

  // Calculate stats from battle results
  const wins = battleResults.filter((r) => r === "victory").length;
  const draws = battleResults.filter((r) => r === "draw").length;
  const losses = battleResults.filter((r) => r === "loss").length;
  const points = calculatePoints(wins, losses, draws);

  const { addAttack, isSaving, attacks: allAttacks } = useGuildWarStore();
  const { playSword, playSuccess, playError, isEnabled: soundEnabled } = useRPGSounds();

  // Check if current player/date combination already exists (debounced to prevent flashing)
  const isDuplicateEntry = useMemo(() => {
    const trimmedName = playerName.trim();
    if (!trimmedName) return false;

    return allAttacks.some(
      (attack) => attack.playerName.toLowerCase() === trimmedName.toLowerCase() && attack.date === date
    );
  }, [playerName, date, allAttacks]);

  // Control duplicate warning display with delay to prevent flashing
  useEffect(() => {
    if (isDuplicateEntry) {
      const timer = setTimeout(() => {
        setShowDuplicateWarning(true);
      }, 500); // 500ms delay
      return () => clearTimeout(timer);
    } else {
      setShowDuplicateWarning(false);
    }
  }, [isDuplicateEntry]);

  // Clear name required warning when user starts typing
  useEffect(() => {
    if (playerName.trim() && showNameRequiredWarning) {
      setShowNameRequiredWarning(false);
    }
  }, [playerName, showNameRequiredWarning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submissions
    if (isSubmitting || isLoading) {
      return;
    }

    if (!playerName.trim()) {
      if (soundEnabled) playError();
      setShowNameRequiredWarning(true);
      onError?.("Member name is required! Enter a warrior's name to record the battle. ⚔️");

      // Clear the warning after 3 seconds
      setTimeout(() => {
        setShowNameRequiredWarning(false);
      }, 3000);

      return;
    }

    // Check for duplicate player on same date
    const trimmedPlayerName = playerName.trim();
    const existingAttack = allAttacks.find(
      (attack) => attack.playerName.toLowerCase() === trimmedPlayerName.toLowerCase() && attack.date === date
    );

    if (existingAttack) {
      if (soundEnabled) playError();
      onError?.(`${trimmedPlayerName} has already recorded a battle on ${date}. One battle per day per warrior! ⚔️`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addAttack({
        playerName: trimmedPlayerName.toLowerCase(),
        date,
        attacks,
        wins,
        losses,
        draws,
        points,
      });

      // Clear only the player name and refocus for sequential entries
      setPlayerName("");

      // Refocus the input after a short delay to allow the form to update
      setTimeout(() => {
        if (playerInputRef.current) {
          playerInputRef.current.focus();
        }
      }, 100);

      if (soundEnabled) {
        playSuccess();
        playSword();
      }
      onSuccess?.(`Battle record added! ${trimmedPlayerName} earned ${points} points! ⚔️`);
    } catch (error) {
      console.error("Error adding attack:", error);
      if (soundEnabled) playError();
      onError?.("Failed to add attack record. The battle rages on!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = playerName.trim();
  const isLoading = isSaving || isSubmitting;

  // Handle clicks on disabled button states
  const handleDisabledButtonClick = () => {
    if (!isFormValid) {
      if (soundEnabled) playError();
      setShowNameRequiredWarning(true);
      onError?.("Member name is required! Enter a warrior's name to record the battle. ⚔️");
      
      // Clear the warning after 3 seconds
      setTimeout(() => {
        setShowNameRequiredWarning(false);
      }, 3000);
    } else if (isDuplicateEntry) {
      if (soundEnabled) playError();
      onError?.(`${playerName.trim()} has already recorded a battle on ${date}. One battle per day per warrior! ⚔️`);
    }
  };

  return (
    <div className="card-rpg bg-battlefield p-4">
      <div className="relative">
        {/* RPG Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="icon-rpg pixel-glow text-xl">⚔️</div>
          <h2 className="text-xl font-pixel text-gold text-glow">Battle Entry</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Player Name Input */}
          <div className="space-y-1">
            <label htmlFor="playerName" className="block font-pixel text-gold text-left mb-1">
              🛡️ Member Name
            </label>
            <PlayerAutocomplete
              ref={playerInputRef}
              value={playerName}
              onChange={setPlayerName}
              placeholder="Enter member name..."
              className={`w-full transition-opacity duration-200 ${isLoading ? "opacity-50" : ""} ${
                showNameRequiredWarning ? "ring-2 ring-danger" : ""
              }`}
              disabled={isLoading}
            />

            {/* Name Required Warning */}
            {showNameRequiredWarning && (
              <div className="bg-danger/20 border-2 border-danger rounded-pixel p-2 mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-danger text-sm">⚠️</span>
                  <div className="text-xs text-danger font-pixel-operator">
                    Member name is required to record a battle
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Input */}
          <div className="space-y-1">
            <label htmlFor="date" className="block font-pixel text-gold text-left mb-1">
              📅 Battle Date
            </label>
            <RPGDatePicker
              value={date}
              onChange={setDate}
              placeholder="Select battle date..."
              className={`w-full transition-opacity duration-200 ${isLoading ? "opacity-50" : ""}`}
              disabled={isLoading}
            />
          </div>

          {/* Battle Results Selector */}
          <div className={`space-y-1 transition-opacity duration-200 ${isLoading ? "opacity-50" : ""}`}>
            <BattleResultSelector
              onResultsChange={setBattleResults}
              initialResults={battleResults}
              disabled={isLoading}
            />
          </div>

          {/* Duplicate Entry Warning */}
          {showDuplicateWarning && (
            <div className="bg-danger/20 border-2 border-danger rounded-pixel p-3">
              <div className="flex items-center space-x-2">
                <span className="text-danger text-lg">⚠️</span>
                <div>
                  <div className="font-pixel text-danger text-sm">Duplicate Entry Detected!</div>
                  <div className="text-xs text-text-muted font-pixel-operator">
                    {playerName.trim()} has already recorded a battle on {date}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            onClick={(e) => {
              if (isLoading) {
                e.preventDefault();
                return;
              }
              if (!isFormValid || isDuplicateEntry) {
                e.preventDefault();
                handleDisabledButtonClick();
                return;
              }
            }}
            className={`btn-rpg w-full text-lg py-3 px-6 mt-4 ${
              isDuplicateEntry ? "opacity-50 cursor-not-allowed" : ""
            } ${!isFormValid ? "opacity-75" : ""} ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="loading-rpg w-4 h-4 animate-spin" />
                <span className="animate-pulse">Recording Battle...</span>
              </span>
            ) : isDuplicateEntry ? (
              <span className="flex items-center justify-center space-x-2">
                <span>⚠️</span>
                <span>Duplicate Entry</span>
                <span>⚠️</span>
              </span>
            ) : !isFormValid ? (
              <span className="flex items-center justify-center space-x-2">
                <span>📝</span>
                <span>Enter Member Name</span>
                <span>📝</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>⚔️</span>
                <span>Record Battle</span>
                <span>⚔️</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
