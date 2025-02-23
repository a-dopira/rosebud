import { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import AuthContext from "../../context/AuthContext";

function Logout() {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async (event) => {
        event.preventDefault();
        await logout();
        navigate('/login');
    };

    return (
        <button onClick={handleLogout} className="flex justify-center btn-red text-lg h-11 hover:text-white touch-none">
            Выйти
        </button>
    );
}

export default Logout;