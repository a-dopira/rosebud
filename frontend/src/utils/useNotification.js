import { useState, useEffect } from 'react';

export const useNotification = () => {
    const [notification, setNotification] = useState(null);
    const [visible, setVisible] = useState(false);

    const setNotificationMessage = (message) => {
        setNotification(null);
        setTimeout(() => setNotification(message), 0);
    };

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [notification]);

    return { notification, visible, setNotificationMessage };
};
