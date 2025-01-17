import { useState, useContext, useEffect } from "react"
import { Link } from "react-router-dom"

import DataContext from "../../context/DataContext"

import DeleteNotificationModal from "../../utils/DeleteNotificationModal";

function RoseGrid({ filter }) {

    const [modal, setShowModal] = useState(false)
    const [roseId, setRoseId] = useState(null)
    const [roseName, setRoseName] = useState(null)

    const { 
        rosesList, 
        setRosesList, 
        message,
        currentPage,
        totalPages,
        loadRoses
     } = useContext(DataContext)

    const openModal = (id, title) => {
        setRoseName(title)
        setRoseId(id);
        setShowModal(true);
    };

    if (!message && (!rosesList || rosesList.length <= 0)) {
        return (
            <div className="animate-fade-in">
                <p className="text-xl">У вас пока нету роз. Добавьте новую розу!</p>
                <button className="btn-red">
                    <Link to="home/addrose/">Добавить</Link>
                </button>
            </div>
        )
    }

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            loadRoses(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            loadRoses(currentPage + 1);
        }
    };

    return (
        <div className="animate-fade-in">
        {message && (
            <div className="text-black text-3xl mb-3 ml-8 z-20">
                {message}
            </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            { rosesList.map(rose => (
                <div id={rose.id} key={rose.id} className="mx-auto relative">
                    <div className="flex flex-col items-center h-60 w-56 cursor-pointer border-[1px] border-solid border-gray-300 rounded-3xl hover:translate-y-[-2px] hover:shadow-3xl shadow-1xl">
                        <Link to={`home/${rose.id}/notes`} className="text-center">
                            <img src={rose.photo} alt={rose.title} className="mb-2 p-4 h-48 object-contain"/>
                            <div>{rose.title}</div>
                        </Link>
                        <button id='open-delete-modal' className="absolute top-0 right-5 p-1 text-red-500 text-3xl font-semibold hover:text-umbra" onClick={() => openModal(rose.id, rose.title)}>&times;</button>
                    </div>
                </div>
            ))}
        </div>
        { rosesList.length > 0 ? (
            <div className="pagination mt-5 flex justify-center items-center space-x-4">
                <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
                        ${currentPage === 1 ? 'bg-rose-800 cursor-not-allowed' : 'hover:bg-rose-800 hover:translate-y-[-2px] hover:shadow-3xl'}`}
                >
                    &#60;
                </button>
                <span 
                    className="bg-rose-500 border-solid hover:cursor-default border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md text-center" 
                    style={{ minWidth: '3.5rem' }}
                >
                    { currentPage }
                </span>
                <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
                        ${currentPage === totalPages ? 'bg-rose-800 cursor-not-allowed' : 'hover:bg-rose-800 hover:translate-y-[-2px] hover:shadow-3xl'}`}
                >
                    &#62;
                </button>
            </div>
        ) : null
        }
        {modal && (
            <DeleteNotificationModal
                itemId={roseId}
                itemType={roseName}
                apiEndpoint="roses"
                setShowModal={setShowModal}
                updateState={setRosesList}
            />
        )}
        </div>
        
    )
}

export default RoseGrid