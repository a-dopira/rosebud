import { createContext, useState, useEffect, useMemo } from "react";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user-profile/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",    
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
        await fetch("http://127.0.0.1:8000/api/logout/", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
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
  }), [ user,authLoading ])

  return (
    <AuthContext.Provider value={ context }>
      {children}
    </AuthContext.Provider>
  );
};
