import { useState, useContext } from "react"
import { Link } from "react-router-dom"

import { motion } from "framer-motion";

import DataContext from "../../context/DataContext"
import Notification from "../../utils/Notification";
import DeleteRoseModal from "../../utils/DeleteRoseModal";

function RoseGrid() {

    const [modal, setShowModal] = useState(false)
    const [roseId, setRoseId] = useState(null)
    const [notification, setNotification] = useState(null);
    const { rosesList, setRosesList, message } = useContext(DataContext)

    const openModal = (id) => {
        setRoseId(id);
        setShowModal(true);
    };

    if (!message && (!rosesList || rosesList.length <= 0)) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <p className="text-xl">У вас пока нету роз. Добавьте новую розу!</p>
                <button className="btn-red">
                    <Link to="/home/addrose/">Добавить</Link>
                </button>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
        {message && (
            <div className="text-black text-3xl mb-3 ml-8 z-20">
                {message}
            </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            { rosesList.map(rose => (
                <div id={rose.id} key={rose.id} className="mx-auto relative">
                    <div className="flex flex-col items-center h-60 w-56 cursor-pointer border-[1px] border-solid border-gray-300 rounded-3xl hover:translate-y-[-2px] hover:shadow-3xl shadow-1xl">
                        <Link to={`/home/${rose.id}/notes`} className="text-center">
                            <img src={rose.photo} alt={rose.title} className="mb-2 p-4 h-48 object-contain"/>
                            <div>{rose.title}</div>
                        </Link>
                        <button id='open-delete-modal' className="absolute top-0 right-5 p-1 text-red-500 text-3xl font-semibold hover:text-umbra" onClick={() => openModal(rose.id)}>&times;</button>
                    </div>
                </div>
            ))}
        </div>
        {modal && (
            <DeleteRoseModal roseId={roseId} setRosesList={setRosesList} setShowModal={setShowModal} setNotification={setNotification} />
        )}
        {notification && <Notification message={notification}/>}
        </motion.div>
        
    )
}

export default RoseGrid