import {createContext, useState, useEffect} from "react";
import { jwtDecode } from "jwt-decode";
import {useNavigate} from "react-router-dom";
import Loader from "../utils/Loading";

const AuthContext = createContext();

export default AuthContext

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem("authTokens")
            ? JSON.parse(localStorage.getItem("authTokens"))
            : null
    );
    

    const [user, setUser] = useState(() => 
        localStorage.getItem("authTokens")
            ? jwtDecode(localStorage.getItem("authTokens"))
            : null
    );


    const [loading, setLoading] = useState(true);

    const [loginErrors, setLoginErrors] = useState(false)

    const navigate = useNavigate();

    const loginUser = async (email, password) => {
        setLoading(true)
        const response = await fetch("http://127.0.0.1:8000/api/token/", {
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                email, password
            })
        })
        const data = await response.json()
        console.log(data);

        if(response.status === 200){
            console.log("Logged In");
            setLoginErrors(false)
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            localStorage.setItem("authTokens", JSON.stringify(data))
            navigate("home/")
            console.log('You successfully logged in!');
        } else {
            setLoginErrors(true)    
            console.log(response.status);
            console.log("there was a server issue");
            console.log('Username or password doesn\'nt exists');
        }
        setLoading(false)
    }

    const registerUser = async (email, username, password, password2) => {
        const response = await fetch("http://127.0.0.1:8000/api/register/", {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                email, username, password, password2
            })
        })
        if(response.status === 201){
            navigate("/login")
            console.log('Registration is successfull');
        } else {
            console.log(response.status);
            console.log("there was a server issue");
        }
    }

    const logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem("authTokens")
        navigate("/login")
        console.log('You successfully logged out!');
    }

    const contextData = {
        user, 
        setUser,
        authTokens,
        setAuthTokens,
        setLoginErrors,
        registerUser,
        loading,
        loginUser,
        logoutUser,
        loginErrors,
    }

    useEffect(() => {
        if (authTokens) {
            setUser(jwtDecode(authTokens.access))
        }
        setLoading(false)
    }, [authTokens, loading])

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <Loader/> : null}
            {children}
        </AuthContext.Provider>
    )

}