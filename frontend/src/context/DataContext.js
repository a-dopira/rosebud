import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import useRosebud from '../hooks/useRosebud';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { loadResources } = useRosebud();

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

  const lastLoadTime = useRef(0);
  const CACHE_DURATION = 5 * 60 * 1000;
  const initialLoadDone = useRef(false);

  const loadData = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now();

      if (
        !forceRefresh &&
        initialLoadDone.current &&
        data.groups.length > 0 &&
        now - lastLoadTime.current < CACHE_DURATION
      ) {
        return data;
      }

      try {
        const newData = await loadResources('adjustment/');
        setData(newData);
        lastLoadTime.current = now;
        initialLoadDone.current = true;
        return newData;
      } catch (err) {
        return null;
      }
    },
    [loadResources, data]
  );

  const loadGroups = useCallback(async () => {
    try {
      const groupsData = await loadResources('groups/');
      setData((prev) => ({
        ...prev,
        groups: groupsData,
      }));
      return groupsData;
    } catch (err) {
      return null;
    }
  }, [loadResources]);

  useEffect(() => {
    loadData();
  }, []);

  const updateData = useCallback((type, newData) => {
    setData((prev) => ({ ...prev, [type]: newData }));
  }, []);

  const value = {
    ...data,
    filter,
    setFilter,
    sortOrder,
    setSortOrder,
    updateData,
    loadData,
    loadGroups,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
