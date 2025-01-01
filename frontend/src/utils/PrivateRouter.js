import {Navigate} from "react-router-dom"
import {useContext} from "react"
import AuthContext from "../context/AuthContext"


const PrivateRouter = ({children}) => {
    let {isAuthenticated} = useContext(AuthContext)
    return isAuthenticated ? children : <Navigate to="/login" replace /> 
}

export default PrivateRouter