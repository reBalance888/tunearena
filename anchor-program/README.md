# Tune Arena Betting - Solana Program

Anchor-based Solana program for decentralized betting on AI music battles.

## Features

- **Battle Creation**: Initialize battles with unique IDs and track identifiers
- **Betting**: Users can bet $TUNE tokens on Track A or Track B
- **Reveal System**: Authority reveals winner after battle ends
- **Automated Payouts**: Winners claim proportional share of prize pool
- **Fee Structure**: 10% fee (5% burned, 5% to treasury)

## Program Structure

```
Programs:
├── initialize_battle  - Create a new battle
├── place_bet         - Bet tokens on a track
├── reveal_winner     - Reveal battle winner (authority only)
└── claim_winnings    - Claim winnings after reveal

Accounts:
├── Battle - Stores battle state and bet totals
└── Bet    - Stores individual user bets
```

## Installation

### Prerequisites

- Rust 1.70+
- Solana CLI 1.17+
- Anchor CLI 0.29+
- Node.js 18+

### Setup

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0

# Install dependencies
npm install
```

### Configuration

1. Generate a new wallet (if needed):
```bash
solana-keygen new
```

2. Set Solana to devnet:
```bash
solana config set --url devnet
```

3. Airdrop SOL for testing:
```bash
solana airdrop 2
```

## Build & Deploy

### Build

```bash
# Navigate to anchor program directory
cd anchor-program

# Build the program
anchor build
```

### Deploy to Devnet

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Note the Program ID and update it in:
# - Anchor.toml: [programs.devnet]
# - lib.rs: declare_id!()
```

### Run Tests

```bash
# Run anchor tests
anchor test --skip-local-validator

# Or run with local validator
anchor test
```

## Usage Example

### 1. Initialize Battle

```typescript
const battleId = new BN(247);
const trackAId = "track-a-id";
const trackBId = "track-b-id";

await program.methods
  .initializeBattle(battleId, trackAId, trackBId)
  .accounts({
    battle: battlePda,
    authority: authority.publicKey,
  })
  .signers([authority])
  .rpc();
```

### 2. Place Bet

```typescript
const amount = new BN(10_000_000); // 10 $TUNE (assuming 6 decimals)
const trackChoice = 0; // 0 = Track A, 1 = Track B

await program.methods
  .placeBet(amount, trackChoice)
  .accounts({
    bet: betPda,
    battle: battlePda,
    user: user.publicKey,
    userTokenAccount: userTokenAccount,
    battleVault: battleVault,
  })
  .signers([user])
  .rpc();
```

### 3. Reveal Winner

```typescript
const winnerTrack = 0; // Track A wins

await program.methods
  .revealWinner(winnerTrack)
  .accounts({
    battle: battlePda,
    authority: authority.publicKey,
  })
  .signers([authority])
  .rpc();
```

### 4. Claim Winnings

```typescript
await program.methods
  .claimWinnings()
  .accounts({
    battle: battlePda,
    bet: betPda,
    user: user.publicKey,
    userTokenAccount: userTokenAccount,
    battleVault: battleVault,
    treasury: treasuryAccount,
  })
  .signers([user])
  .rpc();
```

## Fee Structure

For every winning bet:
- **90%** goes to the winner
- **5%** is burned (sent to treasury for now)
- **5%** goes to treasury

Example:
- Total pot: 100 $TUNE
- User won with 10 $TUNE bet
- User share: 18 $TUNE (10 + 80% of opponent's 10)
- Fee: 1.8 $TUNE (10%)
- User receives: 16.2 $TUNE

## Security Considerations

⚠️ **This is a devnet-only implementation for testing purposes.**

Before mainnet deployment:
1. Conduct professional security audit
2. Implement proper token burning mechanism
3. Add rate limiting and anti-bot measures
4. Implement multi-sig authority
5. Add emergency pause functionality
6. Test extensively with real economic conditions

## Testing on Devnet

1. Create a $TUNE token mint (or use existing devnet token)
2. Create associated token accounts for users
3. Initialize battles with the program
4. Place bets from multiple wallets
5. Reveal winners
6. Claim winnings

## Frontend Integration

See `../lib/solana-betting.ts` for TypeScript client integration.

## Troubleshoats

### Program Deployment Failed
- Check SOL balance: `solana balance`
- Verify devnet connection: `solana config get`
- Ensure program ID matches in all files

### Transaction Failed
- Check token account balances
- Verify PDA derivation matches program
- Ensure battle is not already revealed

### Claim Failed
- Verify user won the battle
- Check battle is revealed
- Ensure bet account exists

## License

MIT

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/tune-arena
- Discord: [Your Discord Server]
