import {
  useState,
  useRef,
  useEffect,
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
    className = '',
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value?.name || '');
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

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <input
          ref={inputRef}
          className="form-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
        />
        
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-[60] w-full top-full mt-1">
            <ul className="rounded border-[1px] border-gray-300 bg-white shadow-md w-full max-h-[205px] overflow-y-auto">
              {filteredOptions.map((item) => (
                <li
                  key={item.id}
                  className="drop-menu-item w-full hover:bg-gray-100 touch-auto"
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="cursor-pointer hover:bg-gray-300 p-3">{item.name}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

export default Dropdown;
