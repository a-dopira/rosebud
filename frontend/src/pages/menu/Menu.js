import { useRef, useState, useEffect } from "react";

import SearchPanel from "../menu-items/SearchPanel";
import Logout from "../menu-items/Logout";
import CategorySelect from "../menu-items/CategorySelect";
import NavButton from "../../utils/NavButton";


export default function Menu() {
    const menuRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
  
    const checkArrows = () => {
      const el = menuRef.current;
      if (!el) return;
      setShowLeftArrow(el.scrollLeft > 0);
      setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth);
    };
  
    useEffect(() => {
      const el = menuRef.current;
      if (el) {
        checkArrows();
        el.addEventListener('scroll', checkArrows);
        window.addEventListener('resize', checkArrows);
      }
      return () => {
        if (el) {
          el.removeEventListener('scroll', checkArrows);
        }
        window.removeEventListener('resize', checkArrows);
      };
    }, []);
  
    const scrollLeft = () => {
      menuRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    };
  
    const scrollRight = () => {
      menuRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    };
  
    return (
      <div className="relative my-12">
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-500 text-white p-2 rounded-full focus:outline-none"
          >
            &larr;
          </button>
        )}
  
        {/* Контейнер для меню с фиксированным gap между элементами */}
        <div
          ref={menuRef}
          className="flex w-full bg-amber-500 rounded-3xl px-3 h-24 dotted-back mx-auto items-center overflow-x-auto scrollbar-hide space-x-2"
        >
          <SearchPanel />
          <Logout />
          <NavButton to="home/collection/">Колекция</NavButton>
          <NavButton to="/addrose/">Добавить розу</NavButton>
          <NavButton to="/adjusting/">Настроить</NavButton>
          <CategorySelect />
        </div>
  
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-500 text-white p-2 rounded-full focus:outline-none"
          >
            &rarr;
          </button>
        )}
      </div>
    );
  }