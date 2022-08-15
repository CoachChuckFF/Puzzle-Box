use crate::program_accounts::player::*;
use crate::program_accounts::puzzle_box::*;
use crate::program_globals::constants::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};
use spl_associated_token_account::get_associated_token_address;

#[derive(Accounts)]
pub struct ClaimSPL<'info> {
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

    // ------ VAULTS ------
    #[account(mut, address = get_associated_token_address(
        &puzzle_box_account.key(),
        &puzzle_box_vault.mint
    ))]
    pub puzzle_box_vault: Account<'info, TokenAccount>,

    #[account(mut, address = get_associated_token_address(
        &player.key(),
        &puzzle_box_vault.mint // This is correct
    ))]
    pub player_vault: Account<'info, TokenAccount>,

    // --------- Programs ----------
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,

    #[account(mut)]
    pub player: Signer<'info>,
}

pub fn run_claim_spl(ctx: Context<ClaimSPL>) -> Result<()> {
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
        if ctx.accounts.puzzle_box_vault.amount > 0 {
            msg!("Claiming SPL...");

            transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.puzzle_box_vault.to_account_info(),
                        to: ctx.accounts.player_vault.to_account_info(),
                        authority: ctx.accounts.puzzle_box_account.to_account_info(),
                    },
                    &[&[
                        PUZZLE_BOX_SEED,
                        ctx.accounts.puzzle_box_account.toy_maker.as_ref(),
                        &[ctx.accounts.puzzle_box_account.puzzle_id],
                        &[ctx.accounts.puzzle_box_account.bump],
                    ]],
                ),
                ctx.accounts.puzzle_box_vault.amount,
            )?;

            return Ok(());
        } else {
            msg!("SPL already claimed...");
        }
    }

    Ok(())
}
