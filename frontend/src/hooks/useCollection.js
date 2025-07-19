import { useCallback, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import useAxios from './useAxios';
import { useNotification } from '../context/NotificationContext';

const useCollection = (endpoint, type) => {
  const { api } = useAxios();
  const { showNotification } = useNotification();
  const { loadAllData } = useContext(DataContext);

  const refresh = useCallback(async () => {
    await loadAllData(true);
  }, [loadAllData]);

  const create = useCallback(
    async (item) => {
      try {
        await api.post(endpoint, item);
        showNotification(`${item.name} успешно добавлен`);
        await refresh();
      } catch (error) {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.errors?.[0]?.detail ||
          error.message;
        showNotification(errorMessage);
        throw error;
      }
    },
    [api, endpoint, showNotification, refresh]
  );

  const remove = useCallback(
    async (id, name) => {
      try {
        await api.delete(`${endpoint}/${id}/`);
        showNotification(`${name} успешно удален`);
        await refresh();
      } catch (error) {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.errors?.[0]?.detail ||
          error.message;
        showNotification(errorMessage);
        throw error;
      }
    },
    [api, endpoint, showNotification, refresh]
  );

  const addRelationship = useCallback(
    async (id, relatedIds, relationType) => {
      try {
        await api.post(`${endpoint}/${id}/${relationType}/`, {
          data: relatedIds,
        });
        showNotification('Связи успешно добавлены');
        await refresh();
      } catch (error) {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.errors?.[0]?.detail ||
          error.message;
        showNotification(errorMessage);
        throw error;
      }
    },
    [api, endpoint, showNotification, refresh]
  );

  const removeRelationship = useCallback(
    async (id, relatedIds, relationType) => {
      try {
        await api.delete(`${endpoint}/${id}/${relationType}/`, {
          data: relatedIds,
        });
        showNotification('Связи успешно удалены');
        await refresh();
      } catch (error) {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.errors?.[0]?.detail ||
          error.message;
        showNotification(errorMessage);
        throw error;
      }
    },
    [api, endpoint, showNotification, refresh]
  );

  return {
    create,
    remove,
    addRelationship,
    removeRelationship,
    refresh,
  };
};

export default useCollection;
