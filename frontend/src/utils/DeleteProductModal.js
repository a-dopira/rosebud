import { useContext } from "react";
import DataContext from "../context/DataContext";
import useAxios from "./useAxios";

function DeleteProductModal({ productId, setShowModal, setNotification, productType, apiEndpoint }) {
    const api = useAxios()

    const { setRose } = useContext(DataContext)

    const deleteProduct = async (id) => {
        await api.delete(`/${apiEndpoint}/${id}/`)
        .then(response => {
            setShowModal(false)
            setNotification(`${productType} успешно удален.`)
            setRose(prevState => ({...prevState, [apiEndpoint]: prevState[apiEndpoint].filter(product => product.id !== id)}))
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
        deleteProduct(productId)
    }

    return (
        <div id={`delete-${productType}-modal-list`} className="fixed items-center justify-center inset-0 overflow-auto bg-black bg-opacity-40 p-16">
            <div className="modal-content relative w-1/2 bg-white mx-auto my-auto p-8 rounded-lg">
                <span className="close absolute top-4 right-4 cursor-pointer text-red-500 text-3xl font-semibold hover:text-umbra" onClick={closeModal}>×</span>
                <p>Точно хочешь удалить {productType}?</p>
                <button id={`confirm-delete-${productType}`} onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 mr-2 mt-4 rounded">Да, удалить</button>
                <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 mt-4 rounded">Нет, вернуться</button>
            </div>
        </div>
    )
}
export default DeleteProductModal
