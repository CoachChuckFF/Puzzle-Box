import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import PageWrapper from "../components/PageWrapper/PageWrapper";

const LoginPage = () => {
    return (
        <PageWrapper>
            <WalletMultiButton />
        </PageWrapper>
    );
};
export default LoginPage;
