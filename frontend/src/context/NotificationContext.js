import { createContext, useState, useContext, useRef, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const fadeOutTimeoutRef = useRef(null);
  const removeTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
      if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current);
    };
  }, []);

  const showNotification = (message) => {

    if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
    if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current);

    setNotification(message);
    setVisible(true);
    setIsFadingOut(false);

    fadeOutTimeoutRef.current = setTimeout(() => {
      setIsFadingOut(true);

      removeTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setNotification(null);
      }, 500);
    }, 2000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {visible && notification && (
        <div
          className={`
            fixed inset-0 flex items-center justify-center
            overflow-auto z-20 p-16
            bg-black bg-opacity-40
            ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}
          `}
        >
          <div
            className={`
              w-1/2 bg-white p-8 rounded-lg h-48
              flex items-center justify-center
              relative
              ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}
            `}
          >
            {notification}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};
