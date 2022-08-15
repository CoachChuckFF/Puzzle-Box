import * as anchor from "@project-serum/anchor";
import * as SPL from "@solana/spl-token";
import { Program } from "@project-serum/anchor";
import { PuzzleBox } from "../target/types/puzzle_box";

async function get_puzzle_box(
    programProvider: Program<PuzzleBox>,
    toyMaker: anchor.web3.PublicKey,
    id: number
) {
    return await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("PUZZLE_BOX"), toyMaker.toBuffer(), Buffer.from([id])],
        programProvider.programId
    );
}

async function get_player(
    programProvider: Program<PuzzleBox>,
    puzzleBox: anchor.web3.PublicKey,
    player: anchor.web3.PublicKey
) {
    return await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), puzzleBox.toBuffer(), player.toBuffer()],
        programProvider.programId
    );
}

function getProgramProvider(
    program: Program<PuzzleBox>,
    wallet: anchor.web3.Keypair
): Program<PuzzleBox> {
    const newProvider = new anchor.AnchorProvider(
        program.provider.connection,
        new anchor.Wallet(wallet),
        {}
    );

    return new anchor.Program(
        program.idl as anchor.Idl,
        program.programId,
        newProvider
    ) as Program<PuzzleBox>;
}

async function puzzleBoxToString(
    program: Program<PuzzleBox>,
    puzzleBoxAccount: anchor.web3.PublicKey
) {
    const data = await program.account.puzzleBox.fetch(puzzleBoxAccount);
    const leaderboard = data.leaderboard as any[];
    let string = "\n------- Puzzle Box -------\n";
    string += `| Puzzle Box: ${puzzleBoxAccount.toString()}\n`;
    string += `| Key Count: ${data.keys.length}\n`;
    string += `| Leaderboard: ${data.keys.length}\n`;

    for (const entry of leaderboard) {
        string += `| --- ${entry.player} ( ${
            entry.score
        } ) @ ${entry.timestamp.toNumber()} \n`;
    }

    return string;
}

describe("puzzle_box", async () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.PuzzleBox as Program<PuzzleBox>;

    // ---------- GLOBAL PARAMS ------------
    const leaderboardSize = 2;
    const laportsPerAccount = 0.1 * anchor.web3.LAMPORTS_PER_SOL;

    // ---------- WALLETS ------------
    const toyMakerWallet = anchor.web3.Keypair.generate();
    const toyMakerProvider = getProgramProvider(program, toyMakerWallet);

    const player1Wallet = anchor.web3.Keypair.generate();
    const player1Provider = getProgramProvider(program, player1Wallet);

    const player2Wallet = anchor.web3.Keypair.generate();
    const player2Provider = getProgramProvider(program, player2Wallet);

    const player3Wallet = anchor.web3.Keypair.generate();
    const player3Provider = getProgramProvider(program, player3Wallet);

    // ---------- SHDW STORAGE ------------
    const shdwStorage = anchor.web3.Keypair.generate();

    // ---------- PUZZLE BOX ------------
    const puzzleBoxId = 0;
    const [puzzleBoxAccount, puzzleBoxAccountBump] = await get_puzzle_box(
        toyMakerProvider,
        toyMakerWallet.publicKey,
        puzzleBoxId
    );

    const puzzleBoxKeypairs = [
        anchor.web3.Keypair.generate(),
        anchor.web3.Keypair.generate(),
        anchor.web3.Keypair.generate(),
    ];

    const puzzleBoxKeys = [
        puzzleBoxKeypairs[0].publicKey,
        puzzleBoxKeypairs[1].publicKey,
        puzzleBoxKeypairs[2].publicKey,
    ];

    const badKeypair = anchor.web3.Keypair.generate();

    // ---------- LAMPORTS PRIZES ------------
    const prizeLamports = 0.15 * anchor.web3.LAMPORTS_PER_SOL;

    // ---------- SPL PRIZES ------------
    const prizeMint = anchor.web3.Keypair.generate();

    let puzzleBoxVault = undefined as undefined | anchor.web3.PublicKey;

    const playerVault = await SPL.getAssociatedTokenAddress(
        prizeMint.publicKey,
        player1Wallet.publicKey
    );

    // ---------- PLAYERS ------------
    const [player1Account] = await get_player(
        player1Provider,
        puzzleBoxAccount,
        player1Wallet.publicKey
    );

    const [player2Account] = await get_player(
        player2Provider,
        puzzleBoxAccount,
        player2Wallet.publicKey
    );

    const [player3Account] = await get_player(
        player3Provider,
        puzzleBoxAccount,
        player3Wallet.publicKey
    );

    before(async () => {
        const transaction = new anchor.web3.Transaction();

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: provider.publicKey,
                newAccountPubkey: toyMakerWallet.publicKey,
                lamports: laportsPerAccount,
                space: 0,
                programId: anchor.web3.SystemProgram.programId,
            })
        );

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: provider.publicKey,
                newAccountPubkey: player1Wallet.publicKey,
                lamports: laportsPerAccount,
                space: 0,
                programId: anchor.web3.SystemProgram.programId,
            })
        );

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: provider.publicKey,
                newAccountPubkey: player2Wallet.publicKey,
                lamports: laportsPerAccount,
                space: 0,
                programId: anchor.web3.SystemProgram.programId,
            })
        );

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: provider.publicKey,
                newAccountPubkey: player3Wallet.publicKey,
                lamports: laportsPerAccount,
                space: 0,
                programId: anchor.web3.SystemProgram.programId,
            })
        );

        await provider.sendAndConfirm(transaction, [
            toyMakerWallet,
            player1Wallet,
            player2Wallet,
            player3Wallet,
        ]);

        await SPL.createMint(
            toyMakerProvider.provider.connection,
            toyMakerWallet,
            toyMakerWallet.publicKey,
            toyMakerWallet.publicKey,
            0,
            prizeMint
        );
    });

    it("Create Puzzle Box", async () => {
        try {
            await toyMakerProvider.methods
                .createPuzzleBox(
                    puzzleBoxAccountBump,
                    puzzleBoxId,
                    leaderboardSize,
                    puzzleBoxKeys
                )
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    shdwStorage: shdwStorage.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    toyMaker: toyMakerWallet.publicKey,
                })
                .signers([])
                .rpc();

            // console.log(await toyMakerProvider.account.puzzleBox.fetch(puzzleBoxAccount));
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Add Reward ( Lamports )", async () => {
        try {
            const transaction = new anchor.web3.Transaction();

            transaction.add(
                anchor.web3.SystemProgram.transfer({
                    fromPubkey: provider.publicKey,
                    toPubkey: puzzleBoxAccount,
                    lamports: prizeLamports,
                })
            );

            await provider.sendAndConfirm(transaction, []);
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Add Reward ( SPL )", async () => {
        try {
            puzzleBoxVault = (
                await SPL.getOrCreateAssociatedTokenAccount(
                    toyMakerProvider.provider.connection,
                    toyMakerWallet,
                    prizeMint.publicKey,
                    puzzleBoxAccount,
                    true
                )
            ).address;

            await SPL.mintTo(
                toyMakerProvider.provider.connection,
                toyMakerWallet,
                prizeMint.publicKey,
                puzzleBoxVault,
                toyMakerWallet,
                1
            );
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Submit Key #1", async () => {
        try {
            await player1Provider.methods
                .submitKey()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player1Account,
                    keySubmission: puzzleBoxKeypairs[0].publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    player: player1Wallet.publicKey,
                })
                .signers([puzzleBoxKeypairs[0]])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Submit Key #2", async () => {
        try {
            await player1Provider.methods
                .submitKey()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player1Account,
                    keySubmission: puzzleBoxKeypairs[1].publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    player: player1Wallet.publicKey,
                })
                .signers([puzzleBoxKeypairs[1]])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Submit Key #2 ( Player 2 )", async () => {
        try {
            await player2Provider.methods
                .submitKey()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player2Account,
                    keySubmission: puzzleBoxKeypairs[1].publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    player: player2Wallet.publicKey,
                })
                .signers([puzzleBoxKeypairs[1]])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Submit Key #2 ( Player 3 )", async () => {
        try {
            await player3Provider.methods
                .submitKey()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player3Account,
                    keySubmission: puzzleBoxKeypairs[1].publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    player: player3Wallet.publicKey,
                })
                .signers([puzzleBoxKeypairs[1]])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Submit Key #3 ( Player 3 )", async () => {
        try {
            await player3Provider.methods
                .submitKey()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player3Account,
                    keySubmission: puzzleBoxKeypairs[2].publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    player: player3Wallet.publicKey,
                })
                .signers([puzzleBoxKeypairs[2]])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Submit Key #1 ( Player 2 )", async () => {
        try {
            await player2Provider.methods
                .submitKey()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player2Account,
                    keySubmission: puzzleBoxKeypairs[0].publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    player: player2Wallet.publicKey,
                })
                .signers([puzzleBoxKeypairs[0]])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Submit Key #3", async () => {
        try {
            await player1Provider.methods
                .submitKey()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player1Account,
                    keySubmission: puzzleBoxKeypairs[2].publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    player: player1Wallet.publicKey,
                })
                .signers([puzzleBoxKeypairs[2]])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Submit Key #3 ( Again )", async () => {
        try {
            await player1Provider.methods
                .submitKey()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player1Account,
                    keySubmission: puzzleBoxKeypairs[2].publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    player: player1Wallet.publicKey,
                })
                .signers([puzzleBoxKeypairs[2]])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Submit Key #X ( Wrong Key )", async () => {
        try {
            await player1Provider.methods
                .submitKey()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player1Account,
                    keySubmission: badKeypair.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    player: player1Wallet.publicKey,
                })
                .signers([badKeypair])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Claim Lamports", async () => {
        try {
            await player1Provider.methods
                .claimLamports()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player1Account,
                    player: player1Wallet.publicKey,
                })
                .signers([])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Claim SPL", async () => {
        try {
            await player1Provider.methods
                .claimSpl()
                .accounts({
                    puzzleBoxAccount: puzzleBoxAccount,
                    playerAccount: player1Account,
                    playerVault: playerVault,
                    puzzleBoxVault: puzzleBoxVault,
                    player: player1Wallet.publicKey,
                })
                .signers([])
                .preInstructions([
                    SPL.createAssociatedTokenAccountInstruction(
                        player1Wallet.publicKey,
                        playerVault,
                        player1Wallet.publicKey,
                        prizeMint.publicKey
                    ),
                ])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Solana Error");
        }
    });

    it("Print Results", async () => {
        console.log("Player 1 Account: ", player1Wallet.publicKey.toString());
        console.log("Player 2 Account: ", player2Wallet.publicKey.toString());
        console.log("Player 3 Account: ", player3Wallet.publicKey.toString());

        console.log(
            await puzzleBoxToString(toyMakerProvider, puzzleBoxAccount)
        );
    });
});
