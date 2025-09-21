// Achievement System Constants

export const ACHIEVEMENT_CONFIG = {
  DAILY_MEMBERS_THRESHOLD: 30,
  DAILY_ATTACKS_THRESHOLD: 50,
  DAILY_PERFECT_ATTACKS_THRESHOLD: 20,
  WEEKLY_ATTACKS_THRESHOLD: 200,
  WEEKLY_PERFECT_ATTACKS_THRESHOLD: 50,
  WEEKLY_ACTIVE_DAYS: 7,
  LIFETIME_ATTACKS_THRESHOLDS: [1, 100, 500, 1000],
  LIFETIME_MEMBERS_THRESHOLDS: [25, 50],
  CONSECUTIVE_WINS_THRESHOLDS: [15, 25],
  WIN_RATE_THRESHOLD: 85,
  WIN_RATE_MIN_ATTACKS: 100,
} as const;

export const RARITY_CONFIG = {
  colors: {
    common: "border-gray-400 bg-gray-600/80",
    rare: "border-blue-400 bg-blue-600/80",
    epic: "border-purple-400 bg-purple-600/80",
    legendary: "border-gold bg-gold-dark/80",
    mythic: "border-pink-400 bg-pink-600/80",
  },
  glow: {
    common: "shadow-none",
    rare: "shadow-glow-blue",
    epic: "shadow-glow-blue",
    legendary: "shadow-glow-gold",
    mythic: "shadow-pink-500/50",
  },
  icons: {
    common: "⚪",
    rare: "💙",
    epic: "💜",
    legendary: "🌟",
    mythic: "💎",
  },
  modalColors: {
    common: "border-gray-400",
    rare: "border-blue-400",
    epic: "border-purple-400",
    legendary: "border-gold",
    mythic: "border-pink-400",
  },
} as const;

export const CATEGORY_CONFIG = {
  daily: "bg-green-600/20 border-green-500/50",
  weekly: "bg-blue-600/20 border-blue-500/50",
  lifetime: "bg-purple-600/20 border-purple-500/50",
  special: "bg-gold/20 border-gold/50",
} as const;
