use anchor_lang::prelude::*;

#[error_code]
pub enum PuzzleBoxErrors {
    #[msg("General Error")]
    GeneralError,
}
