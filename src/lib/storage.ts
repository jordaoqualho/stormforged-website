import { AttackRecord, GuildWarData } from "@/types";
import { del, get, keys, set } from "idb-keyval";

const STORAGE_KEY = "guild-war-data";

export const storage = {
  async getData(): Promise<GuildWarData | null> {
    try {
      const data = await get<GuildWarData>(STORAGE_KEY);
      return data || null;
    } catch (error) {
      console.error("Error loading data from IndexedDB:", error);
      return null;
    }
  },

  async setData(data: GuildWarData): Promise<void> {
    try {
      await set(STORAGE_KEY, data);
    } catch (error) {
      console.error("Error saving data to IndexedDB:", error);
      throw error;
    }
  },

  async addAttack(attack: AttackRecord): Promise<void> {
    const data = await this.getData();
    const normalizedAttack = {
      ...attack,
      playerName: attack.playerName.toLowerCase().trim()
    };
    const updatedData: GuildWarData = {
      attacks: data ? [...data.attacks, normalizedAttack] : [normalizedAttack],
      lastUpdated: new Date().toISOString(),
    };
    await this.setData(updatedData);
  },

  async updateAttack(attackId: string, updatedAttack: Partial<AttackRecord>): Promise<void> {
    const data = await this.getData();
    if (!data) return;

    const normalizedUpdate = {
      ...updatedAttack,
      ...(updatedAttack.playerName && { playerName: updatedAttack.playerName.toLowerCase().trim() })
    };

    const updatedAttacks = data.attacks.map((attack) =>
      attack.id === attackId ? { ...attack, ...normalizedUpdate } : attack
    );

    const updatedData: GuildWarData = {
      attacks: updatedAttacks,
      lastUpdated: new Date().toISOString(),
    };
    await this.setData(updatedData);
  },

  async deleteAttack(attackId: string): Promise<void> {
    const data = await this.getData();
    if (!data) return;

    const updatedAttacks = data.attacks.filter((attack) => attack.id !== attackId);
    const updatedData: GuildWarData = {
      attacks: updatedAttacks,
      lastUpdated: new Date().toISOString(),
    };
    await this.setData(updatedData);
  },

  async clearAllData(): Promise<void> {
    try {
      await del(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing data from IndexedDB:", error);
      throw error;
    }
  },

  async exportData(): Promise<string> {
    const data = await this.getData();
    return JSON.stringify(data, null, 2);
  },

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData) as GuildWarData;
      
      // Normalize all player names to lowercase to prevent duplicates
      const normalizedData: GuildWarData = {
        ...data,
        attacks: data.attacks.map(attack => ({
          ...attack,
          playerName: attack.playerName.toLowerCase().trim()
        })),
        lastUpdated: new Date().toISOString(),
      };
      
      await this.setData(normalizedData);
    } catch (error) {
      console.error("Error importing data:", error);
      throw new Error("Invalid data format");
    }
  },
};
