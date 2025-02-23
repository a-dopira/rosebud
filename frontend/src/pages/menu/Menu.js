import { useRef, useState, useEffect, useCallback, memo, useMemo } from "react";

import SearchPanel from "../menu-items/SearchPanel";
import Logout from "../menu-items/Logout";
import CategorySelect from "../menu-items/CategorySelect";
import NavButton from "../../utils/NavButton";
import Arrow from "../../utils/Arrow";


const AdaptiveMenu = ({ children }) => {
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    isWideScreen: false
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
      canScrollRight: scrollLeft < scrollWidth - clientWidth - 10
    });
  }, []);

  // Объединяем обработчики событий в один useEffect
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      window.requestAnimationFrame(checkScroll);
    };

    window.addEventListener("resize", handleScroll);
    container.addEventListener("scroll", handleScroll, { passive: true });
    
    // Начальная проверка после монтирования
    handleScroll();

    return () => {
      window.removeEventListener("resize", handleScroll);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [checkScroll]);

  const scroll = useCallback((direction) => {
    containerRef.current?.scrollBy({
      left: direction * 200,
      behavior: "smooth"
    });
  }, []);

  const { canScrollLeft, canScrollRight, isWideScreen } = scrollState;
  const showArrows = !isWideScreen && (canScrollLeft || canScrollRight);
  
  return (
    <div className="w-full bg-amber-500 h-20 dotted-back mx-auto my-12 overflow-visible sticky top-5 z-20">
      <div 
        ref={containerRef}
        className="overflow-x-auto overflow-y-visible menu-scrollbar-hide h-full relative z-10"
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
          
          <div className="flex-1"/>
          
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

const Menu = memo(() => {
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
});

export default Menu;