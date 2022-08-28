import { useContext, useState } from "react";
import DialogBox from "../components/DialogBox/DialogBox";
import LogoutButton from "../components/LogoutButton/LogoutButton";
import PageWrapper from "../components/PageWrapper/PageWrapper";
import { StoreContext } from "../controllers/Store/StoreProvider";

const SAMPLE_MESSAGES = [
    "...",
    "Hi Mom",
    "Hi Dad",
    "Hi Sibling",
    "This is a really long message. I am trying to test what happens when text goes too far to the right of the screen. Will it wrap? Will it shrink? What happens if it goes under the arrow button? What about on an iphone? It still needs to be longer. I wonder if I can make the periods double space or if thats something a little more font specific? Im not sure, but I do want to play with the spacing a bit. Now I am just going to start listing things that I like to make this hella-long. Puppies, weightlifting, solana, girls, programming, swimming, biking, hiking.",
];

const HomePage = () => {
    const [messageIndex, setMessageIndex] = useState<number>(0);
    const {
        logout: [logout],
    } = useContext(StoreContext);

    const onNext = () => {
        let newIndex = messageIndex + 1;
        if (newIndex >= SAMPLE_MESSAGES.length) {
            newIndex = 0;
        }
        setMessageIndex(newIndex);
    };

    return (
        <PageWrapper>
            <LogoutButton onLogout={logout} />
            <DialogBox
                message={SAMPLE_MESSAGES[messageIndex]}
                onNext={onNext}
            />
        </PageWrapper>
    );
};
export default HomePage;
