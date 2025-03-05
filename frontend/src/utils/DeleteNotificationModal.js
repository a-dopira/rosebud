import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const DeleteNotificationModal = ({
        itemId,
        itemType,
        apiEndpoint,
        setShowModal,
        onDelete
      }) => {
        const { showNotification } = useNotification();
        
        const handleDelete = async () => {
          try {
            if (onDelete) {
              await onDelete();
              showNotification('Удаление успешно выполнено.');
            } else {
              showNotification('Ошибка: отсутствует обработчик удаления.');
            }
          } catch (error) {
            console.error('Ошибка при удалении:', error);
            showNotification('Произошла ошибка при удалении.');
          }
        };
        
        const closeModal = () => {
          setShowModal(false);
        };
      

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 p-16 z-[100]">
            <div className="relative w-1/2 bg-white p-8 rounded-lg space-x-2 space-y-2">
                <span
                    className="absolute top-4 right-4 cursor-pointer text-red-500 text-3xl font-semibold hover:text-umbra"
                    onClick={closeModal}
                >
                    ×
                </span>
                <p>Вы уверены, что хотите удалить {itemType}?</p>
                <button
                    onClick={handleDelete}
                    className="btn-red rounded"
                >
                    Да, удалить
                </button>
                <button
                    onClick={closeModal}
                    className="btn-gray rounded"
                >
                    Нет, отмена
                </button>
            </div>
        </div>
    );
};

export default DeleteNotificationModal;