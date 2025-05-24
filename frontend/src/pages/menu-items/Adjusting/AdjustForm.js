import { memo, useState, useCallback, useContext } from 'react';
import DataContext from '../../../context/DataContext';
import useRosebud from '../../../hooks/useRosebud';
import { useNotification } from '../../../context/NotificationContext';
import Dropdown from '../../../utils/DropdownField';
import RelatedItemsModal from './RelatedModal';
import ActionButtons from './RelatedButtons';

const AdjustForm = memo(
  ({
    label,
    value,
    setValue,
    list,
    endpoint,
    setList,
    type,
    relatedEntities,
    relationType,
    relatedEndpoint,
    relatedRemoveEndpoint,
  }) => {
    const { loadResources } = useRosebud();
    const { showNotification } = useNotification();
    const { updateData } = useContext(DataContext);
    const [relatedPopupVisible, setRelatedPopupVisible] = useState(false);

    const getRelatedItems = useCallback(() => {
      if (value?.id && relationType) {
        const selectedItem = list.find((item) => item.id === value.id);
        return selectedItem?.[relationType] || [];
      }
      return [];
    }, [value, list, relationType]);

    const handleAdd = useCallback(async () => {
      if (!value?.name?.trim()) {
        showNotification('Пожалуйста, введите название');
        return;
      }
      const itemName = value.name.trim();
      try {
        const response = await loadResources(`${endpoint}/`, {
          method: 'POST',
          body: { name: itemName },
        });
        if (response && response.items) {
          updateData(type, response.items);
        } else {
          const updatedList = [...list, response];
          setList(updatedList);
        }
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
          showNotification(`Ошибка при добавлении ${itemName}`);
        }
      }
    }, [
      value,
      endpoint,
      list,
      loadResources,
      updateData,
      setList,
      setValue,
      showNotification,
      type,
    ]);

    const handleDelete = useCallback(async () => {
      if (!value?.id) {
        showNotification('Пожалуйста, выберите элемент для удаления');
        return;
      }
      const itemName = value.name;
      const itemId = value.id;
      try {
        const response = await loadResources(`${endpoint}/${itemId}/`, {
          method: 'DELETE',
          silent: true,
        });
        if (response && response.items) {
          updateData(type, response.items);
        } else {
          const updatedList = list.filter((item) => item.id !== itemId);
          setList(updatedList);
        }
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
    }, [
      value,
      endpoint,
      list,
      loadResources,
      updateData,
      setList,
      setValue,
      showNotification,
      type,
    ]);

    const handleAddRelated = useCallback(
      async (selectedItems) => {
        if (!value?.id || selectedItems.length === 0) return;

        try {
          const itemIds = selectedItems.map((item) => item.id);
          const url = relatedEndpoint.replace('{id}', value.id);

          const response = await loadResources(url, {
            method: 'POST',
            body: { [`${relationType}_ids`]: itemIds },
          });

          if (response) {
            const updatedList = list.map((item) =>
              item.id === value.id ? response : item
            );
            setList(updatedList);
            setRelatedPopupVisible(false);
            showNotification('Связанные элементы успешно добавлены');
          }
        } catch (err) {
          if (err && err.detail) {
            showNotification(err.detail);
          } else {
            showNotification('Ошибка при добавлении связанных элементов');
          }
        }
      },
      [
        value,
        relatedEndpoint,
        loadResources,
        list,
        setList,
        relationType,
        showNotification,
      ]
    );

    const handleRemoveRelated = useCallback(
      async (relatedItemId) => {
        if (!value?.id) return;

        try {
          const url = relatedRemoveEndpoint.replace('{id}', value.id);

          const response = await loadResources(url, {
            method: 'POST',
            body: { [`${relationType}_ids`]: [relatedItemId] },
          });

          if (response) {
            const updatedList = list.map((item) =>
              item.id === value.id ? response : item
            );
            setList(updatedList);
            showNotification('Связанный элемент успешно удален');
          }
        } catch (err) {
          if (err && err.detail) {
            showNotification(err.detail);
          } else {
            showNotification('Ошибка при удалении связанного элемента');
          }
        }
      },
      [
        value,
        relatedRemoveEndpoint,
        loadResources,
        list,
        setList,
        relationType,
        showNotification,
      ]
    );

    const prepareModalData = useCallback(() => {
      if (!relatedEntities || !value?.id) return null;

      const currentRelatedItems = getRelatedItems();
      const availableRelatedItems = relatedEntities.filter(
        (item) => !currentRelatedItems.some((related) => related.id === item.id)
      );

      const itemTypeName = relationType === 'pests' ? 'вредителей' : 'грибков';

      return {
        currentItems: currentRelatedItems,
        availableItems: availableRelatedItems,
        itemTypeName,
        title: `Управление ${itemTypeName}`,
      };
    }, [relatedEntities, value, getRelatedItems, relationType]);

    const modalData = prepareModalData();

    return (
      <form className="mb-6 space-y-2">
        <label className="label-partials">{label}</label>
        <Dropdown value={value} onChange={setValue} options={list} className="w-full" />

        <ActionButtons
          onAdd={handleAdd}
          onDelete={handleDelete}
          onManageRelations={() => setRelatedPopupVisible(true)}
          hasRelations={!!relatedEntities}
          relationType={relationType}
          isItemSelected={!!value?.id}
        />

        {modalData && (
          <RelatedItemsModal
            isOpen={relatedPopupVisible}
            onClose={() => setRelatedPopupVisible(false)}
            title={modalData.title}
            itemName={value?.name || ''}
            currentItems={modalData.currentItems}
            availableItems={modalData.availableItems}
            onRemoveItem={handleRemoveRelated}
            onAddItems={handleAddRelated}
            itemTypeName={modalData.itemTypeName}
          />
        )}
      </form>
    );
  }
);

export default AdjustForm;
