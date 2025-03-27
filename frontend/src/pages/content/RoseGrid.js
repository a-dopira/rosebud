import { useState, useContext, useEffect, useCallback, useRef, memo } from 'react';
import { useLocation, Link } from 'react-router-dom';

import DataContext from '../../context/DataContext';
import { RoseListContext } from '../../context/RoseListContext';

import Loader from '../../utils/Loaders/Loader';
import { RoseLoader } from '../../utils/Loaders/RoseLoader';
import SmartMedia from '../../utils/SmartMedia';
import DeleteNotificationModal from '../../utils/DeleteNotificationModal';

const RoseGrid = memo(function RoseGrid() {
  const [modal, setShowModal] = useState(false);
  const [selectedRose, setSelectedRose] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const gridRef = useRef(null);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const { filter, setFilter, sortOrder, setSortOrder } = useContext(DataContext);

  const {
    rosesList,
    rosesMessage,
    totalPages,
    currentPage,
    deleteRose,
    handlePage,
    isLoading,
    clearCache,
  } = useContext(RoseListContext);

  const scrollPosition = useCallback(() => {
    return window.scrollY;
  }, []);

  useEffect(() => {
    if (!isLoading && gridRef.current) {
      const savedPosition = sessionStorage.getItem('scrollPosition');
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('scrollPosition');
      }
    }
  }, [isLoading, rosesList]);

  useEffect(() => {
    if (
      location.pathname.includes('home/collection') &&
      (Object.keys(filter).length > 0 || location.state?.resetFilter)
    ) {
      setFilter({});
    }
  }, [location.pathname, location.state, filter, setFilter]);

  const openModal = useCallback((roseData) => {
    setSelectedRose(roseData);
    setShowModal(true);
    setDeleteError(null);
  }, []);

  const handleRoseDeletion = useCallback(async () => {
    if (!selectedRose?.id) {
      setDeleteError('Неверный ID розы');
      return;
    }

    try {
      const result = await deleteRose(selectedRose.id);

      if (!result.success) {
        setDeleteError(result.error);
        return;
      }

      setShowModal(false);
      setSelectedRose(null);
    } catch (error) {
      setDeleteError('Ошибка при удалении розы');
    }
  }, [selectedRose, deleteRose]);

  const handlePageChange = useCallback(
    (newPage) => {
      const position = scrollPosition();
      sessionStorage.setItem('scrollPosition', position.toString());

      handlePage(newPage);
    },
    [handlePage, scrollPosition]
  );

  const handleSortSelect = useCallback(
    (sortType) => {
      const position = scrollPosition();
      sessionStorage.setItem('scrollPosition', position.toString());

      clearCache();

      setSortOrder(sortType);

      setDropdownOpen(false);
    },
    [setSortOrder, scrollPosition, clearCache]
  );

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!rosesList) {
    return (
      <div className="animate-fade-in space-y-8">
        <p className="text-xl">У вас пока нету роз. Добавьте новую розу!</p>
        <button className="btn-red">
          <Link to="/addrose/">Добавить</Link>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5" ref={gridRef}>
      <div className="flex justify-between items-center">
        <div className="flex-grow">
          {rosesMessage && (
            <div className="text-black md:text-3xl text-2xl mb-3 ml-8">
              {rosesMessage}
            </div>
          )}
        </div>

        <div className="relative ml-auto" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className={`p-2 rounded ${
              sortOrder ? 'bg-red-500 text-white' : 'bg-gray-200'
            }`}
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

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={() => handleSortSelect('asc')}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === 'asc' ? 'bg-grey-800' : ''}`}
                >
                  По алфавиту (А - Я)
                </button>
                <button
                  onClick={() => handleSortSelect('desc')}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === 'desc' ? 'bg-grey-800' : ''}`}
                >
                  По алфавиту (Я - А)
                </button>
                <button
                  onClick={() => handleSortSelect(null)}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOrder === null ? 'bg-grey-800' : ''}`}
                >
                  Сбросить сортировку
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-4 max-w-7xl mx-auto">
        {rosesList.map((rose) => (
          <div
            id={rose.id}
            key={rose.id}
            className="flex justify-center relative isolate"
          >
            <div className="rose-card">
              <button
                id="open-delete-modal"
                className="absolute top-2 right-2 p-1 text-red-500 text-3xl font-semibold hover:text-umbra z-10"
                onClick={() => openModal(rose)}
              >
                &times;
              </button>
              <Link to={`/${rose.id}/notes`} className="text-center w-full space-y-2">
                <div className="p-4 h-48 relative flex items-center justify-center">
                  {rose.photo ? (
                    <SmartMedia
                      type="image"
                      src={rose.photo}
                      alt={rose.title}
                      className="h-full object-contain"
                      loaderId={`loader-${rose.id}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <RoseLoader />
                    </div>
                  )}
                </div>
                <div>{rose.title}</div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {rosesList.length > 0 && (
        <div className="pagination flex justify-center items-center space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
              ${
                currentPage === 1
                  ? 'bg-rose-800 cursor-not-allowed'
                  : 'hover:bg-rose-800 hover:translate-y-[-2px] hover:shadow-3xl-rounded'
              }`}
          >
            &#60;
          </button>
          <span
            className="bg-rose-500 border-solid hover:cursor-default border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md text-center"
            style={{ minWidth: '3.5rem' }}
          >
            {currentPage}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
              ${
                currentPage === totalPages
                  ? 'bg-rose-800 cursor-not-allowed'
                  : 'hover:bg-rose-800 hover:translate-y-[-2px] hover:shadow-3xl-rounded'
              }`}
          >
            &#62;
          </button>
        </div>
      )}

      {modal && (
        <DeleteNotificationModal
          itemId={selectedRose.id}
          itemType={selectedRose.name}
          apiEndpoint="roses"
          setShowModal={setShowModal}
          onDelete={handleRoseDeletion}
        />
      )}
    </div>
  );
});

export default RoseGrid;
