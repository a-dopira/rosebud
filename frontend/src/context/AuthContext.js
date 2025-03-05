import { useState, useEffect, useMemo, createContext } from "react";
import useAxios from "../hooks/useAxios"; 

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const api = useAxios();

  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const response = await api.get("/user-profile/");
      setUser(response.data);
    } catch (err) {
      console.error("Ошибка при проверке аутентификации:", err);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await api.post("/logout/");
      setUser(null);
      
      window.location.href = '/login';
      
    } catch (error) {
      console.error("Ошибка при запросе на logout:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const context = useMemo(() =>({
    user,
    authLoading,
    setUser,
    checkAuth,
    logout,
  }), [ user, authLoading ]);

  return (
    <AuthContext.Provider value={ context }>
      {children}
    </AuthContext.Provider>
  );
};