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
          className="fixed inset-0 flex items-center justify-center z-[1001] animate-fade-in"
        >
          <div
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-lg p-6 max-w-[90%] md:max-w-[400px] shadow-3xl-rounded animate-fade-in"
          >
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between bg-gray-100 p-2 rounded-t-lg">
              <div className="text-sm text-gray-600 ml-2 truncate max-w-[130px]">
                {roseName}
              </div>
              <div className="font-bold text-center flex-1">
                {title}
              </div>
              <div className="w-[130px]"></div>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 p-1 rounded-full bg-white/20 hover:bg-white/30
                        transition-all duration-500 flex items-center justify-center"
              aria-label="close-modal"
            >
              <div className="relative w-8 h-8 rounded-full bg-white hover:bg-white/70 transition-all duration-300 flex items-center justify-center group">
                <span
                  className="absolute w-4 h-0.5 bg-black transform rotate-45 transition-colors duration-300 group-hover:bg-red-600"
                />
                <span
                  className="absolute w-4 h-0.5 bg-black transform -rotate-45 transition-colors duration-300 group-hover:bg-red-600"
                />
              </div>
            </button>
            
            <div className="mt-8">
              {children}
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  };
  