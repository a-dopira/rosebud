import { useRef, useState, useEffect, useCallback } from 'react';

import Arrow from './Arrow';

const AdaptiveMenu = ({ children, className, stickyPosition }) => {
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    isWideScreen: false,
  });

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const checkScroll = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const childrenWidth = contentRef.current.getBoundingClientRect().width;

    setScrollState({
      isWideScreen: clientWidth > childrenWidth + 100,
      canScrollLeft: scrollLeft > 10,
      canScrollRight: scrollLeft < scrollWidth - clientWidth - 10,
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      window.requestAnimationFrame(checkScroll);
    };

    window.addEventListener('resize', handleScroll);
    container.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('resize', handleScroll);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkScroll]);

  const scroll = useCallback((direction) => {
    containerRef.current?.scrollBy({
      left: direction * 200,
      behavior: 'smooth',
    });
  }, []);

  const { canScrollLeft, canScrollRight, isWideScreen } = scrollState;
  const showArrows = !isWideScreen && (canScrollLeft || canScrollRight);

  return (
    <div
      className={`w-full h-20 overflow-visible sticky ${stickyPosition} z-50 shadow-lg mx-auto ${className || ''}`}
    >
      <div
        ref={containerRef}
        className="overflow-x-auto overflow-y-visible menu-scrollbar-hide h-full relative w-full"
      >
        <div
          ref={contentRef}
          className={`flex items-center h-full px-7 gap-7 justify-between
            ${isWideScreen ? 'w-full' : 'min-w-max'}`}
        >
          {children}
        </div>
      </div>

      {showArrows && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-between">
          {canScrollLeft && (
            <button
              onClick={() => scroll(-1)}
              className="ml-0 h-full bg-white/90 p-2 shadow-lg pointer-events-auto
                      hover:bg-white transition-colors touch-manipulation"
            >
              <Arrow direction="15 18 9 12 15 6" />
            </button>
          )}

          <div className="flex-1" />

          {canScrollRight && (
            <button
              onClick={() => scroll(1)}
              className="mr-0 h-full bg-white/90 p-2 shadow-lg pointer-events-auto
                      hover:bg-white transition-colors touch-manipulation"
            >
              <Arrow direction="9 18 15 12 9 6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdaptiveMenu;
