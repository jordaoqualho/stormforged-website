"use client";

import { formatDate } from "@/lib/calculations";
import { calculateDraws, calculatePoints, getPointBreakdown } from "@/lib/points";
import { useRPGSounds } from "@/lib/sounds";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useEffect, useState } from "react";
import PlayerAutocomplete from "./PlayerAutocomplete";
import RPGDatePicker from "./RPGDatePicker";

interface AddAttackFormProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function AddAttackForm({ onSuccess, onError }: AddAttackFormProps) {
  const [playerName, setPlayerName] = useState("");
  const [date, setDate] = useState(formatDate(new Date()));
  const [wins, setWins] = useState<number>(0);
  const [losses, setLosses] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([]);

  // Fixed attacks per entry (always 5)
  const attacks = 5;
  
  // Calculate draws and points
  const draws = calculateDraws(attacks, wins, losses);
  const points = calculatePoints(wins, losses, draws);
  const pointBreakdown = getPointBreakdown(wins, losses, draws);

  const { addAttack, isSaving, attacks: allAttacks } = useGuildWarStore();
  const { playClick, playSword, playSuccess, playError } = useRPGSounds();

  // Auto-complete player names
  useEffect(() => {
    const uniquePlayers = Array.from(new Set(allAttacks.map((attack) => attack.playerName)));
    setPlayerSuggestions(uniquePlayers.slice(0, 5)); // Show last 5 unique players
  }, [allAttacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || wins < 0 || losses < 0 || wins + losses > attacks) {
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
      setWins(0);
      setLosses(0);

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

  const isFormValid = playerName.trim() && wins >= 0 && losses >= 0 && wins + losses <= attacks;
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

          {/* Battle Results Input */}
          <div className="space-y-3">
            <label className="block font-pixel text-lg text-gold">
              ⚔️ Battle Results (out of 5)
            </label>
            <div className="bg-[#2A2A2A] border-2 border-mystic-blue rounded-pixel p-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Wins Input */}
                <div className="text-center">
                  <label className="block font-pixel text-sm text-gold mb-2">🏆 Wins</label>
                  <input
                    type="number"
                    min="0"
                    max={attacks}
                    value={wins}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(attacks, parseInt(e.target.value) || 0));
                      setWins(value);
                      playClick();
                    }}
                    className="input-rpg w-full text-center text-lg font-pixel"
                    placeholder="0"
                  />
                </div>

                {/* Losses Input */}
                <div className="text-center">
                  <label className="block font-pixel text-sm text-danger mb-2">💀 Losses</label>
                  <input
                    type="number"
                    min="0"
                    max={attacks}
                    value={losses}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(attacks, parseInt(e.target.value) || 0));
                      setLosses(value);
                      playClick();
                    }}
                    className="input-rpg w-full text-center text-lg font-pixel"
                    placeholder="0"
                  />
                </div>

                {/* Draws Display */}
                <div className="text-center">
                  <label className="block font-pixel text-sm text-warning mb-2">🤝 Draws</label>
                  <div className="input-rpg w-full text-center text-lg font-pixel text-warning bg-[#1A1A1A]">
                    {draws}
                  </div>
                </div>
              </div>

              {/* Point Breakdown */}
              <div className="border-t border-mystic-blue pt-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm font-pixel-operator text-text-muted mb-1">Total Points</div>
                    <div className="text-2xl font-pixel text-gold">{points}</div>
                  </div>
                  <div>
                    <div className="text-sm font-pixel-operator text-text-muted mb-1">Win Rate</div>
                    <div className={`text-xl font-pixel ${
                      winRate >= 80 ? "text-success" : winRate >= 60 ? "text-warning" : "text-danger"
                    }`}>
                      {winRate}%
                    </div>
                  </div>
                </div>

                {/* Point Breakdown Details */}
                <div className="mt-3 text-center">
                  <div className="text-xs font-pixel-operator text-text-muted">
                    ({wins}×5) + ({losses}×2) + ({draws}×3) = {pointBreakdown.winPoints + pointBreakdown.lossPoints + pointBreakdown.drawPoints} points
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Battle Summary */}
          {(wins > 0 || losses > 0) && (
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
                      <span className="text-gold">{wins} wins</span> × 5 = <span className="text-gold">{pointBreakdown.winPoints}</span>
                    </div>
                    <div>
                      <span className="text-danger">{losses} losses</span> × 2 = <span className="text-danger">{pointBreakdown.lossPoints}</span>
                    </div>
                    <div>
                      <span className="text-warning">{draws} draws</span> × 3 = <span className="text-warning">{pointBreakdown.drawPoints}</span>
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
