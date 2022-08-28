import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect } from "react";

export enum AppPage {
    login = "Login Page",
    home = "Home Page",
}

export interface Store {
    isLoading: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    page: [AppPage, React.Dispatch<React.SetStateAction<AppPage>>];
    logout: [() => void];
}

export const DEFAULT_SET_FUNCTION = null as any;
export const DEFAULT_IS_LOADING = false;
export const DEFAULT_PAGE = AppPage.login;

export const NULL_STORE: Store = {
    isLoading: [DEFAULT_IS_LOADING, DEFAULT_SET_FUNCTION],
    page: [DEFAULT_PAGE, DEFAULT_SET_FUNCTION],
    logout: [DEFAULT_SET_FUNCTION],
};

export const logoutOfStore = (
    store: Store,
    disconnect: () => Promise<void>
) => {
    store.isLoading[1](true);
    disconnect().then(() => {
        store.isLoading[1](DEFAULT_IS_LOADING);
        store.page[1](DEFAULT_PAGE);
    });
};

export const StoreContext = React.createContext<Store>(NULL_STORE);

export default function StoreProvider({ children }: any) {
    // Is Loading
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    // Page
    const [page, setPage] = React.useState<AppPage>(AppPage.login);

    // Wallet Action
    const { publicKey, disconnect } = useWallet();
    const connected = publicKey !== null;

    const store: Store = {
        isLoading: [isLoading, setIsLoading],
        page: [page, setPage],
        logout: [
            () => {
                setIsLoading(true);
                logoutOfStore(store, disconnect);
            },
        ],
    };

    useEffect(() => {
        if (connected) {
            setPage(AppPage.home);
        } else if (page !== AppPage.login) {
            logoutOfStore(store, disconnect);
        }
    }, [connected]);

    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
}
