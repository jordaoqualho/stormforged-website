"use client";

import { useGuildWarStore } from "@/store/guildWarStore";
import { AttackRecord } from "@/types";
import { useState } from "react";
import BattleResultSelector, { BattleResult } from "./BattleResultSelector";
import { useNotifications } from "./NotificationSystem";
import PlayerAutocomplete from "./PlayerAutocomplete";
import RPGConfirmModal from "./RPGConfirmModal";
import RPGDatePicker from "./RPGDatePicker";

interface AttackManagerProps {
  className?: string;
}

interface EditAttackFormData {
  playerName: string;
  date: string;
  attacks: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
}

export default function AttackManager({ className = "" }: AttackManagerProps) {
  const { attacks, updateAttack, deleteAttack, isSaving } = useGuildWarStore();
  const { showSuccess, showError } = useNotifications();
  const [editingAttack, setEditingAttack] = useState<AttackRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [attackToDelete, setAttackToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sort attacks by date (newest first)
  const sortedAttacks = [...attacks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEdit = (attack: AttackRecord) => {
    setEditingAttack(attack);
    setIsEditing(true);
  };

  const handleDelete = (attackId: string) => {
    setAttackToDelete(attackId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!attackToDelete) return;

    try {
      await deleteAttack(attackToDelete);
      showSuccess("Attack record deleted successfully!");
      setShowDeleteConfirm(false);
      setAttackToDelete(null);
    } catch (error) {
      showError("Failed to delete attack record");
      console.error("Error deleting attack:", error);
    }
  };

  const handleSaveEdit = async (formData: EditAttackFormData) => {
    if (!editingAttack) return;

    try {
      await updateAttack(editingAttack.id, {
        playerName: formData.playerName.toLowerCase().trim(),
        date: formData.date,
        attacks: formData.attacks,
        wins: formData.wins,
        losses: formData.losses,
        draws: formData.draws,
        points: formData.points,
      });

      showSuccess("Attack record updated successfully!");
      setIsEditing(false);
      setEditingAttack(null);
    } catch (error) {
      showError("Failed to update attack record");
      console.error("Error updating attack:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingAttack(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getWinRate = (wins: number, attacks: number) => {
    if (attacks === 0) return 0;
    return Math.round((wins / attacks) * 100);
  };

  if (attacks.length === 0) {
    return (
      <div className={`card-rpg bg-battlefield p-6 ${className}`}>
        <div className="flex items-center space-x-4 mb-6">
          <div className="icon-rpg pixel-glow text-xl">⚔️</div>
          <h3 className="text-xl font-pixel text-gold text-glow">Attack Records</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>

        <div className="text-center py-12">
          <div className="icon-rpg text-6xl mb-6 animate-float">📝</div>
          <div className="bg-[#1A1A1A] border border-mystic-blue rounded-pixel p-6 max-w-md mx-auto">
            <p className="text-text-muted font-pixel-operator text-sm leading-relaxed mb-4">No attack records found.</p>
            <p className="text-text-secondary font-pixel-operator text-xs">Start recording battles to see them here!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`card-rpg bg-battlefield p-6 ${className}`}>
        <div className="flex items-center space-x-4 mb-6">
          <div className="icon-rpg pixel-glow text-xl">⚔️</div>
          <h3 className="text-xl font-pixel text-gold text-glow">Attack Records</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          <div className="text-sm text-text-muted font-pixel-operator bg-[#1A1A1A] px-3 py-1 rounded-pixel border border-mystic-blue">
            {attacks.length} records
          </div>
        </div>

        {/* Attack Records Table */}
        <div className="panel-rpg overflow-hidden rounded-md border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-dark-gray bg-[#1A1A1A]">
                  <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-left">Member</th>
                  <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Date</th>
                  <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Attacks</th>
                  <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Wins</th>
                  <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Losses</th>
                  <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Draws</th>
                  <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Rate</th>
                  <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Points</th>
                  <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAttacks.map((attack) => (
                  <tr
                    key={attack.id}
                    className="border-b border-dark-gray hover:bg-mystic-blue hover:bg-opacity-20 transition-colors group"
                  >
                    <td className="py-3 px-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                          <span className="text-xs">⚔️</span>
                        </div>
                        <span className="font-pixel text-gold capitalize">{attack.playerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-center text-text-secondary font-pixel-operator">
                      {formatDate(attack.date)}
                    </td>
                    <td className="py-3 px-3 text-sm text-center font-pixel text-gold">{attack.attacks}</td>
                    <td className="py-3 px-3 text-sm text-center font-pixel text-success">{attack.wins}</td>
                    <td className="py-3 px-3 text-sm text-center font-pixel text-danger">{attack.losses}</td>
                    <td className="py-3 px-3 text-sm text-center font-pixel text-warning">{attack.draws}</td>
                    <td className="py-3 px-3 text-sm text-center">
                      <span
                        className={`font-pixel text-sm px-2 py-1 rounded-full ${
                          getWinRate(attack.wins, attack.attacks) >= 80
                            ? "bg-green-700/80 text-white"
                            : getWinRate(attack.wins, attack.attacks) >= 60
                            ? "bg-yellow-700/80 text-white"
                            : "bg-red-700/80 text-white"
                        }`}
                      >
                        {getWinRate(attack.wins, attack.attacks)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-center font-pixel text-gold">{attack.points}</td>
                    <td className="py-3 px-3 text-sm text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(attack)}
                          className="btn-rpg-sm bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 text-xs"
                          disabled={isSaving}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(attack.id)}
                          className="btn-rpg-sm bg-red-600 hover:bg-red-500 text-white px-2 py-1 text-xs"
                          disabled={isSaving}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Attack Modal */}
      {isEditing && editingAttack && (
        <EditAttackModal
          attack={editingAttack}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation Modal */}
      <RPGConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Attack Record"
        message="Are you sure you want to delete this attack record? This action cannot be undone and will permanently remove the battle data from Stormforged's archives!"
        confirmText="Delete Record"
        cancelText="Cancel"
        type="danger"
        icon="🗑️"
      />
    </>
  );
}

interface EditAttackModalProps {
  attack: AttackRecord;
  onSave: (data: EditAttackFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function EditAttackModal({ attack, onSave, onCancel, isSaving }: EditAttackModalProps) {
  const [formData, setFormData] = useState<EditAttackFormData>({
    playerName: attack.playerName,
    date: attack.date,
    attacks: attack.attacks,
    wins: attack.wins,
    losses: attack.losses,
    draws: attack.draws,
    points: attack.points,
  });

  const [battleResults, setBattleResults] = useState({
    wins: attack.wins,
    losses: attack.losses,
    draws: attack.draws,
  });

  // Convert battle results to array format for BattleResultSelector
  const battleResultsArray: BattleResult[] = Array(battleResults.wins).fill("victory")
    .concat(Array(battleResults.draws).fill("draw"))
    .concat(Array(battleResults.losses).fill("loss"));

  const handleBattleResultChange = (results: BattleResult[]) => {
    const wins = results.filter(r => r === "victory").length;
    const draws = results.filter(r => r === "draw").length;
    const losses = results.filter(r => r === "loss").length;
    
    const newResults = { wins, losses, draws };
    setBattleResults(newResults);
    setFormData((prev) => ({
      ...prev,
      wins,
      losses,
      draws,
      points: wins * 5 + losses * 2 + draws * 3,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4">
      <div className="card-rpg bg-battlefield max-w-2xl w-full border-2 border-gold animate-slide-up">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="icon-rpg pixel-glow text-xl">✏️</div>
            <h3 className="text-xl font-pixel text-gold text-glow">Edit Attack Record</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Player Name */}
            <div className="space-y-1">
              <label className="text-gold font-pixel text-sm">Member Name</label>
              <PlayerAutocomplete
                value={formData.playerName}
                onChange={(value) => setFormData((prev) => ({ ...prev, playerName: value }))}
                placeholder="Enter warrior name"
                className="w-full"
                disabled={isSaving}
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-gold font-pixel text-sm">Battle Date</label>
              <RPGDatePicker
                value={formData.date}
                onChange={(value) => setFormData((prev) => ({ ...prev, date: value }))}
                className="w-full"
                disabled={isSaving}
              />
            </div>

            {/* Battle Results */}
            <div className="space-y-1">
              <label className="text-gold font-pixel text-sm">Battle Results</label>
              <BattleResultSelector
                onResultsChange={handleBattleResultChange}
                initialResults={battleResultsArray}
                disabled={isSaving}
              />
            </div>

            {/* Summary */}
            <div className="panel-rpg p-4 space-y-2">
              <h4 className="text-gold font-pixel text-sm mb-3">Battle Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Attacks:</span>
                  <span className="font-pixel text-gold">{formData.attacks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Wins:</span>
                  <span className="font-pixel text-success">{formData.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Losses:</span>
                  <span className="font-pixel text-danger">{formData.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Draws:</span>
                  <span className="font-pixel text-warning">{formData.draws}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-text-muted">Total Points:</span>
                  <span className="font-pixel text-gold">{formData.points}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn-rpg bg-gray-600 hover:bg-gray-500 text-white flex-1"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-rpg bg-gold hover:bg-yellow-500 text-black flex-1"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-rpg w-4 h-4" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
