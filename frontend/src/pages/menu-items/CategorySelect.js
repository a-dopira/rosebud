import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import DataContext from '../../context/DataContext';
import Arrow from '../../utils/Arrow';

function CategorySelect() {
  const { groups } = useContext(DataContext);
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [initialPosition, setInitialPosition] = useState({ top: 0, left: 0, width: 0 });
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const animationFrameRef = useRef(null);

  const ITEM_HEIGHT = 48;
  const MAX_VISIBLE_ITEMS = 5;
  const BORDER_AND_PADDING = 2;
  const DROPDOWN_OFFSET = 8;

  const calculateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return null;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    const dropdownHeight = Math.min(groups.length, MAX_VISIBLE_ITEMS) * ITEM_HEIGHT + BORDER_AND_PADDING;
    
    const spaceBelow = viewportHeight - buttonRect.bottom - DROPDOWN_OFFSET;
    const spaceAbove = buttonRect.top - DROPDOWN_OFFSET;
    
    let direction = 'down';
    let top = buttonRect.bottom + DROPDOWN_OFFSET;
    
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      direction = 'up';
      top = buttonRect.top - DROPDOWN_OFFSET - dropdownHeight;
    }

    return {
      top,
      left: buttonRect.left,
      width: buttonRect.width,
      direction,
      maxHeight: direction === 'up' ? 
        Math.min(dropdownHeight, spaceAbove) : 
        Math.min(dropdownHeight, spaceBelow)
    };
  }, [groups.length]);

  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current && dropdownRef.current && isOpen) {
      const newPosition = calculateDropdownPosition();
      if (!newPosition) return;

      const translateY = newPosition.top - initialPosition.top;
      const translateX = newPosition.left - initialPosition.left;
      
      dropdownRef.current.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
  }, [isOpen, initialPosition, calculateDropdownPosition]);

  const handlePositionUpdate = useCallback(() => {
    if (animationFrameRef.current) {
      return;
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      updateDropdownPosition();
      animationFrameRef.current = null;
    });
  }, [updateDropdownPosition]);

  const handleClickOutside = useCallback((event) => {
    if (
      isOpen &&
      buttonRef.current &&
      dropdownRef.current &&
      !buttonRef.current.contains(event.target) &&
      !dropdownRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  }, [isOpen]);

  const handleEscape = useCallback((event) => {
    if (isOpen && event.key === 'Escape') {
      setIsOpen(false);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const position = calculateDropdownPosition();
      if (position) {
        setInitialPosition({
          top: position.top,
          left: position.left,
          width: position.width
        });
        setDropdownDirection(position.direction);
      }
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      
      window.addEventListener('scroll', handlePositionUpdate, { passive: true });
      window.addEventListener('resize', handlePositionUpdate, { passive: true });
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('scroll', handlePositionUpdate);
      window.removeEventListener('resize', handlePositionUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handlePositionUpdate, handleClickOutside, handleEscape]);

  const maxHeight = Math.min(groups.length, MAX_VISIBLE_ITEMS) * ITEM_HEIGHT + BORDER_AND_PADDING;
  const needsScroll = groups.length > MAX_VISIBLE_ITEMS;

  const dropdownStyle = {
    position: 'fixed',
    top: `${initialPosition.top}px`,
    left: `${initialPosition.left}px`,
    width: `${initialPosition.width}px`,
  };

  return (
    <>
      <button
        className="menu flex-shrink-0 justify-center w-[160px] touch-none"
        ref={buttonRef}
        onClick={handleOpen}
      >
        <div className="group cursor-pointer">
          <div
            className="px-5 py-2 rounded font-bold
                        text-xl flex justify-between w-full 
                        bg-white shadow-sm gap-2.5"
          >
            Категории
            <Arrow 
              direction={isOpen && dropdownDirection === 'up' ? 
                "15 10 9 16 15 22" :
                "8 14 14 22 20 14"  
              } 
            />
          </div>
        </div>
      </button>

      {isOpen &&
        createPortal(
          <div 
            ref={dropdownRef} 
            style={dropdownStyle}
            className="z-[60] will-change-transform transition-transform duration-0"
          >
            <ul
              className={`rounded border-[1px] border-gray-300 bg-white shadow-lg w-full
                         ${needsScroll ? 'overflow-y-auto' : 'overflow-y-visible'}
                         scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300
                         hover:scrollbar-thumb-gray-400`}
              style={{ maxHeight: `${maxHeight}px` }}
            >
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="drop-menu-item w-full hover:bg-gray-100 touch-auto flex-shrink-0"
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  <Link
                    to={`/home/group/${group.name}/`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div 
                      className="cursor-pointer hover:bg-gray-300 p-3 h-full flex items-center
                                 transition-colors duration-150 text-sm"
                    >
                      <span className="truncate">
                        {group.name} <span className="text-gray-500">({group.rose_count})</span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* scroll indicators */}
            {needsScroll && (
              <>
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b 
                               from-white to-transparent pointer-events-none rounded-t" />
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t 
                               from-white to-transparent pointer-events-none rounded-b" />
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default CategorySelect;