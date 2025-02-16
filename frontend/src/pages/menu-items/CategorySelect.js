import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import DataContext from "../../context/DataContext";
import dropdown_arrow from '../../assets/icons/down-arrow-svgrepo-com.svg'


function CategorySelect() {
    const { groups, loadGroups, setFilter } = useContext(DataContext);
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const dropdownStyleRef = useRef({});
    const [dropdownStyle, setDropdownStyle] = useState({});

    useEffect(() => {
        loadGroups();
    }, []);

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

    // Обработчик скролла и ресайза
    const handlePositionUpdate = useCallback(() => {
        if (isOpen) {
            updateDropdownPosition();
        }
    }, [isOpen, updateDropdownPosition]);

    // Обработчик кликов вне dropdown
    const handleClickOutside = useCallback((event) => {
        if (isOpen &&
            buttonRef.current &&
            dropdownRef.current &&
            !buttonRef.current.contains(event.target) &&
            !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, [isOpen]);

    // Обработчик нажатия клавиши Escape
    const handleEscapeKey = useCallback((event) => {
        if (isOpen && event.key === 'Escape') {
            setIsOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            updateDropdownPosition();
            window.addEventListener('scroll', handlePositionUpdate);
            window.addEventListener('resize', handlePositionUpdate);
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        } else {
            window.removeEventListener('scroll', handlePositionUpdate);
            window.removeEventListener('resize', handlePositionUpdate);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        }

        return () => {
            window.removeEventListener('scroll', handlePositionUpdate);
            window.removeEventListener('resize', handlePositionUpdate);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, handlePositionUpdate, handleClickOutside, handleEscapeKey]);

    return (
        <>
            <div
                className="menu flex-shrink-0 justify-center w-40"
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="group cursor-pointer">
                    <div className="dotted-back px-5 py-2 rounded font-bold
                        text-xl flex justify-between w-full bg-white shadow-sm gap-3.5">
                        Категории
                        <img width="10" src={dropdown_arrow} alt="dropdown-arrow" />
                    </div>
                </div>
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="z-[60]"
                >
                    <ul className="rounded border-[1px] border-gray-300 
                        bg-white shadow-md w-full">
                        {groups.map(group => (
                            <li key={group.id} className="drop-menu-item w-full hover:bg-gray-100">
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
