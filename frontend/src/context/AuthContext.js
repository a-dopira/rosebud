import { useState, useEffect, useCallback, useMemo, createContext } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";
import useAxios from "../hooks/useAxios"; 

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const { showNotification } = useNotification(); 
  const navigate = useNavigate();
  
  const api = useAxios();

  const fetchUserProfile = useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await api.get("/user-profile/");
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error("Ошибка при проверке аутентификации:", err);
      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const registerUser = async (email, username, password, password2) => {
        try {
          setLoading(true);
          const response = await api.post('/register/', {
            email,
            username,
            password,
            password2
          });
    
          if (response.status === 201) {
            showNotification('Регистрация успешна! Пожалуйста, войдите в систему.');
            navigate('/login');
          }
        } catch (error) {
          console.error('Registration error:', error);
          if (error.response && error.response.data) {
            setAuthError(error.response.data);
            showNotification('Ошибка регистрации. Проверьте введенные данные.');
          } else {
            setAuthError({ message: 'Ошибка при соединении с сервером' });
            showNotification('Ошибка соединения с сервером.');
          }
        } finally {
          setLoading(false);
        }
      };

  const updateUserProfile = async (formData) => {
        try {
          setLoading(true);
          const response = await api.patch('/user-profile/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          if (response.status === 200) {
            // Обновляем данные пользователя в состоянии
            setUser(response.data);
            showNotification('Профиль успешно обновлен!');
            return true;
          }
        } catch (error) {
          console.error('Profile update error:', error);
          if (error.response && error.response.data) {
            setAuthError(error.response.data);
            showNotification('Ошибка обновления профиля. Проверьте введенные данные.');
          } else {
            setAuthError({ message: 'Ошибка при соединении с сервером' });
            showNotification('Ошибка соединения с сервером.');
          }
          return false;
        } finally {
          setLoading(false);
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
    const checkAuth = async () => {
      try {
        if (window.location.pathname.includes('/login') || 
            window.location.pathname.includes('/register')) {
          setAuthLoading(false);
          return;
        }
        await fetchUserProfile();
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [fetchUserProfile]);

  const context = useMemo(() => ({
    user,
    authLoading,
    setUser,
    registerUser,
    fetchUserProfile,
    updateUserProfile,
    logout,
  }), [user, authLoading]);

  return (
    <AuthContext.Provider value={context}>
      {children}
    </AuthContext.Provider>
  );
};