import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import PageWrapper from "../components/PageWrapper/PageWrapper";

const LoginPage = () => {
    return (
        <PageWrapper>
            <h1 className=" text-white align-middle text-center text-3xl mb-5">
                Puzzle Box
            </h1>
            <WalletMultiButton />
        </PageWrapper>
    );
};
export default LoginPage;
