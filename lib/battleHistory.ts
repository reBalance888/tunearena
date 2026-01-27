/**
 * Battle history management utilities
 * Stores battle results in localStorage
 */

export interface BattleRecord {
  id: number;
  winner: string;
  loser: string;
  prompt: string;
  timestamp: number;
}

const HISTORY_KEY = 'battle_history';
const MAX_HISTORY = 10;

/**
 * Get battle history from localStorage
 */
export function getBattleHistory(): BattleRecord[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Add a battle to history
 */
export function addBattleToHistory(battle: Omit<BattleRecord, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  const history = getBattleHistory();
  const newBattle: BattleRecord = {
    ...battle,
    timestamp: Date.now(),
  };

  // Add to beginning and limit to MAX_HISTORY
  const updatedHistory = [newBattle, ...history].slice(0, MAX_HISTORY);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
}

/**
 * Clear battle history
 */
export function clearBattleHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Get a specific battle by ID
 */
export function getBattleById(id: number): BattleRecord | null {
  const history = getBattleHistory();
  return history.find(b => b.id === id) || null;
}
