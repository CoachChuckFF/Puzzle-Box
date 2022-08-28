import { useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

import("@solana/wallet-adapter-react-ui/styles.css");

export default function SolanaWalletProvider({ children }: any) {
    const NETWORK = import.meta.env.VITE_NETWORK;
    const RPC_URL = import.meta.env.VITE_RPC_URL;
    const AUTOCONNECT = import.meta.env.VITE_AUTOCONNECT;

    const endpoint = useMemo(() => RPC_URL, [NETWORK]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network: NETWORK }),
            new TorusWalletAdapter(),
        ],
        [NETWORK]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={AUTOCONNECT}>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
