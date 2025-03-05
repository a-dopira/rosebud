import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import DataContext from "../../context/DataContext";
import Arrow from "../../utils/Arrow";


function CategorySelect() {
    const { groups, setFilter } = useContext(DataContext);
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const dropdownStyleRef = useRef({});
    const [dropdownStyle, setDropdownStyle] = useState({});

    const updateDropdownPosition = useCallback(() => {
        if (buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            dropdownStyleRef.current = {
                position: 'fixed',
                top: `${buttonRect.bottom + 8}px`,
                left: `${buttonRect.left}px`,
                width: `${buttonRect.width}px`,
            };
            setDropdownStyle(dropdownStyleRef.current);
        }
    }, []);

    const handlePositionUpdate = useCallback(() => {
        if (isOpen) {
            updateDropdownPosition();
        }
    }, [isOpen, updateDropdownPosition]);

    const handleClickOutside = useCallback((event) => {
        if (isOpen &&
            buttonRef.current &&
            dropdownRef.current &&
            !buttonRef.current.contains(event.target) &&
            !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, [isOpen]);

    const handleEscape = useCallback((event) => {
        if (isOpen && event.key === 'Escape') {
            setIsOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        updateDropdownPosition();
        if (isOpen) {
            window.addEventListener('scroll', handlePositionUpdate);
            window.addEventListener('resize', handlePositionUpdate);
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        } else {
            window.removeEventListener('scroll', handlePositionUpdate);
            window.removeEventListener('resize', handlePositionUpdate);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('scroll', handlePositionUpdate);
            window.removeEventListener('resize', handlePositionUpdate);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);
    
    return (
        <>
            <button
                className="menu flex-shrink-0 justify-center w-[160px] touch-none"
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="group cursor-pointer">
                    <div className="px-5 py-2 rounded font-bold
                        text-xl flex justify-between w-full 
                        bg-white shadow-sm gap-2.5"
                    >
                        Категории
                        <Arrow direction="8 14 14 22 20 14" />
                    </div>
                </div>
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="z-[60]"
                >
                    <ul className="rounded border-[1px] border-gray-300 
                        bg-white shadow-md w-full">
                        {groups.map(group => (
                            <li key={group.id} className="drop-menu-item w-full hover:bg-gray-100 touch-auto">
                                <Link
                                    to={`home/group/${group.name}`}
                                    onClick={() => {
                                        setFilter({ group: group.name });
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="cursor-pointer hover:bg-gray-300 p-3">
                                        {group.name} ({group.rose_count})
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>,
                document.body
            )}
        </>
    );
}


export default CategorySelect
