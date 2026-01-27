/**
 * Wallet balance management utilities for $TUNE tokens
 * Uses localStorage for temporary storage (will be replaced with blockchain in production)
 */

const BALANCE_PREFIX = 'balance_';
const INITIAL_BALANCE = 150;

/**
 * Get balance for a wallet address
 */
export function getBalance(walletAddress: string): number {
  if (typeof window === 'undefined') return INITIAL_BALANCE;

  const stored = localStorage.getItem(`${BALANCE_PREFIX}${walletAddress}`);
  if (stored) {
    return parseInt(stored, 10);
  }

  // Initialize new wallet with starting balance
  localStorage.setItem(`${BALANCE_PREFIX}${walletAddress}`, INITIAL_BALANCE.toString());
  return INITIAL_BALANCE;
}

/**
 * Update balance for a wallet address
 */
export function setBalance(walletAddress: string, amount: number): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(`${BALANCE_PREFIX}${walletAddress}`, Math.max(0, amount).toString());
}

/**
 * Add to balance (for winnings)
 */
export function addBalance(walletAddress: string, amount: number): number {
  const currentBalance = getBalance(walletAddress);
  const newBalance = currentBalance + amount;
  setBalance(walletAddress, newBalance);
  return newBalance;
}

/**
 * Subtract from balance (for bets)
 * Returns true if successful, false if insufficient funds
 */
export function subtractBalance(walletAddress: string, amount: number): boolean {
  const currentBalance = getBalance(walletAddress);

  if (currentBalance < amount) {
    return false; // Insufficient funds
  }

  const newBalance = currentBalance - amount;
  setBalance(walletAddress, newBalance);
  return true;
}

/**
 * Format wallet address to shortened version
 */
export function formatAddress(address: string): string {
  if (address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
