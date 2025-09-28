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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMethod, setImportMethod] = useState<"text" | "file">("file");
  const [jsonValidationError, setJsonValidationError] = useState<string | null>(null);

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

  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      setJsonValidationError(null);
      return true;
    } catch {
      setJsonValidationError("Invalid JSON format. Please check your data.");
      return false;
    }
  };

  const handleImport = async () => {
    if (importMethod === "file" && !selectedFile) {
      onError?.("Please select a JSON file to import!");
      return;
    }

    if (importMethod === "text" && !importData.trim()) {
      onError?.("Please paste the JSON data to import!");
      return;
    }

    // Validate JSON
    if (!validateJson(importData)) {
      return;
    }

    setShowImportConfirm(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.name.endsWith(".json")) {
      onError?.("Please select a valid JSON file!");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError?.("File is too large! Please select a file smaller than 10MB.");
      return;
    }

    try {
      const text = await file.text();
      setImportData(text);
      setSelectedFile(file);
      setImportMethod("file");
      // Validate JSON immediately after file selection
      validateJson(text);
    } catch (error) {
      console.error("❌ [UI] Error reading file:", error);
      onError?.("Failed to read the file. Please try again.");
    }
  };

  const resetImport = () => {
    setImportData("");
    setSelectedFile(null);
    setJsonValidationError(null);
  };

  const confirmImport = async () => {
    setIsImporting(true);
    try {
      await importDataAction(importData);

      resetImport();
      onSuccess?.("Battle records imported successfully! The archives have been restored! 🏰");
    } catch (error) {
      console.error("❌ [UI] Error importing data:", error);
      console.error("❌ [UI] Error details:", error);
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
            <div className="flex items-center space-x-4 mb-6">
              <div className="icon-rpg text-xl">🏰</div>
              <h3 className="text-xl font-pixel text-gold">Import Battle Records</h3>
            </div>
            <p className="text-sm text-text-secondary font-pixel-operator mb-6 leading-relaxed">
              Import previously exported battle records. This will replace all current data in Stormforged's archives.
            </p>

            <div className="space-y-6">
              {/* Import Method Selection */}
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => {
                    setImportMethod("file");
                    setImportData("");
                    setSelectedFile(null);
                    setJsonValidationError(null);
                  }}
                  className={`btn-rpg flex-1 py-3 px-4 text-lg ${
                    importMethod === "file"
                      ? "bg-gold text-[#0D0D0D] border-gold"
                      : "bg-[#2A2A2A] text-text-primary border-mystic-blue"
                  }`}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>📁</span>
                    <span>Upload File</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    setImportMethod("text");
                    setSelectedFile(null);
                    setJsonValidationError(null);
                  }}
                  className={`btn-rpg flex-1 py-3 px-4 text-lg ${
                    importMethod === "text"
                      ? "bg-gold text-[#0D0D0D] border-gold"
                      : "bg-[#2A2A2A] text-text-primary border-mystic-blue"
                  }`}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>📜</span>
                    <span>Paste JSON</span>
                  </span>
                </button>
              </div>

              {/* File Upload Section */}
              {importMethod === "file" && (
                <div className="space-y-4">
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = e.dataTransfer.files;
                      if (files.length > 0 && files[0].name.endsWith(".json")) {
                        const mockEvent = {
                          target: {
                            files: [files[0]],
                          },
                        } as any;
                        handleFileSelect(mockEvent);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("border-gold", "bg-gold", "bg-opacity-10");
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-gold", "bg-gold", "bg-opacity-10");
                    }}
                    onClick={() => {
                      // Create and trigger file input directly
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".json";
                      input.style.display = "none";
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files?.[0]) {
                          handleFileSelect({ target } as any);
                        }
                        document.body.removeChild(input);
                      };
                      document.body.appendChild(input);
                      input.click();
                    }}
                    className="w-full border-2 border-dashed border-mystic-blue rounded-pixel p-12 cursor-pointer transition-all duration-200 hover:border-gold hover:bg-gold hover:bg-opacity-10 hover:text-[#0D0D0D] group"
                  >
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-200">📁</div>
                      <div className="text-center space-y-2">
                        <div className="text-xl font-pixel text-gold group-hover:text-[#0D0D0D]">
                          Drop JSON File Here
                        </div>
                        <div className="text-sm text-text-secondary group-hover:text-[#0D0D0D]">or click to browse</div>
                        <div className="text-xs text-text-muted group-hover:text-[#0D0D0D] opacity-75">
                          Supports .json files only
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="bg-success bg-opacity-20 border border-success rounded-pixel p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-success">✅</span>
                          <span className="text-success font-pixel-operator">Selected: {selectedFile.name}</span>
                        </div>
                        <div className="text-xs text-text-muted">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Text Input Section */}
              {importMethod === "text" && (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={importData}
                      onChange={(e) => {
                        setImportData(e.target.value);
                        // Validate JSON as user types
                        if (e.target.value.trim()) {
                          validateJson(e.target.value);
                        } else {
                          setJsonValidationError(null);
                        }
                      }}
                      placeholder="Paste your JSON battle data here..."
                      className="input-rpg w-full h-48 resize-none p-4"
                      rows={10}
                    />
                    <div className="absolute top-3 right-3 text-xs text-text-muted font-pixel-operator bg-[#1A1A1A] px-2 py-1 rounded-pixel border border-mystic-blue">
                      {importData.length} characters
                    </div>
                  </div>
                </div>
              )}

              {/* JSON Validation Error */}
              {jsonValidationError && (
                <div className="bg-danger bg-opacity-20 border border-danger rounded-pixel p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-danger">❌</span>
                    <span className="text-danger font-pixel-operator text-sm">{jsonValidationError}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleImport}
                  disabled={
                    isLoading || (importMethod === "file" ? !selectedFile : !importData.trim()) || !!jsonValidationError
                  }
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

                <button onClick={resetImport} className="btn-rpg bg-danger hover:bg-danger-dark border-danger-dark">
                  Clear
                </button>
              </div>
            </div>
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
