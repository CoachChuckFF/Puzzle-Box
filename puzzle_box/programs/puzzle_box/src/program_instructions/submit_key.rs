use crate::program_accounts::player::*;
use crate::program_accounts::puzzle_box::*;
use crate::program_globals::constants::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SubmitKey<'info> {
    #[account(mut)]
    pub puzzle_box_account: Box<Account<'info, PuzzleBox>>,

    #[account(
        init_if_needed,
        payer = player,
        space = get_player_size(puzzle_box_account.keys.len() as u8),
        seeds = [
            PLAYER_SEED,
            puzzle_box_account.key().as_ref(),
            player.key().as_ref(),
        ],
        bump
    )]
    pub player_account: Account<'info, Player>,

    // --------- Programs ----------
    pub system_program: Program<'info, System>,
    // --------- Signers ----------
    /// CHECK: No need to check for now
    pub key_submission: Signer<'info>,

    #[account(mut)]
    pub player: Signer<'info>,
}

pub fn run_submit_key(ctx: Context<SubmitKey>) -> Result<()> {
    let mut did_click = false;
    let mut already_clicked = false;
    let mut player_score = 0;

    {
        msg!("Submitting key...");

        let player_account = &mut ctx.accounts.player_account;

        for i in 0..ctx.accounts.puzzle_box_account.keys.len() {
            if player_account.timestamps.len() < i + 1 {
                player_account.timestamps.push(0);
            }

            if ctx.accounts.puzzle_box_account.keys[i] == ctx.accounts.key_submission.key() {
                if player_account.timestamps[i] == 0 {
                    msg!("Click.");
                    did_click = true;
                    player_account.timestamps[i] = Clock::get()?.unix_timestamp as u64;
                } else {
                    already_clicked = true;
                    msg!("Already unlocked.");
                }
            }
        }
    }

    if !did_click && !already_clicked {
        msg!("No dice.");
        return Ok(());
    }

    if did_click || already_clicked {
        for i in 0..ctx.accounts.puzzle_box_account.keys.len() {
            if ctx.accounts.player_account.timestamps[i] != 0 {
                player_score += 1;
            }
        }

        msg!("Player Score: {}", player_score);
    }

    if did_click {
        msg!("Setting Leaderboard...");
        let puzzle_box_account = &mut ctx.accounts.puzzle_box_account;

        let no_index = puzzle_box_account.leaderboard.len();
        let mut self_index = no_index;
        let mut worst_index = no_index;
        let mut worst_score = player_score;

        for i in 0..puzzle_box_account.leaderboard.len() {
            let entry = &puzzle_box_account.leaderboard[i];

            if entry.player.is_some() && entry.player.unwrap() == ctx.accounts.player.key() {
                self_index = i;
                break;
            } else if entry.player.is_some() && entry.score < worst_score {
                worst_index = i;
                worst_score = entry.score;
            } else if entry.player.is_none() {
                worst_index = i;
                worst_score = 0;
            }
        }

        let new_entry = LeaderboardEntry {
            player: Some(ctx.accounts.player.key()),
            score: player_score as u8,
            timestamp: Clock::get()?.unix_timestamp as u64,
        };

        if self_index != no_index {
            puzzle_box_account.leaderboard[self_index] = new_entry;
        } else if worst_index != no_index {
            puzzle_box_account.leaderboard[worst_index] = new_entry;
        }
    }

    Ok(())
}
