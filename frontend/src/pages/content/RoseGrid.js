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
import { GenericModal } from '../../utils/RoseComponents/ModalProduct';

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
      location.pathname.includes('/home/collection') &&
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
          <Link to="/home/addrose">Добавить</Link>
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
        <GenericModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
          title="Подтверждение удаления"
          roseName={deleteModal.selectedRose?.name || 'Роза'}
        >
          <div className="text-center">
            <p className="mb-6 text-gray-700">
              Вы уверены, что хотите удалить{' '}
              {deleteModal.selectedRose?.name || 'эту розу'}?
            </p>

            {deleteModal.error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {deleteModal.error}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleRoseDeletion}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Да, удалить
              </button>
              <button
                onClick={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Нет, отмена
              </button>
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  );
});

export default RoseGrid;
