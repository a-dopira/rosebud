import { memo, useState, useCallback } from 'react';
import useCollection from '../../../hooks/useCollection';
import { useNotification } from '../../../context/NotificationContext';
import Dropdown from '../../../utils/DropdownField';
import RelatedItemsModal from './RelatedModal';
import ActionButtons from './RelatedButtons';

const AdjustForm = memo(
  ({ label, value, setValue, type, endpoint, list, relatedEntities, relationType }) => {
    const { showNotification } = useNotification();
    const [relatedPopupVisible, setRelatedPopupVisible] = useState(false);

    const collection = useCollection(endpoint, type);

    const handleAdd = useCallback(async () => {
      if (!value?.name?.trim()) {
        showNotification('Пожалуйста, введите название');
        return;
      }

      await collection.create({ name: value.name.trim() });
      setValue({ id: '', name: '' });
    }, [value, collection, setValue]);

    const handleDelete = useCallback(async () => {
      if (!value?.id) {
        showNotification('Пожалуйста, выберите элемент для удаления');
        return;
      }

      await collection.remove(value.id, value.name);
      setValue({ id: '', name: '' });
    }, [value, collection, setValue]);

    const handleAddRelated = useCallback(
      async (selectedItems) => {
        if (!value?.id || selectedItems.length === 0) return;

        const itemIds = selectedItems.map((item) => item.id);
        await collection.addRelationship(value.id, itemIds, relationType);
        setRelatedPopupVisible(false);
      },
      [value, collection, relationType]
    );

    const handleRemoveRelated = useCallback(
      async (relatedItemId) => {
        if (!value?.id) return;
        await collection.removeRelationship(value.id, [relatedItemId], relationType);
      },
      [value, collection, relationType]
    );

    const getRelatedItems = useCallback(() => {
      if (value?.id && relationType) {
        const selectedItem = list.find((item) => item.id === value.id);
        return selectedItem?.[relationType] || [];
      }
      return [];
    }, [value, list, relationType]);

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
