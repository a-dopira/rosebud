import useAxios from '../hooks/useAxios';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const DeleteNotificationModal = ({
        itemId,
        itemType,
        apiEndpoint,
        setShowModal,
        updateState,
    }) => {

    const api = useAxios();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const deleteItem = async () => {
        try {
            await api.delete(`/${apiEndpoint}/${itemId}/`);
            setShowModal(false);
            showNotification('Удаление успешно выполнено.');

            if (updateState) {
                updateState((prevState) =>
                    Array.isArray(prevState)
                        ? prevState.filter((item) => item.id !== itemId)
                        : { ...prevState, [apiEndpoint]: prevState[apiEndpoint].filter((item) => item.id !== itemId) }
                );
            }

            if (apiEndpoint === 'roses' && updateState) {
                const response = await api.get('/roses/');
                updateState(response.data.results.roses);
            }

            navigate('/home/collection/');

        } catch (error) {
            showNotification('Произошла ошибка при удалении.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 p-16">
            <div className="relative w-1/2 bg-white p-8 rounded-lg">
                <span
                    className="absolute top-4 right-4 cursor-pointer text-red-500 text-3xl font-semibold hover:text-umbra"
                    onClick={closeModal}
                >
                    ×
                </span>
                <p>Вы уверены, что хотите удалить {itemType}?</p>
                <button
                    onClick={deleteItem}
                    className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
                >
                    Да, удалить
                </button>
                <button
                    onClick={closeModal}
                    className="bg-gray-300 text-black px-4 py-2 mt-4 rounded"
                >
                    Нет, отмена
                </button>
            </div>
        </div>
    );
};

export default DeleteNotificationModal;