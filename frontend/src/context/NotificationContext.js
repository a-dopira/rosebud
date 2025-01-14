import React, { createContext, useState, useContext, useRef } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Refs to store timeouts
  const fadeOutTimeoutRef = useRef(null);
  const removeTimeoutRef = useRef(null);

  const showNotification = (message) => {
    // Clear any existing timeouts if a new notification appears quickly
    if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
    if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current);

    setNotification(message);
    setVisible(true);
    setIsFadingOut(false);

    // After 2 seconds, trigger fade-out
    fadeOutTimeoutRef.current = setTimeout(() => {
      setIsFadingOut(true);

      // Wait 0.5s for fade-out animation to complete, then unmount
      removeTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setNotification(null);
      }, 500); // matches the .5s fade-out
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
