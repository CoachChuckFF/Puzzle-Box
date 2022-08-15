use crate::program_globals::constants::*;
use anchor_lang::prelude::*;

/// Puzzle Box Account
/// PDA: PLAYER_SEED | puzzle_box | owner
///
#[account]
pub struct Player {
    pub timestamps: Vec<u64>,
}

pub fn get_player_size(key_count: u8) -> usize {
    return ACCOUNT_DISCRIMINATOR_SIZE + // Account
        VEC_SIZE + (U64_SIZE * key_count as usize); // Timestamps
}
