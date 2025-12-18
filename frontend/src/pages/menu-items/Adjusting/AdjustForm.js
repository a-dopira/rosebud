import { memo, useState, useCallback } from 'react';
import useCollection from '../../../hooks/useCollection';
import { useNotification } from '../../../context/NotificationContext';
import DropdownSelect from '../../../utils/DropdownSelect';
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

    const handleUpdateItems = useCallback(
      async (newRelationshipIds) => {
        if (!value?.id) return;

        await collection.updateRelationships(
          value.id,
          newRelationshipIds,
          relationType
        );
        setRelatedPopupVisible(false);
      },
      [value, collection, relationType]
    );

    return (
      <form className="mb-6 space-y-2">
        <label className="label-partials">{label}</label>

        <DropdownSelect
          value={value}
          options={list}
          onChange={setValue}
          placeholder="Выберите..."
        />

        <ActionButtons
          onAdd={handleAdd}
          onDelete={handleDelete}
          onManageRelations={() => setRelatedPopupVisible(true)}
          hasRelations={!!relatedEntities}
          relationType={relationType}
          isItemSelected={!!value?.id}
        />

        <RelatedItemsModal
          isOpen={relatedPopupVisible}
          onClose={() => setRelatedPopupVisible(false)}
          selectedItem={value}
          relatedEntities={relatedEntities}
          relationType={relationType}
          onUpdateItems={handleUpdateItems}
          items={list}
        />
      </form>
    );
  }
);

export default AdjustForm;
