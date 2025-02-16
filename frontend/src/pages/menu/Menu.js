import { useRef, useState, useEffect, useCallback } from "react";

import SearchPanel from "../menu-items/SearchPanel";
import Logout from "../menu-items/Logout";
import CategorySelect from "../menu-items/CategorySelect";
import NavButton from "../../utils/NavButton";

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);


const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Throttle гарантирует, что функция не будет вызвана чаще, 
// чем раз в указанный промежуток времени
const useThrottle = (callback, delay) => {
  const lastRun = useRef(0);
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    const now = Date.now();

    if (lastRun.current + delay < now) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      callback(...args);
      lastRun.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay);
    }
  }, [callback, delay]);
};

const AdaptiveMenu = ({ children }) => {
  const [scrollState, setScrollState] = useState({
    showArrows: false,
    canScrollLeft: false,
    canScrollRight: false,
    isWideScreen: false
  });
  
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const resizeObserver = useRef(null);

  const checkScroll = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    requestAnimationFrame(() => {
      const container = containerRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const childrenWidth = contentRef.current.getBoundingClientRect().width;
      
      setScrollState({
        isWideScreen: clientWidth > childrenWidth + 100,
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft < scrollWidth - clientWidth,
        showArrows: scrollWidth > clientWidth
      });
    });
  }, []);

  // Используем наш debounce хук для resize
  const debouncedCheckScroll = useDebounce(checkScroll, 100);
  
  // Используем наш throttle хук для scroll
  const throttledCheckScroll = useThrottle(checkScroll, 100);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    resizeObserver.current = new ResizeObserver(debouncedCheckScroll);
    resizeObserver.current.observe(container);

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [debouncedCheckScroll]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', throttledCheckScroll, { passive: true });
    checkScroll(); // Начальная проверка

    return () => {
      container.removeEventListener('scroll', throttledCheckScroll);
    };
  }, [throttledCheckScroll, checkScroll]);

  const scroll = useCallback((direction) => {
    if (!containerRef.current) return;
    
    const scrollAmount = 200;
    containerRef.current.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  const { showArrows, canScrollLeft, canScrollRight, isWideScreen } = scrollState;

  return (
    <div className="sticky top-5 z-[20]">
      <div className="w-full bg-amber-500 rounded-2xl h-20 dotted-back mx-auto my-12 relative overflow-visible">
        <div 
          ref={containerRef}
          className="overflow-x-auto overflow-y-visible menu-scrollbar-hide h-full relative z-10 transform translate-z-0"
        >
          <div 
            ref={contentRef}
            className={`inline-flex items-center h-full px-6 gap-6 transition-transform duration-300 overflow-visible
              ${isWideScreen ? 'w-full justify-between' : 'min-w-max'}`}
            style={{ willChange: 'transform' }}
          >
            {children}
          </div>
        </div>

        {(showArrows && (canScrollLeft || canScrollRight)) && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {canScrollLeft && (
              <button 
                onClick={() => scroll(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 rounded-r-lg p-2 shadow-lg 
                         hover:bg-white transition-colors pointer-events-auto transform translate-z-0"
                style={{ touchAction: 'manipulation' }}
              >
                <ArrowLeft />
              </button>
            )}

            {canScrollRight && (
              <button 
                onClick={() => scroll(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 rounded-l-lg p-2 shadow-lg 
                         hover:bg-white transition-colors pointer-events-auto transform translate-z-0"
                style={{ touchAction: 'manipulation' }}
              >
                <ArrowRight />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Menu = () => {
  return (
    <AdaptiveMenu>
      <SearchPanel />
      <Logout />
      <NavButton to="/home/collection">Коллекция</NavButton>
      <NavButton to="/addrose/">Добавить розу</NavButton>
      <NavButton to="/adjusting/">Настроить</NavButton>
      <CategorySelect />
    </AdaptiveMenu>
  );
};

export default Menu;