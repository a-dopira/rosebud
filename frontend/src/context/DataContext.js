import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import useAxios from '../hooks/useAxios';

export const DataContext = createContext();
export const DataProvider = ({ children }) => {
  const { api } = useAxios();

  const [data, setData] = useState({
    groups: [],
    breeders: [],
    pests: [],
    fungi: [],
    pesticides: [],
    fungicides: [],
  });

  const [filter, setFilter] = useState({});
  const [sortOrder, setSortOrder] = useState(null);

  const [loading, setLoading] = useState(false);
  const lastLoadTime = useRef(0);
  const CACHE_DURATION = 5 * 60 * 1000;

  const loadAllData = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now();

      if (
        !forceRefresh &&
        now - lastLoadTime.current < CACHE_DURATION &&
        data.groups.length > 0
      ) {
        return data;
      }

      setLoading(true);
      try {
        const response = await api.get('/adjustments/');
        setData(response.data);
        lastLoadTime.current = now;
        return response.data;
      } catch (error) {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api, data]
  );

  const updateData = useCallback((type, newData) => {
    setData((prev) => ({ ...prev, [type]: newData }));
  }, []);

  useEffect(() => {
    loadAllData();
  }, []);

  const value = {
    ...data,
    loading,
    updateData,
    loadAllData,
    filter,
    setFilter,
    sortOrder,
    setSortOrder,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
