import { useCallback, useState } from "react";
import useAxios from "./useAxios";

export const useRoses = () => {
  const api = useAxios();
  const [rosesList, setRosesList] = useState([]);
  const [rosesMessage, setRosesMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const loadRoses = useCallback(async (page = 1, filter = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      params.append('page', page);
      
      const response = await api.get(`/roses/?${params.toString()}`);
      
      // Обновляем список роз только если это обычное получение данных
      // В случае с handleRoseDeletion мы иногда вручную устанавливаем rosesList
      setRosesList(response.data.results.roses);
      
      if (response.data.results.roses.length === 0) {
        setRosesMessage('Нет роз по заданному поиску. Попробуй что-то другое...');
      } else {
        setRosesMessage(null);
      }
      
      setIsLoading(false);
      return { 
        totalPages: response.data.results.total_pages,
        roses: response.data.results.roses
      };
    } catch (error) {
      console.error('Ошибка при загрузке роз:', error);
      setRosesMessage('Что-то пошло не так...');
      setIsLoading(false);
      return { totalPages: 1, roses: [] };
    }
  }, [api]);

  const deleteRose = useCallback(async (roseId) => {
    try {
      await api.delete(`/roses/${roseId}/`);
      
      // Не изменяем локальный state - это будет сделано при перезагрузке данных
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка при удалении розы:', error);
      return { 
        success: false, 
        error: error?.response?.data?.detail || 'Ошибка при удалении розы' 
      };
    }
  }, [api]);

  return {
    rosesList,
    setRosesList,
    rosesMessage,
    setRosesMessage,
    isLoading,
    totalPages,
    setTotalPages,
    loadRoses,
    deleteRose
  };
};

export default useRoses