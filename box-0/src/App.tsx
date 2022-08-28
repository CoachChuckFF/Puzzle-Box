import Void from "./controllers/Void/Void";
import SolanaWalletProvider from "./controllers/SolanaProvider/SolanaProvider";
import StoreProvider from "./controllers/Store/StoreProvider";
import Router from "./pages/Router";

function App() {
    return (
        <>
            <Void />
            <SolanaWalletProvider>
                <StoreProvider>
                    <Router />
                </StoreProvider>
            </SolanaWalletProvider>
        </>
    );
}
export default App;
