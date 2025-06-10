import { useState, useEffect, useMemo, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxios from '../hooks/useAxios';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { api } = useAxios();

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('auth/user/');
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка при проверке аутентификации:', err);
      setUser(null);
      return null;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      await api.post('auth/token/', { email, password });

      const userData = await fetchUserProfile();
      if (userData) {
        navigate('/home');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Ошибка при входе в систему:', err);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (email, username, password, password2) => {
    try {
      setLoading(true);
      const response = await api.post('auth/register/', {
        email,
        username,
        password,
        password2,
      });

      if (response.status === 201) {
        showNotification('Регистрация успешна! Пожалуйста, войдите в систему.');
        navigate('/login');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.data) {
        setAuthError(error.response.data);
        showNotification('Ошибка регистрации. Проверьте введенные данные.');
      } else {
        setAuthError({ message: 'Ошибка при соединении с сервером' });
        showNotification('Ошибка соединения с сервером.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };
  const updateUserProfile = async (formData) => {
    try {
      setLoading(true);
      const response = await api.patch('auth/user/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setUser(response.data);
        showNotification('Профиль успешно обновлен!');
        return true;
      }
      return false;
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
    setLoading(true);
    try {
      await api.post('auth/logout/');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при запросе на logout:', error);
      setUser(null);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('auth/token/refresh/');

      if (response.status === 200) {
        const userData = await fetchUserProfile();
        return !!userData;
      }
      return false;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);

      if (
        error.response &&
        error.response.data &&
        (error.response.data.detail?.includes('истек') ||
          error.response.data.detail?.includes('expired'))
      ) {
        setUser(null);
        return false;
      }
      return false;
    }
  };

  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const userData = await fetchUserProfile();
      if (userData) {
        return true;
      }

      const refreshResult = await refreshToken();
      return refreshResult;
    } catch (error) {
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      await checkAuth();
      setAuthLoading(false);
    };

    initAuth();
  }, []);

  const context = useMemo(
    () => ({
      user,
      authLoading,
      loading,
      registerUser,
      updateUserProfile,
      logout,
      login,
    }),
    [user, authLoading, loading]
  );

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
};
