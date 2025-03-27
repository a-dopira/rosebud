import { useState, useContext, useEffect, useCallback, useRef, memo } from 'react';
import { useLocation, Link } from 'react-router-dom';

import DataContext from '../../context/DataContext';
import { RoseListContext } from '../../context/RoseListContext';

import Loader from '../../utils/Loaders/Loader';
import {
  Pagination,
  RoseCard,
  SortDropdown,
} from '../../utils/RoseGridComponents/RoseGridComponents';
import DeleteNotificationModal from '../../utils/DeleteNotificationModal';

const RoseGrid = memo(function RoseGrid() {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    selectedRose: null,
    error: null,
  });

  const gridRef = useRef(null);
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

  const getScrollPosition = useCallback(() => window.scrollY, []);

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

  const openDeleteModal = useCallback((rose) => {
    setDeleteModal({
      isOpen: true,
      selectedRose: rose,
      error: null,
    });
  }, []);

  const handleRoseDeletion = useCallback(async () => {
    const { selectedRose } = deleteModal;

    if (!selectedRose?.id) {
      setDeleteModal((prev) => ({ ...prev, error: 'Неверный ID розы' }));
      return;
    }

    try {
      const result = await deleteRose(selectedRose.id);

      if (!result.success) {
        setDeleteModal((prev) => ({ ...prev, error: result.error }));
        return;
      }

      setDeleteModal({ isOpen: false, selectedRose: null, error: null });
    } catch (error) {
      setDeleteModal((prev) => ({ ...prev, error: 'Ошибка при удалении розы' }));
    }
  }, [deleteModal, deleteRose]);

  const handlePageChange = useCallback(
    (newPage) => {
      sessionStorage.setItem('scrollPosition', getScrollPosition().toString());
      handlePage(newPage);
    },
    [handlePage, getScrollPosition]
  );

  const handleSortSelect = useCallback(
    (sortType) => {
      sessionStorage.setItem('scrollPosition', getScrollPosition().toString());
      clearCache();
      setSortOrder(sortType);
    },
    [setSortOrder, getScrollPosition, clearCache]
  );

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
        {rosesMessage && (
          <div className="flex-grow">
            <div className="text-black md:text-3xl text-2xl mb-3 ml-8">
              {rosesMessage}
            </div>
          </div>
        )}

        <SortDropdown sortOrder={sortOrder} onSortSelect={handleSortSelect} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-4 max-w-7xl mx-auto">
        {rosesList.map((rose) => (
          <RoseCard key={rose.id} rose={rose} onDelete={openDeleteModal} />
        ))}
      </div>

      {rosesList.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {deleteModal.isOpen && (
        <DeleteNotificationModal
          itemId={deleteModal.selectedRose.id}
          itemType={deleteModal.selectedRose.name}
          apiEndpoint="roses"
          setShowModal={(isOpen) => setDeleteModal((prev) => ({ ...prev, isOpen }))}
          onDelete={handleRoseDeletion}
        />
      )}
    </div>
  );
});

export default RoseGrid;
