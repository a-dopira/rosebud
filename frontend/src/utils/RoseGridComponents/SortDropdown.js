import { useState, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SortDropdown = memo(({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSort = (type) => {
    const sp = new URLSearchParams(searchParams);

    if (type === 'asc') {
      sp.set('ordering', 'title');
    } else if (type === 'desc') {
      sp.set('ordering', '-title');
    } else {
      sp.delete('ordering');
    }

    sp.set('page', '1');

    navigate(`?${sp.toString()}`);
    setIsOpen(false);
  };

  const sortOrder = searchParams.get('ordering');

  return (
    <div className={`relative ml-auto ${className}`}>
      <button
        onClick={toggleDropdown}
        className={`p-2 rounded ${sortOrder ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        aria-label="Сортировка"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded shadow-lg z-10 border">
          <div className="py-1">
            <button
              onClick={() => handleSort('asc')}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === 'asc' ? 'bg-grey-800' : ''}`}
            >
              По алфавиту (А - Я)
            </button>
            <button
              onClick={() => handleSort('desc')}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === 'desc' ? 'bg-grey-800' : ''}`}
            >
              По алфавиту (Я - А)
            </button>
            <button
              onClick={() => handleSort(null)}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === null ? 'bg-grey-800' : ''}`}
            >
              Сбросить сортировку
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default SortDropdown;
