import useAxios from "../../hooks/useAxios";
import { useNotification } from "../../context/NotificationContext";

const AdjustForm = ({ 
    label, 
    value, 
    setValue, 
    list, 
    endpoint, 
    notificationMessages, 
    listId, 
    setList,
}) => {

    const api = useAxios();
    const { showNotification } = useNotification();


    const handleAdd = async () => {
        try {
            const response = await api.post(endpoint, { name: value.name });
            setList(prevList => (prevList ? [...prevList, response.data] : [response.data]));
            setValue({ id: '', name: '' });
            showNotification(notificationMessages.addSuccess.replace('{name}', value.name));
        } catch (err) {
            if (err.response && err.response.status === 400) {
                showNotification(notificationMessages.addError.replace('{name}', value.name));
            } else {
                alert(err);
            }
        }
    };

    const handleDelete = async () => {
        if (!value.id) {
            showNotification(notificationMessages.deleteEmpty);
            return;
        }
        try {
            await api.delete(`${endpoint}${value.id}/`);
            setList(prevList => prevList.filter(item => item.id !== value.id));
            setValue({ id: '', name: '' });
            showNotification(notificationMessages.deleteSuccess.replace('{name}', value.name));
        } catch (err) {
            if (err.response && err.response.status === 404) {
                showNotification(notificationMessages.deleteError.replace('{name}', value.name));
            } else {
                showNotification('Произошла ошибка при удалении.');
            }
        }
    };

    return (
        <form className="block">
            <label className="text-black inline-block text-2xl font-bold w-full my-2">{label}</label>
            <input
                className="border-2 p-2 mr-2 rounded-md"
                type="text"
                value={value.name}
                list={listId}
                onChange={(e) => {
                    const selectedItem = list.find(item => item.name === e.target.value);
                    if (selectedItem) {
                        setValue({ id: selectedItem.id, name: selectedItem.name });
                    } else {
                        setValue({ id: '', name: e.target.value });
                    }
                }}
            />
            <datalist id={listId}>
                {list.map(item => <option key={item.id} value={item.name} />)}
            </datalist>
            <button className="btn-red mr-2" type="button" onClick={handleAdd}>Добавить</button>
            <button className="btn-red" type="button" onClick={handleDelete}>Удалить</button>
        </form>
    );
};

export default AdjustForm