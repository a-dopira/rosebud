import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export const GenericModal = ({ isOpen, onClose, title, children, roseName="Роза" }) => {
  const modalRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    };
  }, [isOpen]);

  const handleCloseModal = (e) => {
    if (modalRef.current === e.target) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[1000]"
        style={{ 
          backdropFilter: 'blur(2px)', 
          WebkitBackdropFilter: 'blur(2px)', 
          width: '100vw',
          height: '100vh'
        }} 
      />
      
      <div
        ref={modalRef}
        onClick={handleCloseModal}
        className="fixed inset-0 flex items-center justify-center z-[1001] animate-fade-in p-4"
      >
        <div
          ref={modalContentRef}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-lg p-6 max-w-[90%] md:max-w-[400px] max-h-[90vh] overflow-y-auto shadow-3xl-rounded animate-fade-in"
        >
          <div className="absolute top-0 left-0 right-0 flex items-center bg-gray-100 p-2 rounded-t-lg sticky z-10">
            <div className="text-sm text-gray-600 ml-2 truncate basis-1/3">
              {roseName}
            </div>
            <div className="font-bold text-center basis-1/3">
              {title}
            </div>
            <div className="flex justify-end basis-1/3">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center"
                aria-label="close-modal"
              >
                <div className="relative w-6 h-6 flex items-center justify-center group">
                  <span
                    className="absolute w-4 h-0.5 bg-gray-600 transform rotate-45 transition-colors duration-300 group-hover:bg-red-600"
                  />
                  <span
                    className="absolute w-4 h-0.5 bg-gray-600 transform -rotate-45 transition-colors duration-300 group-hover:bg-red-600"
                  />
                </div>
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
  