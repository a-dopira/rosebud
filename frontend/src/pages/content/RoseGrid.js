import { useState, useContext, useEffect, useCallback, memo } from "react"
import { useLocation, Link } from "react-router-dom"
import useAxios from "../../hooks/useAxios";

import DataContext from "../../context/DataContext";

import DeleteNotificationModal from "../../utils/DeleteNotificationModal";

const RoseGrid = memo(function RoseGrid() {
    const [modal, setShowModal] = useState(false);
    const [rose, setRose] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rosesList, setRosesList] = useState([]);
    const [message, setMessage] = useState(null);
  
    const api = useAxios();
    const location = useLocation();
    const { filter, setFilter } = useContext(DataContext);
  
    const loadRoses = useCallback(
      async (page, filterObj) => {
        try {
          const params = new URLSearchParams({ ...filterObj, page });
          const response = await api.get(`roses/?${params.toString()}`);
          const { results, message: serverMessage } = response.data;
  
          setRosesList(results.roses);
  
          if (serverMessage) {
            setMessage(serverMessage);
          } else if (results.roses.length === 0) {
            setMessage('Нет роз по заданному поиску. Попробуй что-то другое...');
          } else {
            setMessage(null);
          }
  
          return { totalPages: results.total_pages };
        } catch (error) {
          setMessage('Что-то пошло не так...');
          return { totalPages: 1 };
        }
      },
      [api] // api здесь из замыкания, так что лучше добавить в зависимости
    );
  
    // 1. Загружаем данные один раз при монтировании.
    useEffect(() => {
        loadRoses(currentPage, filter).then((response) => {
          setTotalPages(response.totalPages);
        });
        // eslint-disable-next-line
      }, []);
  
    // 2. При изменении фильтра сбрасываем страницу на 1 и делаем запрос.
    useEffect(() => {
        setCurrentPage(1);
        loadRoses(1, filter).then((response) => {
          setTotalPages(response.totalPages);
        });
      }, [filter, loadRoses]);
  
    // Если нужно сбрасывать фильтр при определённом пути:
    useEffect(() => {
        if (location.pathname === '/home/collection/') {
          // Если фильтр не пуст, сбросим, иначе не трогаем
          if (Object.keys(filter).length > 0) {
            setCurrentPage(1);
            setTotalPages(1);
            setFilter({});
          }
        }
      }, [location.pathname, filter, setFilter]);
  
    // Обработчики модального окна
    const openModal = useCallback((rose) => {
      setRose(rose);
      setShowModal(true);
    }, []);
  
    // 3. Обработчики пагинации вызывают loadRoses вручную
    const goToPreviousPage = () => {
      if (currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
  
        loadRoses(newPage, filter).then((response) => {
          setTotalPages(response.totalPages);
        });
      }
    };
  
    const goToNextPage = () => {
      if (currentPage < totalPages) {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);
  
        loadRoses(newPage, filter).then((response) => {
          setTotalPages(response.totalPages);
        });
      }
    };
  
    console.log('рендер RoseGrid, currentPage =', currentPage, 'filter =', filter);
  
    if (!message && (!rosesList || rosesList.length <= 0)) {
      return (
        <div className="animate-fade-in">
          <p className="text-xl">У вас пока нету роз. Добавьте новую розу!</p>
          <button className="btn-red">
            <Link to="home/addrose/">Добавить</Link>
          </button>
        </div>
      );
    }
  
    return (
      <div className="animate-fade-in">
        {message && (
          <div className="text-black text-3xl mb-3 ml-8 z-20">
            {message}
          </div>
        )}
  
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {rosesList.map((rose) => (
            <div id={rose.id} key={rose.id} className="mx-auto relative">
              <div className="flex flex-col items-center h-60 w-56 cursor-pointer border-[1px] border-solid border-gray-300 rounded-3xl hover:translate-y-[-2px] hover:shadow-3xl shadow-1xl">
                <Link to={`/${rose.id}/notes`} className="text-center">
                  <img
                    src={rose.photo}
                    alt={rose.title}
                    className="mb-2 p-4 h-48 object-contain"
                  />
                  <div>{rose.title}</div>
                </Link>
                <button
                  id="open-delete-modal"
                  className="absolute top-0 right-5 p-1 text-red-500 text-3xl font-semibold hover:text-umbra"
                  onClick={() => openModal(rose)}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
  
        {rosesList.length > 0 && (
          <div className="pagination mt-5 flex justify-center items-center space-x-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
                ${currentPage === 1
                  ? 'bg-rose-800 cursor-not-allowed'
                  : 'hover:bg-rose-800 hover:translate-y-[-2px] hover:shadow-3xl'
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
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
                ${currentPage === totalPages
                  ? 'bg-rose-800 cursor-not-allowed'
                  : 'hover:bg-rose-800 hover:translate-y-[-2px] hover:shadow-3xl'
                }`}
            >
              &#62;
            </button>
          </div>
        )}
  
        {modal && (
          <DeleteNotificationModal
            itemId={rose.id}
            itemType={rose.name}
            apiEndpoint="roses"
            setShowModal={setShowModal}
            updateState={setRosesList}
          />
        )}
      </div>
    );
  });

export default RoseGrid