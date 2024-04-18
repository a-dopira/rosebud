import { useState, useEffect } from 'react';

const Notification = ({ message }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [message]);

    if (!visible) return null;

    return (
        <div className={`fixed items-center justify-center inset-0 overflow-auto z-20 p-16 transition-all duration-500 ${visible ? 'bg-black bg-opacity-40 animate-fadeIn' : 'bg-black bg-opacity-0'}`}>
            <div className={`modal-content relative w-1/2 bg-white mx-auto my-auto p-8 rounded-lg h-48 flex items-center justify-center transition-all duration-500 ${visible ? 'opacity-100 animate-fadeIn' : 'opacity-0'}`}>
                {message}
            </div>
        </div>
    );
};

export default Notification
