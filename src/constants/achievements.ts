// Achievement System Constants

export const ACHIEVEMENT_CONFIG = {
  // Guild Structure
  MAX_MEMBERS: 30,
  MAX_ATTACKS_PER_MEMBER_PER_DAY: 5,
  MAX_ATTACKS_PER_DAY: 150, // 30 members × 5 attacks
  MAX_ATTACKS_PER_WEEK: 1050, // 30 members × 5 attacks × 7 days
  MAX_POINTS_PER_WEEK: 5250, // 1050 attacks × 5 points per attack

  // Daily Achievement Thresholds
  DAILY_MEMBERS_THRESHOLD: 20, // 2/3 of max members
  DAILY_ATTACKS_THRESHOLD: 100, // 2/3 of max daily attacks
  DAILY_PERFECT_ATTACKS_THRESHOLD: 50, // 1/3 of max daily attacks
  DAILY_POINTS_THRESHOLD: 500, // 100 attacks × 5 points

  // Weekly Achievement Thresholds
  WEEKLY_ATTACKS_THRESHOLD: 700, // 2/3 of max weekly attacks
  WEEKLY_PERFECT_ATTACKS_THRESHOLD: 350, // 1/3 of max weekly attacks
  WEEKLY_POINTS_THRESHOLD: 3500, // 700 attacks × 5 points
  WEEKLY_ACTIVE_DAYS: 7,

  // Lifetime Achievement Thresholds
  LIFETIME_ATTACKS_THRESHOLDS: [1, 50, 200, 500, 1000], // More realistic progression
  LIFETIME_MEMBERS_THRESHOLDS: [5, 15, 25, 30], // Realistic member milestones
  LIFETIME_POINTS_THRESHOLDS: [100, 500, 2000, 4000, 5000], // Point-based achievements
  CONSECUTIVE_WINS_THRESHOLDS: [5, 10, 15, 20], // More achievable streaks
  WIN_RATE_THRESHOLD: 80, // Slightly more achievable
  WIN_RATE_MIN_ATTACKS: 50, // Lower minimum for meaningful stats
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
