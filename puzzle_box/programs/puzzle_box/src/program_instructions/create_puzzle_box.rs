use crate::program_accounts::puzzle_box::*;
use crate::program_globals::constants::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(bump: u8, puzzle_id: u8, leaderboard_size: u8, keys: Vec<Pubkey>)]
pub struct CreatePuzzleBox<'info> {
    #[account(
        init,
        payer = toy_maker,
        space = get_puzzle_box_size(leaderboard_size, keys.len() as u8),
        seeds = [
            PUZZLE_BOX_SEED,
            toy_maker.key().as_ref(),
            &[puzzle_id],
        ],
        bump
    )]
    pub puzzle_box_account: Box<Account<'info, PuzzleBox>>,

    /// CHECK: No need to check for now
    pub shdw_storage: UncheckedAccount<'info>,

    // --------- Programs ----------
    pub system_program: Program<'info, System>,

    // --------- Signers ----------
    #[account(mut)]
    pub toy_maker: Signer<'info>,
}

pub fn run_create_puzzle_box(
    ctx: Context<CreatePuzzleBox>,
    bump: u8,
    puzzle_id: u8,
    leaderboard_size: u8,
    keys: &Vec<Pubkey>,
) -> Result<()> {
    {
        msg!("Crafting the puzzle box...");
        let puzzle_box_account = &mut ctx.accounts.puzzle_box_account;

        for i in 0..leaderboard_size {
            puzzle_box_account.leaderboard.push(LeaderboardEntry {
                player: None,
                score: 0,
                timestamp: 0,
            });
        }

        puzzle_box_account.toy_maker = ctx.accounts.toy_maker.key();
        puzzle_box_account.puzzle_id = puzzle_id;
        puzzle_box_account.bump = bump;

        puzzle_box_account.shdw_storage = ctx.accounts.shdw_storage.key();

        puzzle_box_account.creation_date = Clock::get()?.unix_timestamp as u64;
        puzzle_box_account.keys = keys.clone();
    }

    Ok(())
}
