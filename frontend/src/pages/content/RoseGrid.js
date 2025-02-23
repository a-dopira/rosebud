import { useState, useContext, useEffect, useCallback, memo } from "react";
import { useLocation, Link } from "react-router-dom";
import useRoses from "../../hooks/useRoses";

import DataContext from "../../context/DataContext";
import DeleteNotificationModal from "../../utils/DeleteNotificationModal";

const RoseGrid = memo(function RoseGrid() {
  const [modal, setShowModal] = useState(false);
  const [selectedRose, setSelectedRose] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previousFilter, setPreviousFilter] = useState(null);

  const location = useLocation();
  const { filter, setFilter } = useContext(DataContext);
  
  const { 
    rosesList, 
    rosesMessage, 
    isLoading,
    totalPages,
    loadRoses,
    deleteRose,
    setRosesList,
    setTotalPages 
  } = useRoses();

  useEffect(() => {
    const shouldResetFilter = location.pathname.includes('home/collection') && 
      (Object.keys(filter).length > 0 || location.state?.resetFilter);

    if (shouldResetFilter) {
      setPreviousFilter({});
      setFilter({});
      loadRoses(1, {}).then(response => {
        if (response?.totalPages) {
          setTotalPages(response.totalPages);
        }
      });
    }
  }, [location.pathname, location.state, filter, setFilter, loadRoses, setTotalPages]);

  useEffect(() => {
    const filterChanged = JSON.stringify(filter) !== JSON.stringify(previousFilter);
    
    if (filterChanged && !location.pathname.includes('home/collection')) {
      loadRoses(1, filter)
        .then(response => {
          if (response?.totalPages) {
            setTotalPages(response.totalPages);
          }
          setCurrentPage(1);
          setPreviousFilter(filter);
        });
    }
  }, [filter, loadRoses, previousFilter, location.pathname, setTotalPages]);

  useEffect(() => {
    const initialFilter = location.pathname.includes('home/collection') ? {} : filter;
    loadRoses(1, initialFilter)
      .then(response => {
        if (response?.totalPages) {
          setTotalPages(response.totalPages);
        }
        setCurrentPage(1);
        setPreviousFilter(initialFilter);
      });
  }, []); // eslint-disable-line

  const handlePageChange = useCallback(async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !isLoading) {
      const response = await loadRoses(newPage, filter);
      if (response?.totalPages) {
        setTotalPages(response.totalPages);
      }
      setCurrentPage(newPage);
    }
  }, [currentPage, totalPages, filter, loadRoses, isLoading, setTotalPages]);

  const openModal = useCallback((roseData) => {
    setSelectedRose(roseData);
    setShowModal(true);
  }, []);

  if (!rosesMessage && (!rosesList || rosesList.length <= 0)) {
    return (
      <div className="animate-fade-in space-y-8">
        <p className="text-xl">У вас пока нету роз. Добавьте новую розу!</p>
        <button className="btn-red">
          <Link to="home/addrose/">Добавить</Link>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {rosesMessage && (
        <div className="text-black text-3xl mb-3 ml-8">
          {rosesMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-4 max-w-7xl mx-auto">
        {rosesList.map((rose) => (
          <div id={rose.id} key={rose.id} className="flex justify-center relative isolate">
            <div className="rose-card">
              <button
                id="open-delete-modal"
                className="absolute top-2 right-2 p-1 text-red-500 text-3xl font-semibold hover:text-umbra z-10"
                onClick={() => openModal(rose)}
              >
                &times;
              </button>
              <Link to={`/${rose.id}/notes`} className="text-center w-full space-y-2">
                <img
                  src={rose.photo}
                  alt={rose.title}
                  className="p-4 h-48 object-contain"
                />
                <div>{rose.title}</div>
              </Link>
            </div>
          </div>
        ))}
      </div>


      {rosesList.length > 0 && (
        <div className="pagination mt-5 flex justify-center items-center space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
              ${currentPage === 1
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
            disabled={currentPage === totalPages}
            className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
              ${currentPage === totalPages
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
          onDelete={async () => {
            try {
              await deleteRose(selectedRose.id);
              setShowModal(false);
            } catch (error) {
              console.error('Error deleting rose:', error);
            }
          }}
          updateState={setRosesList}
        />
      )}    
    </div>
  );
});

export default RoseGrid;
