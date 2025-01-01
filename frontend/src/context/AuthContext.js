import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/user-profile/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",    
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [isAuthenticated]);

  const context = {
    isAuthenticated,
    user,
    setIsAuthenticated,
    setUser,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={ context }>
      {children}
    </AuthContext.Provider>
  );
};
