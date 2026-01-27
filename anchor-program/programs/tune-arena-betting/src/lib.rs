use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("TuneArena11111111111111111111111111111111111");

#[program]
pub mod tune_arena_betting {
    use super::*;

    /// Initialize a new battle
    pub fn initialize_battle(
        ctx: Context<InitializeBattle>,
        battle_id: u64,
        track_a_id: String,
        track_b_id: String,
    ) -> Result<()> {
        let battle = &mut ctx.accounts.battle;
        battle.battle_id = battle_id;
        battle.track_a_id = track_a_id;
        battle.track_b_id = track_b_id;
        battle.is_revealed = false;
        battle.winner = None;
        battle.total_bets_a = 0;
        battle.total_bets_b = 0;
        battle.authority = ctx.accounts.authority.key();
        battle.bump = ctx.bumps.battle;

        msg!("Battle #{} initialized", battle_id);
        Ok(())
    }

    /// Place a bet on a track
    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        track_choice: u8, // 0 = Track A, 1 = Track B
    ) -> Result<()> {
        require!(track_choice <= 1, BettingError::InvalidTrackChoice);
        require!(!ctx.accounts.battle.is_revealed, BettingError::BattleAlreadyRevealed);
        require!(amount > 0, BettingError::InvalidAmount);

        let bet = &mut ctx.accounts.bet;
        bet.user = ctx.accounts.user.key();
        bet.battle = ctx.accounts.battle.key();
        bet.amount = amount;
        bet.track_choice = track_choice;
        bet.bump = ctx.bumps.bet;

        // Update battle totals
        let battle = &mut ctx.accounts.battle;
        if track_choice == 0 {
            battle.total_bets_a += amount;
        } else {
            battle.total_bets_b += amount;
        }

        // Transfer tokens from user to battle vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.battle_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        msg!("Bet placed: {} $TUNE on Track {}", amount, if track_choice == 0 { "A" } else { "B" });
        Ok(())
    }

    /// Reveal battle winner and enable claims
    pub fn reveal_winner(
        ctx: Context<RevealWinner>,
        winner_track: u8, // 0 = Track A, 1 = Track B
    ) -> Result<()> {
        require!(winner_track <= 1, BettingError::InvalidTrackChoice);
        require!(!ctx.accounts.battle.is_revealed, BettingError::BattleAlreadyRevealed);
        require!(
            ctx.accounts.authority.key() == ctx.accounts.battle.authority,
            BettingError::Unauthorized
        );

        let battle = &mut ctx.accounts.battle;
        battle.is_revealed = true;
        battle.winner = Some(winner_track);

        msg!("Battle #{} revealed: Winner is Track {}", battle.battle_id, if winner_track == 0 { "A" } else { "B" });
        Ok(())
    }

    /// Claim winnings after battle is revealed
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let battle = &ctx.accounts.battle;
        let bet = &ctx.accounts.bet;

        require!(battle.is_revealed, BettingError::BattleNotRevealed);
        require!(bet.user == ctx.accounts.user.key(), BettingError::Unauthorized);

        // Check if user won
        let winner = battle.winner.ok_or(BettingError::BattleNotRevealed)?;
        require!(bet.track_choice == winner, BettingError::UserLost);

        // Calculate winnings
        let total_pool = battle.total_bets_a + battle.total_bets_b;
        let winning_pool = if winner == 0 {
            battle.total_bets_a
        } else {
            battle.total_bets_b
        };

        // User's share of the winning pool
        let user_share = (bet.amount as u128)
            .checked_mul(total_pool as u128)
            .unwrap()
            .checked_div(winning_pool as u128)
            .unwrap() as u64;

        // Apply 10% fee (5% burn, 5% treasury)
        let fee = user_share.checked_mul(10).unwrap().checked_div(100).unwrap();
        let burn_amount = fee.checked_div(2).unwrap();
        let treasury_amount = fee.checked_sub(burn_amount).unwrap();
        let payout = user_share.checked_sub(fee).unwrap();

        // Transfer payout to user
        let battle_key = battle.key();
        let seeds = &[
            b"battle",
            battle_key.as_ref(),
            &[battle.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.battle_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.battle.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, payout)?;

        // Transfer treasury fee
        let cpi_accounts = Transfer {
            from: ctx.accounts.battle_vault.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            authority: ctx.accounts.battle.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, treasury_amount)?;

        // Note: Burn would require token mint authority
        // For now, burn amount goes to treasury as well
        let cpi_accounts = Transfer {
            from: ctx.accounts.battle_vault.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            authority: ctx.accounts.battle.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, burn_amount)?;

        msg!("Claimed {} $TUNE (fee: {} $TUNE)", payout, fee);
        Ok(())
    }
}

// ============================================================================
// Accounts
// ============================================================================

#[derive(Accounts)]
#[instruction(battle_id: u64)]
pub struct InitializeBattle<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Battle::INIT_SPACE,
        seeds = [b"battle", battle_id.to_le_bytes().as_ref()],
        bump
    )]
    pub battle: Account<'info, Battle>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Bet::INIT_SPACE,
        seeds = [b"bet", battle.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,

    #[account(mut)]
    pub battle: Account<'info, Battle>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub battle_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevealWinner<'info> {
    #[account(mut)]
    pub battle: Account<'info, Battle>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub battle: Account<'info, Battle>,

    #[account(
        seeds = [b"bet", battle.key().as_ref(), user.key().as_ref()],
        bump = bet.bump
    )]
    pub bet: Account<'info, Bet>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub battle_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// ============================================================================
// State
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct Battle {
    pub battle_id: u64,
    #[max_len(50)]
    pub track_a_id: String,
    #[max_len(50)]
    pub track_b_id: String,
    pub is_revealed: bool,
    pub winner: Option<u8>,
    pub total_bets_a: u64,
    pub total_bets_b: u64,
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub user: Pubkey,
    pub battle: Pubkey,
    pub amount: u64,
    pub track_choice: u8,
    pub bump: u8,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum BettingError {
    #[msg("Invalid track choice. Must be 0 or 1.")]
    InvalidTrackChoice,
    #[msg("Battle has already been revealed.")]
    BattleAlreadyRevealed,
    #[msg("Battle has not been revealed yet.")]
    BattleNotRevealed,
    #[msg("Unauthorized action.")]
    Unauthorized,
    #[msg("User did not win this battle.")]
    UserLost,
    #[msg("Invalid bet amount.")]
    InvalidAmount,
}
