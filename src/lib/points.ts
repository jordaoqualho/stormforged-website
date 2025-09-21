/**
 * Point calculation utilities for the guild war system
 * 
 * Scoring system:
 * - Win: 5 points
 * - Loss: 2 points  
 * - Draw: 3 points
 */

export const POINT_VALUES = {
  WIN: 5,
  LOSS: 2,
  DRAW: 3,
} as const;

/**
 * Calculate total points for a battle record
 */
export function calculatePoints(wins: number, losses: number, draws: number): number {
  return (wins * POINT_VALUES.WIN) + (losses * POINT_VALUES.LOSS) + (draws * POINT_VALUES.DRAW);
}

/**
 * Calculate draws from total attacks, wins, and losses
 */
export function calculateDraws(attacks: number, wins: number, losses: number): number {
  return Math.max(0, attacks - wins - losses);
}

/**
 * Validate that wins + losses + draws = attacks
 */
export function validateBattleRecord(attacks: number, wins: number, losses: number, draws?: number): boolean {
  const calculatedDraws = draws ?? calculateDraws(attacks, wins, losses);
  return wins + losses + calculatedDraws === attacks;
}

/**
 * Get point breakdown for display
 */
export function getPointBreakdown(wins: number, losses: number, draws: number) {
  return {
    winPoints: wins * POINT_VALUES.WIN,
    lossPoints: losses * POINT_VALUES.LOSS,
    drawPoints: draws * POINT_VALUES.DRAW,
    totalPoints: calculatePoints(wins, losses, draws),
  };
}
