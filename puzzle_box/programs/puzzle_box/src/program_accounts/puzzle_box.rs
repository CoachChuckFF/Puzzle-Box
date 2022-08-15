use crate::program_globals::constants::*;
use anchor_lang::prelude::*;

/// Puzzle Box Account
/// PDA: PUZZLE_BOX_SEED | Toy Maker | Puzzle ID
///
#[account]
pub struct PuzzleBox {
    // PDA Info
    pub toy_maker: Pubkey,
    pub puzzle_id: u8,
    pub bump: u8,

    // SHDW Info
    pub shdw_storage: Pubkey,

    // Game State
    pub creation_date: u64,
    pub leaderboard: Vec<LeaderboardEntry>,
    pub keys: Vec<Pubkey>,
}
pub fn get_puzzle_box_size(leaderboard_size: u8, key_count: u8) -> usize {
    return ACCOUNT_DISCRIMINATOR_SIZE + // Account
        PUBKEY_SIZE + // Toy Maker
        U8_SIZE + // Puzzle ID
        U8_SIZE + // Bump
        PUBKEY_SIZE + // SHDW Storage
        U64_SIZE + // Creation Date
        VEC_SIZE + (get_leaderboard_entry_size() * leaderboard_size as usize) + // Leaderboard
        VEC_SIZE + (PUBKEY_SIZE * key_count as usize); // Keys
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct LeaderboardEntry {
    pub player: Option<Pubkey>,
    pub score: u8,
    pub timestamp: u64,
}
pub fn get_leaderboard_entry_size() -> usize {
    return OPTION_SIZE + PUBKEY_SIZE + // Wallet
        U8_SIZE +                  // Score
        U64_SIZE; // Timestamp
}
