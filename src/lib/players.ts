export interface Player {
  id: string;
  name: string;
  role?: "warrior" | "mage" | "archer" | "tank" | "healer";
  avatar?: string;
  lastUsed?: Date;
  totalBattles?: number;
  winRate?: number;
}

export const PLAYER_ROLES = {
  warrior: { emoji: "⚔️", color: "text-danger" },
  mage: { emoji: "🔮", color: "text-mystic-blue-light" },
  archer: { emoji: "🏹", color: "text-success" },
  tank: { emoji: "🛡️", color: "text-warning" },
  healer: { emoji: "💚", color: "text-success" },
} as const;

export const DEFAULT_AVATARS = [
  "🧙‍♂️",
  "🧙‍♀️",
  "⚔️",
  "🏹",
  "🛡️",
  "🔮",
  "🗡️",
  "⚡",
  "🔥",
  "❄️",
  "🌪️",
  "💎",
  "👑",
  "🎭",
  "🌟",
  "💫",
];

export function generatePlayerAvatar(name: string): string {
  // Generate consistent avatar based on name
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_AVATARS[hash % DEFAULT_AVATARS.length];
}

export function fuzzySearch(players: Player[], query: string): Player[] {
  if (!query.trim()) return players;

  const lowerQuery = query.toLowerCase();
  return players
    .filter(
      (player) => player.name.toLowerCase().includes(lowerQuery) || player.role?.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => {
      // Prioritize exact matches at the start
      const aExactStart = a.name.toLowerCase().startsWith(lowerQuery);
      const bExactStart = b.name.toLowerCase().startsWith(lowerQuery);

      if (aExactStart && !bExactStart) return -1;
      if (!aExactStart && bExactStart) return 1;

      // Then by last used date
      if (a.lastUsed && b.lastUsed) {
        return b.lastUsed.getTime() - a.lastUsed.getTime();
      }

      // Finally alphabetically
      return a.name.localeCompare(b.name);
    });
}

export function getRecentPlayers(players: Player[], limit = 5): Player[] {
  return players
    .filter((player) => player.lastUsed)
    .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
    .slice(0, limit);
}
