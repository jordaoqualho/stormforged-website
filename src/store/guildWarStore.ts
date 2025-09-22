import { calculateComparison, generateId, getCurrentWeekStats, getPreviousWeekStats } from "@/lib/calculations";
import { calculateDraws, calculatePoints } from "@/lib/points";
import { storage } from "@/lib/storage";
import { AttackRecord, ComparisonData, GuildWarData, WeeklyStats } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GuildWarState {
  // Data
  attacks: AttackRecord[];
  currentWeekStats: WeeklyStats | null;
  previousWeekStats: WeeklyStats | null;
  comparison: ComparisonData | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  loadData: () => Promise<void>;
  addAttack: (attack: Omit<AttackRecord, "id">) => Promise<void>;
  updateAttack: (id: string, updates: Partial<AttackRecord>) => Promise<void>;
  deleteAttack: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;

  // Internal actions
  updateStats: () => void;
}

export const useGuildWarStore = create<GuildWarState>()(
  persist(
    (set, get) => ({
      // Initial state
      attacks: [],
      currentWeekStats: null,
      previousWeekStats: null,
      comparison: null,
      isLoading: false,
      isSaving: false,

      // Load data from storage
      loadData: async () => {
        set({ isLoading: true });
        try {
          const data = await storage.getData();
          if (data) {
            set({ attacks: data.attacks });
            get().updateStats();
          }
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Add new attack record
      addAttack: async (attackData) => {
        set({ isSaving: true });
        try {
          // Calculate draws and points if not provided
          const draws = attackData.draws ?? calculateDraws(attackData.attacks, attackData.wins, attackData.losses);
          const points = attackData.points ?? calculatePoints(attackData.wins, attackData.losses, draws);

          const newAttack: AttackRecord = {
            ...attackData,
            id: generateId(),
            draws,
            points,
          };

          await storage.addAttack(newAttack);

          set((state) => ({
            attacks: [...state.attacks, newAttack],
          }));

          get().updateStats();
        } catch (error) {
          console.error("Error adding attack:", error);
          throw error;
        } finally {
          set({ isSaving: false });
        }
      },

      // Update existing attack record
      updateAttack: async (id, updates) => {
        set({ isSaving: true });
        try {
          const currentAttack = get().attacks.find((attack) => attack.id === id);
          if (!currentAttack) throw new Error("Attack not found");

          // Calculate draws and points if needed
          const attacks = updates.attacks ?? currentAttack.attacks;
          const wins = updates.wins ?? currentAttack.wins;
          const losses = updates.losses ?? currentAttack.losses;
          const draws = updates.draws ?? calculateDraws(attacks, wins, losses);
          const points = updates.points ?? calculatePoints(wins, losses, draws);

          const updatedAttack = {
            ...updates,
            draws,
            points,
          };

          await storage.updateAttack(id, updatedAttack);

          set((state) => ({
            attacks: state.attacks.map((attack) =>
              attack.id === id
                ? {
                    ...attack,
                    ...updatedAttack,
                  }
                : attack
            ),
          }));

          get().updateStats();
        } catch (error) {
          console.error("Error updating attack:", error);
          throw error;
        } finally {
          set({ isSaving: false });
        }
      },

      // Delete attack record
      deleteAttack: async (id) => {
        set({ isSaving: true });
        try {
          await storage.deleteAttack(id);

          set((state) => ({
            attacks: state.attacks.filter((attack) => attack.id !== id),
          }));

          get().updateStats();
        } catch (error) {
          console.error("Error deleting attack:", error);
          throw error;
        } finally {
          set({ isSaving: false });
        }
      },

      // Clear all data
      clearAllData: async () => {
        set({ isSaving: true });
        try {
          await storage.clearAllData();
          set({
            attacks: [],
            currentWeekStats: null,
            previousWeekStats: null,
            comparison: null,
          });
        } catch (error) {
          console.error("Error clearing data:", error);
          throw error;
        } finally {
          set({ isSaving: false });
        }
      },

      // Export data
      exportData: async () => {
        return await storage.exportData();
      },

      // Import data
      importData: async (jsonData) => {
        set({ isSaving: true });
        try {
          await storage.importData(jsonData);

          const data = await storage.getData();
          if (data) {
            set({ attacks: data.attacks });
            get().updateStats();
          }
        } catch (error) {
          console.error("❌ [STORE] Error importing data:", error);
          throw error;
        } finally {
          set({ isSaving: false });
        }
      },

      // Update statistics
      updateStats: () => {
        const { attacks } = get();
        const currentWeekStats = getCurrentWeekStats(attacks);
        const previousWeekStats = getPreviousWeekStats(attacks);
        const comparison = calculateComparison(currentWeekStats, previousWeekStats);

        set({
          currentWeekStats,
          previousWeekStats,
          comparison,
        });
      },
    }),
    {
      name: "guild-war-storage",
      partialize: (state) => ({ attacks: state.attacks }),
    }
  )
);
