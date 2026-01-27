/**
 * Global statistics management utilities
 * Stores platform-wide stats in localStorage
 */

export interface GlobalStats {
  totalBattles: number;
  tuneBurned: number;
  activePlayers: Set<string>;
  prizePool: number;
}

const STATS_KEY = 'global_stats';
const PLAYERS_KEY = 'active_players';
const BURN_PER_BATTLE = 5;

/**
 * Get global stats from localStorage
 */
export function getGlobalStats(): GlobalStats {
  if (typeof window === 'undefined') {
    return {
      totalBattles: 24700,
      tuneBurned: 1200000,
      activePlayers: new Set(),
      prizePool: 890000,
    };
  }

  const stored = localStorage.getItem(STATS_KEY);
  const playersStored = localStorage.getItem(PLAYERS_KEY);

  const stats = stored ? JSON.parse(stored) : {
    totalBattles: 24700,
    tuneBurned: 1200000,
    prizePool: 890000,
  };

  const players = playersStored ? new Set(JSON.parse(playersStored)) : new Set<string>();

  return {
    ...stats,
    activePlayers: players,
  };
}

/**
 * Save global stats to localStorage
 */
function saveGlobalStats(stats: GlobalStats): void {
  if (typeof window === 'undefined') return;

  const { activePlayers, ...rest } = stats;
  localStorage.setItem(STATS_KEY, JSON.stringify(rest));
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(Array.from(activePlayers)));

  // Trigger custom event for stats update
  window.dispatchEvent(new Event('globalStatsUpdate'));
}

/**
 * Increment battle count
 */
export function incrementBattleCount(): void {
  const stats = getGlobalStats();
  stats.totalBattles += 1;
  stats.tuneBurned += BURN_PER_BATTLE;
  saveGlobalStats(stats);
}

/**
 * Add a player to active players list
 */
export function addActivePlayer(walletAddress: string): void {
  const stats = getGlobalStats();
  stats.activePlayers.add(walletAddress);
  saveGlobalStats(stats);
}

/**
 * Update prize pool
 */
export function updatePrizePool(amount: number): void {
  const stats = getGlobalStats();
  stats.prizePool = Math.max(0, stats.prizePool + amount);
  saveGlobalStats(stats);
}

/**
 * Get formatted stats for display
 */
export function getFormattedStats() {
  const stats = getGlobalStats();

  return {
    totalBattles: formatNumber(stats.totalBattles),
    tuneBurned: formatNumber(stats.tuneBurned),
    activePlayers: stats.activePlayers.size.toLocaleString(),
    prizePool: `$${formatNumber(stats.prizePool)}`,
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

/**
 * Reset stats to initial values (for testing)
 */
export function resetStats(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(PLAYERS_KEY);
  window.dispatchEvent(new Event('globalStatsUpdate'));
}
