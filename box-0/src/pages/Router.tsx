import { useContext } from "react";
import { StoreContext } from "../controllers/Store/StoreProvider";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";

const Router = () => {
    const {
        page: [page],
    } = useContext(StoreContext);

    switch (page) {
        case "Home Page":
            return <HomePage />;
        default:
            return <LoginPage />;
    }
};
export default Router;
