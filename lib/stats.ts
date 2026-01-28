/**
 * Global statistics management utilities
 * Stores platform-wide stats in localStorage
 */

export interface GlobalStats {
  totalBattles: number;
  totalVotes: number;
}

const STATS_KEY = 'global_stats';

/**
 * Get global stats from localStorage
 */
export function getGlobalStats(): GlobalStats {
  if (typeof window === 'undefined') {
    return {
      totalBattles: 24700,
      totalVotes: 89400,
    };
  }

  const stored = localStorage.getItem(STATS_KEY);

  return stored ? JSON.parse(stored) : {
    totalBattles: 24700,
    totalVotes: 89400,
  };
}

/**
 * Save global stats to localStorage
 */
function saveGlobalStats(stats: GlobalStats): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  window.dispatchEvent(new Event('globalStatsUpdate'));
}

/**
 * Increment battle count
 */
export function incrementBattleCount(): void {
  const stats = getGlobalStats();
  stats.totalBattles += 1;
  saveGlobalStats(stats);
}

/**
 * Increment vote count
 */
export function incrementVoteCount(): void {
  const stats = getGlobalStats();
  stats.totalVotes += 1;
  saveGlobalStats(stats);
}

/**
 * Get formatted stats for display
 */
export function getFormattedStats() {
  const stats = getGlobalStats();

  return {
    totalBattles: formatNumber(stats.totalBattles),
    totalVotes: formatNumber(stats.totalVotes),
  };
}

/**
 * Format large numbers (e.g., 24700 -> 24.7K)
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
