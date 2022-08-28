import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export interface LogoutButtonProps {
    onLogout: () => void;
}

const LogoutButton = (props: LogoutButtonProps) => {
    return (
        <div
            onClick={() => {
                props.onLogout();
            }}
            className="fixed right-5 top-5 hover:animate-pulse px-2 py-2 shadow-lg opacity-70"
        >
            <FontAwesomeIcon
                size="lg"
                color="white"
                icon={faRightFromBracket}
            />
        </div>
    );
};
export default LogoutButton;
