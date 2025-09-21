"use client";

import { formatDate } from "@/lib/calculations";
import { calculatePoints, getPointBreakdown } from "@/lib/points";
import { useRPGSounds } from "@/lib/sounds";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useEffect, useMemo, useState } from "react";
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
  const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Fixed attacks per entry (always 5)
  const attacks = 5;

  // Calculate stats from battle results
  const wins = battleResults.filter((r) => r === "victory").length;
  const draws = battleResults.filter((r) => r === "draw").length;
  const losses = battleResults.filter((r) => r === "loss").length;
  const points = calculatePoints(wins, losses, draws);
  const pointBreakdown = getPointBreakdown(wins, losses, draws);

  const { addAttack, isSaving, attacks: allAttacks } = useGuildWarStore();
  const { playClick, playSword, playSuccess, playError } = useRPGSounds();

  // Check if current player/date combination already exists (debounced to prevent flashing)
  const isDuplicateEntry = useMemo(() => {
    const trimmedName = playerName.trim();
    if (!trimmedName) return false;

    return allAttacks.some(
      (attack) => attack.playerName.toLowerCase() === trimmedName.toLowerCase() && attack.date === date
    );
  }, [playerName, date, allAttacks]);

  // Auto-complete player names
  useEffect(() => {
    const uniquePlayers = Array.from(new Set(allAttacks.map((attack) => attack.playerName)));
    setPlayerSuggestions(uniquePlayers.slice(0, 5)); // Show last 5 unique players
  }, [allAttacks]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      playError();
      onError?.("Invalid input! Check your values, warrior!");
      return;
    }

    // Check for duplicate player on same date
    const trimmedPlayerName = playerName.trim();
    const existingAttack = allAttacks.find(
      (attack) => attack.playerName.toLowerCase() === trimmedPlayerName.toLowerCase() && attack.date === date
    );

    if (existingAttack) {
      playError();
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

      // Reset form
      setPlayerName("");
      setBattleResults(Array(5).fill("victory"));

      playSuccess();
      playSword();
      onSuccess?.(`Battle record added! ${trimmedPlayerName} earned ${points} points! ⚔️`);
    } catch (error) {
      console.error("Error adding attack:", error);
      playError();
      onError?.("Failed to add attack record. The battle rages on!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = playerName.trim();
  const isLoading = isSaving || isSubmitting;

  const winRate = attacks > 0 ? Math.round((wins / attacks) * 100) : 0;

  return (
    <div className="card-rpg bg-battlefield p-4">
      <div className="relative">
        {/* RPG Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="icon-rpg pixel-glow text-xl">⚔️</div>
          <h2 className="text-xl font-pixel text-gold text-glow">Battle Log Entry</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Player Name Input */}
          <div className="space-y-1">
            <label htmlFor="playerName" className="block font-pixel text-gold text-left mb-1">
              🛡️ Member Name
            </label>
            <PlayerAutocomplete
              value={playerName}
              onChange={setPlayerName}
              placeholder="Enter member name..."
              className={`w-full transition-opacity duration-200 ${isLoading ? "opacity-50" : ""}`}
              disabled={isLoading}
            />
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
            disabled={!isFormValid || isLoading || isDuplicateEntry}
            className={`btn-rpg w-full text-lg py-3 px-6 mt-4 ${
              isDuplicateEntry ? "opacity-50 cursor-not-allowed" : ""
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
