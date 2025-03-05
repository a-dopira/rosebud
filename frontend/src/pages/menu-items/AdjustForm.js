import { memo, useCallback } from "react";

import useRosebud from "../../hooks/useRosebud";
import { useNotification } from "../../context/NotificationContext";

import DropdownField from "../../utils/DropdownField";


const AdjustForm = memo(({ 
    label, 
    value, 
    setValue, 
    list, 
    endpoint, 
    setList,
}) => {
    const { loadResources } = useRosebud();
    const { showNotification } = useNotification();
    
    const handleAdd = useCallback(async () => {
        if (!value?.name?.trim()) {
            showNotification('Пожалуйста, введите название');
            return;
        }
        
        const itemName = value.name.trim();
        
        try {
            const response = await loadResources(endpoint, { 
                method: 'POST', 
                body: { name: itemName },
            });
        
            const updatedList = [...list, response];
            setList(updatedList);
            setValue({ id: '', name: '' });
            
            if (response && response.message) {
                showNotification(response.message);
            }
        } catch (err) {
            console.log('Ошибка при добавлении:', err);
            
            if (err && err.detail) {
                showNotification(err.detail);
            } else if (err && err.error) {
                showNotification(err.error);
            } else {
                showNotification(`Ошибка при добавлении ${itemName}`);
            }
        }
    }, [value, endpoint, list, loadResources, setList, setValue, showNotification]);
    
    const handleDelete = useCallback(async () => {
        if (!value?.id) {
            showNotification('Пожалуйста, выберите элемент для удаления');
            return;
        }
        
        const itemName = value.name;
        const itemId = value.id;
        
        try {
            const response = await loadResources(`${endpoint}${itemId}/`, { 
                method: 'DELETE',
                silent: true
            });
            
            const updatedList = list.filter(item => item.id !== itemId);
            setList(updatedList);
            setValue({ id: '', name: '' });
            
            if (response && response.message) {
                showNotification(response.message);
            }
        } catch (err) {
            if (err && err.detail) {
                showNotification(err.detail);
            } else if (err && err.error) {
                showNotification(err.error);
            } else {
                showNotification(`Ошибка при удалении ${itemName}`);
            }
        }
    }, [value, endpoint, list, loadResources, setList, setValue, showNotification]);

    const renderButtons = useCallback(() => (
        <>
            <button className="btn-red" type="button" onClick={handleAdd}>Добавить</button>
            <button className="btn-red" type="button" onClick={handleDelete}>Удалить</button>
        </>
    ), [handleAdd, handleDelete]);

    return (
        <form className="px-10 sm:px-0 space-y-4 space-x-2">
            <label className="form-label inline-block w-full">{label}</label>
            <DropdownField 
                value={value}
                onChange={setValue}
                options={list}
                className="inline-block"
            />
            {renderButtons()}
        </form>
    );
});


export default AdjustForm;