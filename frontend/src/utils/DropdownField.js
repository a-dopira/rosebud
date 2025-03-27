import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  memo,
} from 'react';

const Dropdown = memo(
  ({
    value,
    onChange,
    options,
    placeholder = '',
    maxVisibleItems = 5,
    className = '',
    inputClassName = '',
    dropdownClassName = '',
    itemClassName = '',
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value?.name || '');
    const [dropdownPosition, setDropdownPosition] = useState('bottom');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const filteredOptions = useMemo(() => {
      return options.filter(
        (item) =>
          item &&
          typeof item === 'object' &&
          item.name &&
          typeof item.name === 'string' &&
          item.name.toLowerCase().includes((inputValue || '').toLowerCase())
      );
    }, [options, inputValue]);

    const calculateDropdownPosition = useCallback(() => {
      if (isOpen && inputRef.current && dropdownRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const dropdownHeight = Math.min(
          filteredOptions.length * 41,
          maxVisibleItems * 41
        );

        const bottomSpace = window.innerHeight - inputRect.bottom - 30;
        setDropdownPosition(bottomSpace < dropdownHeight ? 'top' : 'bottom');
      }
    }, [isOpen, filteredOptions.length, maxVisibleItems]);

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    useEffect(() => {
      if (value?.name !== inputValue) {
        setInputValue(value?.name || '');
      }
    }, [value?.name, inputValue]);

    useLayoutEffect(() => {
      if (isOpen) {
        calculateDropdownPosition();

        window.addEventListener('resize', calculateDropdownPosition);
        return () => {
          window.removeEventListener('resize', calculateDropdownPosition);
        };
      }
    }, [isOpen, calculateDropdownPosition]);

    const handleInputChange = useCallback(
      (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        const selectedItem = options.find((item) => item?.name === newValue);
        if (selectedItem) {
          onChange({ id: selectedItem.id, name: selectedItem.name });
          setIsOpen(false);
        } else {
          onChange({ id: '', name: newValue });
          if (!isOpen) setIsOpen(true);
        }
      },
      [options, isOpen, onChange]
    );

    const handleInputClick = useCallback(() => {
      if (!isOpen) setIsOpen(true);
    }, [isOpen]);

    const handleItemSelect = useCallback(
      (item) => {
        onChange({ id: item.id, name: item.name });
        setInputValue(item.name);
        setIsOpen(false);
      },
      [onChange]
    );

    const renderDropdownItems = useMemo(() => {
      if (!isOpen || filteredOptions.length === 0) return null;

      return (
        <div
          className={`absolute z-[60] w-full ${
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${dropdownClassName}`}
        >
          <ul
            className="rounded border-[1px] border-gray-300 bg-white shadow-md w-full"
            style={{
              maxHeight:
                filteredOptions.length > maxVisibleItems
                  ? `${maxVisibleItems * 41}px`
                  : 'auto',
              overflowY:
                filteredOptions.length > maxVisibleItems ? 'auto' : 'visible',
            }}
          >
            {filteredOptions.map((item) => (
              <li
                key={item.id}
                className={`drop-menu-item w-full hover:bg-gray-100 touch-auto ${itemClassName}`}
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
    }, [
      isOpen,
      filteredOptions,
      dropdownPosition,
      maxVisibleItems,
      dropdownClassName,
      itemClassName,
      handleItemSelect,
    ]);

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <input
          ref={inputRef}
          className={`form-input ${inputClassName}`}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
        />
        {renderDropdownItems}
      </div>
    );
  }
);

export default Dropdown;
