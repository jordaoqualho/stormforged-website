"use client";

import { useGuildWarStore } from "@/store/guildWarStore";
import { useState } from "react";

interface DataManagementProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function DataManagement({ onSuccess, onError }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showImportSection, setShowImportSection] = useState(false);

  const { exportData, importData: importDataAction, clearAllData, isSaving } = useGuildWarStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guild-war-data-${new Date().toISOString().split("T")[0]}.json`;
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

    if (!confirm("This will replace all current battle records. Are you sure you want to continue?")) {
      return;
    }

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
    if (!confirm("This will permanently delete all battle records. Are you sure you want to continue?")) {
      return;
    }

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
    <div className="card-rpg bg-battlefield">
      <div className="relative">
        {/* RPG Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="icon-rpg pixel-glow">📚</div>
          <h2 className="text-xl font-pixel text-gold text-glow">Guild Archives</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>

        <div className="space-y-8">
          {/* Export Section */}
          <div className="panel-rpg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="icon-rpg">📜</div>
              <h3 className="text-lg font-pixel text-gold">Export Battle Records</h3>
            </div>
            <p className="text-sm text-text-secondary font-pixel-operator mb-4">
              Download all your guild's battle data as a sacred scroll for backup or sharing with other guilds.
            </p>
            <button onClick={handleExport} disabled={isLoading} className="btn-rpg">
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
          <div className="panel-rpg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="icon-rpg">🏰</div>
                <h3 className="text-lg font-pixel text-gold">Import Battle Records</h3>
              </div>
              <button onClick={() => setShowImportSection(!showImportSection)} className="btn-rpg text-sm px-3 py-1">
                {showImportSection ? "Hide Archive" : "Open Archive"}
              </button>
            </div>
            <p className="text-sm text-text-secondary font-pixel-operator mb-4">
              Import previously exported battle records. This will replace all current data in your guild's archives.
            </p>

            {showImportSection && (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your exported battle scroll here..."
                    className="input-rpg w-full h-32 resize-none"
                    rows={6}
                  />
                  <div className="absolute top-2 right-2 text-xs text-text-muted font-pixel-operator">
                    {importData.length} characters
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button onClick={handleImport} disabled={isLoading || !importData.trim()} className="btn-rpg flex-1">
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
          <div className="panel-rpg border-danger">
            <div className="flex items-center space-x-3 mb-4">
              <div className="icon-rpg text-danger">💀</div>
              <h3 className="text-lg font-pixel text-danger">Clear All Records</h3>
            </div>
            <p className="text-sm text-text-secondary font-pixel-operator mb-4">
              Permanently delete all battle records from your guild's archives. This action cannot be undone and will
              erase all history!
            </p>

            <div className="bg-danger bg-opacity-20 border border-danger rounded-pixel p-3 mb-4">
              <p className="text-xs font-pixel text-danger">
                ⚠️ WARNING: This will destroy all battle data including statistics, charts, and player records!
              </p>
            </div>

            <button
              onClick={handleClearData}
              disabled={isLoading}
              className="btn-rpg bg-danger hover:bg-danger-dark border-danger-dark w-full"
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
          <div className="panel-rpg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="icon-rpg">📊</div>
              <h3 className="text-lg font-pixel text-gold">Archive Statistics</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="stat-rpg">
                <div className="text-2xl font-pixel text-gold">{useGuildWarStore.getState().attacks.length}</div>
                <div className="text-xs text-text-muted font-pixel-operator">Battle Records</div>
              </div>
              <div className="stat-rpg">
                <div className="text-2xl font-pixel text-mystic-blue-light">
                  {new Set(useGuildWarStore.getState().attacks.map((a) => a.playerName)).size}
                </div>
                <div className="text-xs text-text-muted font-pixel-operator">Unique Warriors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
