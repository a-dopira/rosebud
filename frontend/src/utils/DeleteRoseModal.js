import useAxios from "./useAxios";

function DeleteRoseModal({ roseId, setRosesList, setShowModal, setNotification }) {
    const api = useAxios()

    const deleteRose = async (id) => {
        api.delete(`/roses/${id}/`)
        .then(response => {
            setShowModal(false)
            setNotification(`Роза ${response.data.title} успешно удалена.`)
            setRosesList(prevRosesList => prevRosesList.filter(rose => rose.id !== id))
            }
        )
        .catch(err => {
            setNotification(err)
        })
    };

    const closeModal = () => {
        setShowModal(false);
    };
    
    const confirmDelete = () => {
        deleteRose(roseId)
    }

    return (
        <div id="delete-rose-modal-list" className="fixed items-center justify-center inset-0 overflow-auto bg-black bg-opacity-40 p-16">
            <div className="modal-content relative w-1/2 bg-white mx-auto my-auto p-8 rounded-lg">
                <span className="close absolute top-4 right-4 cursor-pointer text-red-500 text-3xl font-semibold hover:text-umbra" onClick={closeModal}>&times;</span>
                <p>Точно хочешь удалить розу?</p>
                <button id="confirm-delete" onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 mt-4 rounded">Да, удалить</button>
                <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 mt-4 rounded">Нет, вернуться</button>
            </div>
        </div>
    )
}

export default DeleteRoseModal