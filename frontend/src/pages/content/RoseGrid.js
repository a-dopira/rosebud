import { useState, useContext, useEffect, useCallback, memo } from "react";
import { useLocation, Link } from "react-router-dom";

import DataContext from "../../context/DataContext";
import { RoseListContext } from "../../context/RoseListContext";

import Loader from "../../utils/Loaders/Loader";
import { RoseLoader } from "../../utils/Loaders/RoseLoader";
import DeleteNotificationModal from "../../utils/DeleteNotificationModal";

const RoseGrid = memo(function RoseGrid() {
  const [modal, setShowModal] = useState(false);
  const [selectedRose, setSelectedRose] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const location = useLocation();
  const { filter, setFilter } = useContext(DataContext);
  
  const { 
    rosesList, 
    rosesMessage,
    totalPages,
    currentPage,
    deleteRose,
    handlePage,
    isLoading
  } = useContext(RoseListContext);

  useEffect(() => {
    if (location.pathname.includes('home/collection') && 
        (Object.keys(filter).length > 0 || location.state?.resetFilter)) {
      setFilter({});
    }
    console.log('grid\'s useEffect');
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
      console.error('Ошибка при удалении розы:', error);
      setDeleteError('Ошибка при удалении розы');
    }
  }, [selectedRose, deleteRose]);

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

  console.log("rosegrid rerender");

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
              <div className="p-4 h-48 relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300" 
                       id={`loader-${rose.id}`}>
                    <RoseLoader />
                  </div>
                  
                  <img
                    src={rose.photo}
                    alt={rose.title}
                    className="h-full object-contain transition-opacity duration-300 opacity-0"
                    loading="lazy"
                    onLoad={(e) => {
                      e.target.classList.replace('opacity-0', 'opacity-100');
                      const loader = document.getElementById(`loader-${rose.id}`);
                      if (loader) loader.classList.add('opacity-0');
                    }}
                  />
                </div>
                <div>{rose.title}</div>
              </Link>
            </div>
          </div>
        ))}
      </div>


      {rosesList.length > 0 && (
        <div className="pagination mt-5 flex justify-center items-center space-x-4">
          <button
            onClick={() => handlePage(currentPage - 1)}
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
            onClick={() => handlePage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
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
          onDelete={handleRoseDeletion}
        />
      )}    
    </div>
  );
});

export default RoseGrid;
