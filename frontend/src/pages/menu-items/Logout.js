import { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";

function Logout() {
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async (event) => {
        event.preventDefault();
        try {
            await fetch("http://127.0.0.1:8000/api/logout/", {
                method: "POST",
                credentials: "include",
        });
            setUser(null); 
            navigate('/login');
        } catch (error) {
            console.error("Ошибка при выходе:", error);
        }
    };

    return (
        <div className="bg-dotted-spacing-3.5 btn-red text-lg h-12">
            <Link to="/" onClick={handleLogout} className="hover:text-white">Выйти</Link>
        </div>
    );
}

export default Logout;