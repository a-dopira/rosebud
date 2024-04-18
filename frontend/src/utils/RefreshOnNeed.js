import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

const baseURL = "http://127.0.0.1:8000/api/";

const refreshTokenIfNeeded = async (authTokens, setAuthTokens, setUser) => {
    const user = jwtDecode(authTokens.access);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;
  
    if (isExpired) {
        const response = await axios.post(`${baseURL}token/refresh/`, {
            refresh: authTokens.refresh
        });
        localStorage.setItem("authTokens", JSON.stringify(response.data));
        setAuthTokens(response.data);
        setUser(jwtDecode(response.data.access));
    }
  };


export default refreshTokenIfNeeded