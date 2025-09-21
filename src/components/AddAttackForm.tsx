"use client";

import { formatDate } from "@/lib/calculations";
import { calculatePoints } from "@/lib/points";
import { useRPGSounds } from "@/lib/sounds";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useEffect, useState } from "react";
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

  // Fixed attacks per entry (always 5)
  const attacks = 5;

  // Calculate stats from battle results
  const wins = battleResults.filter((r) => r === "victory").length;
  const draws = battleResults.filter((r) => r === "draw").length;
  const losses = battleResults.filter((r) => r === "loss").length;
  const points = calculatePoints(wins, losses, draws);

  const { addAttack, isSaving, attacks: allAttacks } = useGuildWarStore();
  const { playClick, playSword, playSuccess, playError } = useRPGSounds();

  // Auto-complete player names
  useEffect(() => {
    const uniquePlayers = Array.from(new Set(allAttacks.map((attack) => attack.playerName)));
    setPlayerSuggestions(uniquePlayers.slice(0, 5)); // Show last 5 unique players
  }, [allAttacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      playError();
      onError?.("Invalid input! Check your values, warrior!");
      return;
    }

    setIsSubmitting(true);
    try {
      await addAttack({
        playerName: playerName.trim(),
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
      onSuccess?.(`Battle record added! ${playerName.trim()} earned ${points} points! ⚔️`);
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
    <div className="card-rpg bg-battlefield max-w-2xl mx-auto">
      <div className="relative p-6">
        {/* RPG Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="icon-rpg pixel-glow">⚔️</div>
          <h2 className="text-2xl font-pixel text-gold text-glow">Battle Log Entry</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>
        

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Player Name Input */}
          <div className="space-y-3">
            <label htmlFor="playerName" className="block font-pixel text-lg text-gold">
              🛡️ Warrior Name
            </label>
            <PlayerAutocomplete
              value={playerName}
              onChange={setPlayerName}
              placeholder="Enter warrior name..."
              className="w-full"
            />
          </div>

          {/* Date Input */}
          <div className="space-y-3">
            <label htmlFor="date" className="block font-pixel text-lg text-gold">
              📅 Battle Date
            </label>
            <RPGDatePicker value={date} onChange={setDate} placeholder="Select battle date..." className="w-full" />
          </div>

          {/* Battle Results Selector */}
          <BattleResultSelector
            onResultsChange={setBattleResults}
            initialResults={battleResults}
          />

          {/* Battle Summary */}
          {battleResults.some(r => r !== "victory") && (
            <div className="panel-rpg">
              <h3 className="font-pixel text-sm text-gold mb-3">📊 Battle Summary</h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="stat-rpg">
                  <div className="text-lg font-pixel text-gold">🏆</div>
                  <div className="text-xs text-text-muted">Wins</div>
                  <div className="text-lg font-pixel text-gold">{wins}</div>
                </div>
                <div className="stat-rpg">
                  <div className="text-lg font-pixel text-danger">💀</div>
                  <div className="text-xs text-text-muted">Losses</div>
                  <div className="text-lg font-pixel text-danger">{losses}</div>
                </div>
                <div className="stat-rpg">
                  <div className="text-lg font-pixel text-warning">🤝</div>
                  <div className="text-xs text-text-muted">Draws</div>
                  <div className="text-lg font-pixel text-warning">{draws}</div>
                </div>
                <div className="stat-rpg">
                  <div className="text-lg font-pixel text-success">⭐</div>
                  <div className="text-xs text-text-muted">Points</div>
                  <div className="text-lg font-pixel text-success">{points}</div>
                </div>
              </div>

              {/* Point Breakdown Details */}
              <div className="mt-4 p-3 bg-[#1A1A1A] border border-mystic-blue rounded-pixel">
                <div className="text-center">
                  <div className="text-sm font-pixel text-gold mb-2">Point Breakdown</div>
                  <div className="grid grid-cols-3 gap-4 text-xs font-pixel-operator">
                    <div>
                      <span className="text-gold">{wins} wins</span> × 5 ={" "}
                      <span className="text-gold">{pointBreakdown.winPoints}</span>
                    </div>
                    <div>
                      <span className="text-danger">{losses} losses</span> × 2 ={" "}
                      <span className="text-danger">{pointBreakdown.lossPoints}</span>
                    </div>
                    <div>
                      <span className="text-warning">{draws} draws</span> × 3 ={" "}
                      <span className="text-warning">{pointBreakdown.drawPoints}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={!isFormValid || isLoading} className="btn-rpg w-full text-lg py-4 px-6">
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="loading-rpg w-4 h-4" />
                <span>Recording Battle...</span>
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
