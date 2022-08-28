import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

export interface DialogBoxProps {
    message: string;
    onNext?: () => void;
    speedMS?: number;
}

const DialogBox = (props: DialogBoxProps) => {
    const [messageIndex, setMessageIndex] = useState<number>(0);
    const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout | undefined>();
    const [canContinue, setCanContinue] = useState<boolean>();
    const message = props.message;
    const partialMessage = message.substring(0, messageIndex);

    useEffect(() => {
        window.addEventListener("keydown", onKeyPress);

        return () => {
            window.removeEventListener("keydown", onKeyPress);
        };
    }, []);

    useEffect(() => {
        setMessageIndex(0);
        setCanContinue(false);
        setTimeoutID(undefined);
    }, [props.message]);

    useEffect(() => {
        if (messageIndex < message.length) {
            setTimeoutID(
                setTimeout(() => {
                    setMessageIndex(messageIndex + 1);
                }, props.speedMS ?? 55)
            );
        } else {
            setTimeout(() => {
                setCanContinue(true);
            }, 555);
        }
    }, [messageIndex]);

    const onKeyPress = (e: any) => {
        //it triggers by pressing the enter key
    };

    const onClick = () => {
        if (messageIndex < message.length) {
            clearTimeout(timeoutID);
            setMessageIndex(message.length);
        } else if (props.onNext && canContinue) {
            props.onNext();
        }
    };

    const renderDialogBox = () => {
        return (
            <div className="fixed w-screen h-1/5 left-0 right-0 bottom-5 px-5">
                <div className="h-full w-full border-white border-2 rounded shadow-lg bg-black/[0.89] pl-3 pr-8 py-3">
                    <p className={" h-full overflow-scroll text-white"}>
                        {partialMessage}
                    </p>
                </div>
            </div>
        );
    };

    const renderNextArrow = () => {
        if (!props.onNext || !canContinue) return null;
        return (
            <div className="fixed z-10 right-10 bottom-8 animate-pulse">
                <FontAwesomeIcon size="lg" color="white" icon={faAngleRight} />
            </div>
        );
    };

    return (
        <div onClick={onClick} onKeyDown={onKeyPress}>
            {renderDialogBox()}
            {renderNextArrow()}
        </div>
    );
};
export default DialogBox;
