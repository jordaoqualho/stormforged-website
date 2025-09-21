"use client";

import { useGuildWarStore } from "@/store/guildWarStore";
import { useState } from "react";
import RPGConfirmModal from "./RPGConfirmModal";

interface DataManagementProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function DataManagement({ onSuccess, onError }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showImportSection, setShowImportSection] = useState(false);

  // Confirmation modal states
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { exportData, importData: importDataAction, clearAllData, isSaving } = useGuildWarStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stormforged-guild-war-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onSuccess?.("Battle records exported successfully! 📜⚔️");
    } catch (error) {
      console.error("Error exporting data:", error);
      onError?.("Failed to export battle records. The scroll is cursed!");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      onError?.("Please paste the battle data to import!");
      return;
    }

    setShowImportConfirm(true);
  };

  const confirmImport = async () => {
    setIsImporting(true);
    try {
      await importDataAction(importData);
      setImportData("");
      setShowImportSection(false);
      onSuccess?.("Battle records imported successfully! The archives have been restored! 🏰");
    } catch (error) {
      console.error("Error importing data:", error);
      onError?.("Failed to import battle data. The scroll is corrupted!");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    setShowClearConfirm(true);
  };

  const confirmClearData = async () => {
    try {
      await clearAllData();
      onSuccess?.("All battle records have been cleared. The slate is clean! 🗑️");
    } catch (error) {
      console.error("Error clearing data:", error);
      onError?.("Failed to clear battle records. The curse persists!");
    }
  };

  const isLoading = isExporting || isImporting || isSaving;

  return (
    <div className="card-rpg bg-battlefield p-6">
      <div className="relative">
        {/* RPG Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="icon-rpg pixel-glow text-2xl">📚</div>
          <h2 className="text-2xl font-pixel text-gold text-glow">Stormforged Archives</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>

        <div className="space-y-10">
          {/* Export Section */}
          <div className="panel-rpg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="icon-rpg text-xl">📜</div>
              <h3 className="text-xl font-pixel text-gold">Export Battle Records</h3>
            </div>
            <p className="text-sm text-text-secondary font-pixel-operator mb-6 leading-relaxed">
              Download all of Stormforged's battle data as a sacred scroll for backup or sharing with other guilds.
            </p>
            <button onClick={handleExport} disabled={isLoading} className="btn-rpg w-full py-4 px-6 text-lg">
              {isExporting ? (
                <span className="flex items-center space-x-2">
                  <div className="loading-rpg w-4 h-4" />
                  <span>Creating Scroll...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>📜</span>
                  <span>Export Records</span>
                  <span>⚔️</span>
                </span>
              )}
            </button>
          </div>

          {/* Import Section */}
          <div className="panel-rpg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="icon-rpg text-xl">🏰</div>
                <h3 className="text-xl font-pixel text-gold">Import Battle Records</h3>
              </div>
              <button onClick={() => setShowImportSection(!showImportSection)} className="btn-rpg text-sm px-4 py-2">
                {showImportSection ? "Hide Archive" : "Open Archive"}
              </button>
            </div>
            <p className="text-sm text-text-secondary font-pixel-operator mb-6 leading-relaxed">
              Import previously exported battle records. This will replace all current data in Stormforged's archives.
            </p>

            {showImportSection && (
              <div className="space-y-6">
                <div className="relative">
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your exported battle scroll here..."
                    className="input-rpg w-full h-40 resize-none p-4"
                    rows={8}
                  />
                  <div className="absolute top-3 right-3 text-xs text-text-muted font-pixel-operator bg-[#1A1A1A] px-2 py-1 rounded-pixel border border-mystic-blue">
                    {importData.length} characters
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleImport}
                    disabled={isLoading || !importData.trim()}
                    className="btn-rpg flex-1 py-3 px-6"
                  >
                    {isImporting ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="loading-rpg w-4 h-4" />
                        <span>Decrypting Scroll...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>🏰</span>
                        <span>Import Records</span>
                        <span>📚</span>
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setImportData("")}
                    className="btn-rpg bg-danger hover:bg-danger-dark border-danger-dark"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clear Data Section */}
          <div className="panel-rpg border-danger p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="icon-rpg text-danger text-xl">💀</div>
              <h3 className="text-xl font-pixel text-danger">Clear All Records</h3>
            </div>
            <p className="text-sm text-text-secondary font-pixel-operator mb-6 leading-relaxed">
              Permanently delete all battle records from Stormforged's archives. This action cannot be undone and will
              erase all history!
            </p>

            <div className="bg-danger bg-opacity-20 border border-danger rounded-pixel p-4 mb-6">
              <p className="text-sm font-pixel text-danger">
                ⚠️ WARNING: This will destroy all battle data including statistics, charts, and player records!
              </p>
            </div>

            <button
              onClick={handleClearData}
              disabled={isLoading}
              className="btn-rpg bg-danger hover:bg-danger-dark border-danger-dark w-full py-4 px-6 text-lg"
            >
              {isSaving ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="loading-rpg w-4 h-4" />
                  <span>Destroying Archives...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>💀</span>
                  <span>Clear All Records</span>
                  <span>🗑️</span>
                </span>
              )}
            </button>
          </div>

          {/* Archive Stats */}
          <div className="panel-rpg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="icon-rpg text-xl">📊</div>
              <h3 className="text-xl font-pixel text-gold">Archive Statistics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div className="stat-rpg min-h-[100px] py-4">
                <div className="text-3xl font-pixel text-gold mb-2">{useGuildWarStore.getState().attacks.length}</div>
                <div className="text-sm text-text-muted font-pixel-operator">Battle Records</div>
              </div>
              <div className="stat-rpg min-h-[100px] py-4">
                <div className="text-3xl font-pixel text-mystic-blue-light mb-2">
                  {new Set(useGuildWarStore.getState().attacks.map((a) => a.playerName)).size}
                </div>
                <div className="text-sm text-text-muted font-pixel-operator">Unique Members</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Confirmation Modal */}
      <RPGConfirmModal
        isOpen={showImportConfirm}
        onClose={() => setShowImportConfirm(false)}
        onConfirm={confirmImport}
        title="Import Battle Records"
        message="This will replace all current battle records with the imported data. Are you sure you want to continue?"
        confirmText="Import Records"
        cancelText="Cancel"
        type="warning"
        icon="🏰"
      />

      {/* Clear Data Confirmation Modal */}
      <RPGConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClearData}
        title="Clear All Records"
        message="This will permanently delete all battle records from Stormforged's archives. This action cannot be undone and will erase all history!"
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
        icon="💀"
      />
    </div>
  );
}
