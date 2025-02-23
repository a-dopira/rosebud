import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from "react";

import useRosebud from "../../hooks/useRosebud";
import { useNotification } from "../../context/NotificationContext";


const AdjustForm = ({ 
    label, 
    value, 
    setValue, 
    list, 
    endpoint, 
    notificationMessages, 
    listId, 
    setList,
}) => {
    const { loadResources } = useRosebud();
    const { showNotification } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value?.name || '');
    const [dropdownPosition, setDropdownPosition] = useState('bottom');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const MAX_VISIBLE_ITEMS = 5;

    const filteredList = useMemo(() => 
        list.filter(item => 
            item && 
            typeof item === 'object' && 
            item.name && 
            typeof item.name === 'string' &&
            item.name.toLowerCase().includes((inputValue || '').toLowerCase())
        ), [inputValue, list]
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (value?.name !== inputValue) {
            setInputValue(value?.name || '');
        }
    }, [value?.name]);

    const calculateDropdownPosition = useCallback(() => {
        if (isOpen && inputRef.current && dropdownRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect();
            const dropdownHeight = Math.min(
                filteredList.length * 41,
                MAX_VISIBLE_ITEMS * 41
            );
            
            const bottomSpace = window.innerHeight - inputRect.bottom - 30;
            setDropdownPosition(bottomSpace < dropdownHeight ? 'top' : 'bottom');
        }
    }, [isOpen, filteredList.length]);

    useLayoutEffect(() => {
        if (isOpen) {
            calculateDropdownPosition();
        }
    }, [isOpen, calculateDropdownPosition]);

    const handleInputChange = useCallback((e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        
        const selectedItem = list.find(item => item?.name === newValue);
        if (selectedItem) {
            setValue({ id: selectedItem.id, name: selectedItem.name });
            setIsOpen(false);
        } else {
            setValue({ id: '', name: newValue });
            if (!isOpen) setIsOpen(true);
        }
    }, [list, setValue, isOpen]);
    
    const handleItemSelect = useCallback((item) => {
        setValue({ id: item.id, name: item.name });
        setInputValue(item.name);
        setIsOpen(false);
    }, [setValue]);

    const handleAdd = useCallback(async () => {
        if (!value?.name?.trim()) {
            showNotification('Пожалуйста, введите название');
            return;
        }

        try {
            const data = await loadResources(endpoint, { method: 'POST', body: { name: value.name } });
            setList(prevList => [...prevList, data]);
            setValue({ id: '', name: '' });
            setInputValue('');
            showNotification(notificationMessages.addSuccess.replace('{name}', value.name));
        } catch (err) {
            showNotification(notificationMessages.addError.replace('{name}', value.name));
        }
    }, [endpoint, loadResources, notificationMessages, setList, setValue, showNotification, value?.name]);

    const handleDelete = useCallback(async () => {
        if (!value?.id) {
            showNotification(notificationMessages.deleteEmpty);
            return;
        }
        try {
            await loadResources(`${endpoint}${value.id}/`, { method: 'DELETE' });
            setList(prevList => prevList.filter(item => item.id !== value.id));
            setValue({ id: '', name: '' });
            setInputValue('');
            showNotification(notificationMessages.deleteSuccess.replace('{name}', value.name));
        } catch (err) {
            showNotification(notificationMessages.deleteError.replace('{name}', value.name));
        }
    }, [endpoint, loadResources, notificationMessages, setList, setValue, showNotification, value?.id, value?.name]);

    const dropdownContent = useMemo(() => {
        if (!isOpen || filteredList.length === 0) return null;
        
        return (
            <div 
                className={`absolute z-[60] w-full ${
                    dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                }`}
            >
                <ul 
                    className="rounded border-[1px] border-gray-300 bg-white shadow-md w-full"
                    style={{
                        maxHeight: filteredList.length > MAX_VISIBLE_ITEMS ? `${MAX_VISIBLE_ITEMS * 41}px` : 'auto',
                        overflowY: filteredList.length > MAX_VISIBLE_ITEMS ? 'auto' : 'visible'
                    }}
                >
                    {filteredList.map(item => (
                        <li 
                            key={item.id} 
                            className="drop-menu-item w-full hover:bg-gray-100 touch-auto"
                            onClick={() => handleItemSelect(item)}
                        >
                            <div className="cursor-pointer hover:bg-gray-300 p-3">
                                {item.name}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }, [isOpen, filteredList, dropdownPosition, handleItemSelect]);

    return (
        <form className="px-10 sm:px-0 space-y-4 space-x-2">
            <label className="form-label inline-block w-full">{label}</label>
            <div className="relative inline-block" ref={dropdownRef}>
                <input
                    ref={inputRef}
                    className="form-input"
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={() => !isOpen && setIsOpen(true)}
                />
                {dropdownContent}
            </div>
            <button className="btn-red" type="button" onClick={handleAdd}>Добавить</button>
            <button className="btn-red" type="button" onClick={handleDelete}>Удалить</button>
        </form>
    );
};


export default AdjustForm;