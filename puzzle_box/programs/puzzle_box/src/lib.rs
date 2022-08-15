use anchor_lang::prelude::*;

// Globals
mod program_globals;

// Accounts
mod program_accounts;

// Instructions
mod program_instructions;
use program_instructions::claim_lamports::*;
use program_instructions::claim_spl::*;
use program_instructions::create_puzzle_box::*;
use program_instructions::submit_key::*;

declare_id!("AeyNFWzsb2rhuQpgwoa6mfH6FzxT8FQ62GeBapdKanca");

#[program]
pub mod puzzle_box {
    use crate::program_instructions::create_puzzle_box::CreatePuzzleBox;

    use super::*;

    pub fn create_puzzle_box(
        ctx: Context<CreatePuzzleBox>,
        bump: u8,
        puzzle_id: u8,
        leaderboard_size: u8,
        keys: Vec<Pubkey>,
    ) -> Result<()> {
        return run_create_puzzle_box(ctx, bump, puzzle_id, leaderboard_size, &keys);
    }

    pub fn submit_key(ctx: Context<SubmitKey>) -> Result<()> {
        return run_submit_key(ctx);
    }

    pub fn claim_lamports(ctx: Context<ClaimLamports>) -> Result<()> {
        return run_claim_lamports(ctx);
    }

    pub fn claim_spl(ctx: Context<ClaimSPL>) -> Result<()> {
        return run_claim_spl(ctx);
    }
}
