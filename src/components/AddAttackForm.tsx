"use client";

import { formatDate } from "@/lib/calculations";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([]);

  // Fixed attacks per entry (always 5)
  const attacks = 5;

  const { addAttack, isSaving, attacks: allAttacks } = useGuildWarStore();
  const { playClick, playSword, playSuccess, playError } = useRPGSounds();

  // Auto-complete player names
  useEffect(() => {
    const uniquePlayers = Array.from(new Set(allAttacks.map((attack) => attack.playerName)));
    setPlayerSuggestions(uniquePlayers.slice(0, 5)); // Show last 5 unique players
  }, [allAttacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || wins < 0 || wins > attacks) {
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
        losses: attacks - wins,
      });

      // Reset form
      setPlayerName("");
      setWins(0);

      playSuccess();
      playSword();
      onSuccess?.(`Attack record added! ${playerName.trim()} scored ${wins}/${attacks} victories! ⚔️`);
    } catch (error) {
      console.error("Error adding attack:", error);
      playError();
      onError?.("Failed to add attack record. The battle rages on!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = playerName.trim() && wins >= 0 && wins <= attacks;
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
            <RPGDatePicker
              value={date}
              onChange={setDate}
              placeholder="Select battle date..."
              className="w-full"
            />
          </div>

          {/* Victories Input with Visual Indicators */}
          <div className="space-y-3">
            <label htmlFor="wins" className="block font-pixel text-lg text-gold">
              🏆 Victories (out of 5)
            </label>
            <div className="relative">
              <input
                type="number"
                id="wins"
                min="0"
                max={attacks}
                value={wins}
                onChange={(e) => setWins(Math.max(0, Math.min(attacks, parseInt(e.target.value) || 0)))}
                className="input-rpg w-full px-4 py-3 text-base"
                required
              />
              {/* Victory Progress Bar */}
              <div className="mt-3">
                <div className="flex space-x-2 justify-center">
                  {Array.from({ length: attacks }, (_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 border-2 border-mystic-blue rounded-pixel flex items-center justify-center text-sm font-pixel transition-all duration-300 ${
                        i < wins
                          ? "bg-gold text-[#0D0D0D] shadow-[0_0_15px_rgba(255,215,0,0.6)] transform scale-110"
                          : "bg-[#2A2A2A] text-text-muted hover:bg-[#3A3A3A]"
                      }`}
                    >
                      {i < wins ? "⚔️" : "⚪"}
                    </div>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm text-text-muted font-pixel-operator">
                    {wins} victories • {attacks - wins} defeats
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Battle Summary */}
          {wins > 0 && (
            <div className="panel-rpg">
              <h3 className="font-pixel text-sm text-gold mb-3">📊 Battle Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="stat-rpg">
                  <div className="text-lg font-pixel text-danger">💀</div>
                  <div className="text-xs text-text-muted">Losses</div>
                  <div className="text-lg font-pixel text-danger">{attacks - wins}</div>
                </div>
                <div className="stat-rpg">
                  <div className="text-lg font-pixel text-gold">⚔️</div>
                  <div className="text-xs text-text-muted">Total</div>
                  <div className="text-lg font-pixel text-gold">{attacks}</div>
                </div>
                <div className="stat-rpg">
                  <div className="text-lg font-pixel text-success">🏆</div>
                  <div className="text-xs text-text-muted">Win Rate</div>
                  <div
                    className={`text-lg font-pixel ${
                      winRate >= 80 ? "text-success" : winRate >= 60 ? "text-warning" : "text-danger"
                    }`}
                  >
                    {winRate}%
                  </div>
                </div>
              </div>

              {/* Win Rate Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>Battle Performance</span>
                  <span>{winRate}%</span>
                </div>
                <div className="progress-rpg">
                  <div className="progress-rpg-fill" style={{ width: `${winRate}%` }} />
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
