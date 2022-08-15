use crate::program_accounts::player::*;
use crate::program_accounts::puzzle_box::*;
use crate::program_globals::constants::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ClaimLamports<'info> {
    #[account(mut)]
    pub puzzle_box_account: Box<Account<'info, PuzzleBox>>,

    #[account(
        seeds = [
            PLAYER_SEED,
            puzzle_box_account.key().as_ref(),
            player.key().as_ref(),
        ],
        bump
    )]
    pub player_account: Account<'info, Player>,

    #[account(mut)]
    pub player: Signer<'info>,
}

pub fn run_claim_lamports(ctx: Context<ClaimLamports>) -> Result<()> {
    {
        msg!("Checking game state...");

        for i in 0..ctx.accounts.puzzle_box_account.keys.len() {
            if ctx.accounts.player_account.timestamps[i] == 0 {
                msg!("Not yet unlocked.");
                return Ok(());
            }
        }
    }

    {
        let puzzle_box_account = &mut ctx.accounts.puzzle_box_account;
        let gross_puzzle_box_lamports = puzzle_box_account.to_account_info().lamports();
        let puzzle_box_rent = Rent::get()?.minimum_balance(get_puzzle_box_size(
            puzzle_box_account.leaderboard.len() as u8,
            puzzle_box_account.keys.len() as u8,
        ));

        if gross_puzzle_box_lamports > puzzle_box_rent {
            let player = &mut ctx.accounts.player;

            let distro = gross_puzzle_box_lamports - puzzle_box_rent;
            msg!("Claiming {:?} lamports...", distro);

            **puzzle_box_account
                .to_account_info()
                .try_borrow_mut_lamports()? -= distro;
            **player.try_borrow_mut_lamports()? += distro;
        } else {
            msg!("All lamports claimed...");
        }
    }

    Ok(())
}
