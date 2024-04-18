import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";

function Logout() {
    const { logoutUser } = useContext(AuthContext);

    const handleLogout = (event) => {
        event.preventDefault();
        logoutUser();
    };

    return (
        <div className="bg-dotted-spacing-3.5 btn-red text-lg h-12">
            <Link to="/" onClick={handleLogout} className="hover:text-white">Выйти</Link>
        </div>
    );
}

export default Logout;