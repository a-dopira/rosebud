import useAxios from "./useAxios";
import { useContext } from "react";
import DataContext from "../context/DataContext";

export default function ConfirmPhotoDeleteModal({ roseId, setShowModal, setNotification }) {
    const api = useAxios()

    const { setRose } = useContext(DataContext)

    const deletePhoto = async (roseId) => {

        api.delete(`/roses/${roseId}/delete_photo/`)
        .then(response => {
                console.log(response.data);
                setShowModal(false)
                setNotification('Фото успешно удалено');
                setRose(prevState => ({...prevState, 'photo': response.data.photo}))
            }
        )
        .catch(err => {
            setNotification(err.message)
        })
    };

    const closeModal = () => {
        setShowModal(false);
    };
    
    const confirmDelete = () => {
        deletePhoto(roseId)
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 p-16">
            <div className="relative w-1/2 bg-white p-8 rounded-lg">
                <span className="absolute top-4 right-4 cursor-pointer text-red-500 text-3xl font-semibold hover:text-umbra" onClick={closeModal}>×</span>
                <p>Вы уверены, что хотите удалить фото?</p>
                <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 mt-4 rounded">Да, удалить</button>
                <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 mt-4 rounded">Нет, отмена</button>
            </div>
        </div>
    )
}
