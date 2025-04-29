import { useCallback } from 'react';

import useAxios from './useAxios';

const useRosebud = () => {
  const { api } = useAxios();

  const loadResources = useCallback(
    async (path, options = {}) => {
      const { method = 'GET', body = null } = options;

      try {
        let response;

        switch (method.toUpperCase()) {
          case 'GET':
            response = await api.get(path);
            break;
          case 'POST':
            response = await api.post(path, body);
            break;
          case 'PUT':
            response = await api.put(path, body);
            break;
          case 'DELETE':
            response = await api.delete(path);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        if (response.status === 204) {
          return { message: 'Операция выполнена успешно' };
        }

        return response.data || {};
      } catch (error) {
        if (error.response && error.response.data) {
          const apiError = new Error(error.response.data.detail || 'Ошибка API');
          apiError.data = error.response.data;
          apiError.status = error.response.status;
          apiError.statusText = error.response.statusText;
          throw apiError;
        }

        throw new Error(error.message || 'Произошла ошибка при выполнении запроса');
      }
    },
    [api]
  );

  return { loadResources };
};

export default useRosebud;
