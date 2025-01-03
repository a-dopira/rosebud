import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {

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
        console.log(data);
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    if (!user) {      
      checkAuth();
    }
  }, [user]);

  const context = {
    user,
    setUser,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={ context }>
      {children}
    </AuthContext.Provider>
  );
};
