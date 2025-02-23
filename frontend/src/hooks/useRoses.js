import { useCallback, useState } from "react";
import useAxios from "./useAxios";

const useRoses = () => {
  const api = useAxios();
  
  const [rosesList, setRosesList] = useState([]);
  const [rosesMessage, setRosesMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const loadRoses = useCallback(async (page, filterObj) => {
    if (isLoading) return null;
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({ ...filterObj, page });
      const response = await api.get(`roses/?${params.toString()}`);
      
      const { message, results } = response.data;
      setRosesMessage(message || null);

      if (!results?.roses) {
        setRosesList([]);
        return {
          totalPages: 1,
          roses: []
        };
      }

      setRosesList(results.roses);
      return {
        totalPages: results.total_pages || 1,
        roses: results.roses
      };

    } catch (error) {
      setRosesMessage('Произошла ошибка при загрузке роз');
      setRosesList([]);
      return {
        totalPages: 1,
        roses: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [api, isLoading]);

  const addRose = useCallback(async (roseData) => {
    setIsLoading(true);
    try {
      const response = await api.post('roses/', roseData);
      setRosesMessage('Роза успешно добавлена');
      return response.data;
    } catch (error) {
      console.error('Error adding rose:', error);
      setRosesMessage('Ошибка при добавлении розы');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const deleteRose = useCallback(async (roseId) => {
    setIsLoading(true);
    try {
      await api.delete(`roses/${roseId}/`);
      setRosesList(prev => prev.filter(rose => rose.id !== roseId));
      setRosesMessage('Роза успешно удалена');
    } catch (error) {
      console.error('Error deleting rose:', error);
      setRosesMessage('Ошибка при удалении розы');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const updateRose = useCallback(async (roseId, roseData) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`roses/${roseId}/`, roseData);
      setRosesList(prev => 
        prev.map(rose => 
          rose.id === roseId ? { ...rose, ...response.data } : rose
        )
      );
      setRosesMessage('Роза успешно обновлена');
      return response.data;
    } catch (error) {
      console.error('Error updating rose:', error);
      setRosesMessage('Ошибка при обновлении розы');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const getRoseById = useCallback(async (roseId) => {
    setIsLoading(true);
    try {
      const response = await api.get(`roses/${roseId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rose:', error);
      setRosesMessage('Ошибка при загрузке розы');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  return {
    // data
    rosesList,
    rosesMessage,
    isLoading,
    totalPages,
    
    // state managers
    setRosesList,
    setTotalPages,
    setRosesMessage,
    
    // crud
    loadRoses,
    addRose,
    deleteRose,
    updateRose,
    getRoseById
  };
};

export default useRoses