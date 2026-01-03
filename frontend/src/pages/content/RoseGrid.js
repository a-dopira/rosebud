import { useState, useContext, useCallback, useRef, memo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';

import { RoseListStateContext } from '../../context/RoseListContext';
import { RoseListActionsContext } from '../../context/RoseListContext';
import Loader from '../../utils/Loaders/Loader';

import {
  Pagination,
  RoseCard,
  SortDropdown,
} from '../../utils/RoseGridComponents/RoseGridComponents';
import { GenericModal } from '../../utils/RoseComponents/ModalProduct';

const RoseGrid = memo(function RoseGrid() {
  const [selectedRose, setSelectedRose] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const gridRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { rosesList, rosesMessage, totalPages, currentPage, rosesLoading } =
    useContext(RoseListStateContext);

  const { deleteRose, handlePage } = useContext(RoseListActionsContext);

  const openDeleteModal = useCallback((rose) => {
    setSelectedRose(rose);
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
      setSelectedRose(null);
    } catch (error) {
      setDeleteError('Ошибка при удалении розы');
    }
  }, [selectedRose, deleteRose]);

  const handleSortSelect = useCallback(
    (sortType) => {
      const sp = new URLSearchParams(searchParams);
      if (sortType === 'AZ') sp.set('ordering', 'title');
      else if (sortType === 'ZA') sp.set('ordering', '-title');
      else sp.delete('ordering');

      sp.set('page', '1');
      navigate(`?${sp.toString()}`, { replace: false });
    },
    [navigate, searchParams]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      handlePage(newPage);
    },
    [handlePage]
  );

  console.log('rose grid');

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
    <div className="relative animate-fade-in space-y-5" ref={gridRef}>
      {rosesLoading &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Loader fullscreen />
          </div>,
          document.body
        )}

      <div className="flex justify-between items-center">
        {rosesMessage && (
          <div className="flex-grow">
            <div className="text-black md:text-3xl text-2xl mb-3 ml-8">
              {rosesMessage}
            </div>
          </div>
        )}

        <SortDropdown onSortSelect={handleSortSelect} />
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

      {selectedRose && (
        <GenericModal
          isOpen={!!selectedRose}
          onClose={() => {
            setSelectedRose(null);
            setDeleteError(null);
          }}
          title="Подтверждение удаления"
          roseName={selectedRose.title || 'Роза'}
        >
          <div className="text-center">
            <p className="mb-6 text-gray-700">
              Вы уверены, что хотите удалить {selectedRose.title || 'эту розу'}?
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {deleteError}
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
                onClick={() => setSelectedRose(null)}
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
