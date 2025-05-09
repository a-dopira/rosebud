import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import useAxios from '../hooks/useAxios';

import DataContext from './DataContext';

import { buildMessage } from '../utils/MessageBuilder';

export const RoseListContext = createContext();

export const RoseListProvider = ({ children }) => {
  const { filter, loadGroups, sortOrder } = useContext(DataContext);

  const { api, isLoading } = useAxios();

  const [rosesList, setRosesList] = useState([]);
  const [rosesMessage, setRosesMessage] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const requestCache = useRef({});
  const lastRequest = useRef({ page: null, filterKey: null, sortKey: null });

  const loadRoses = useCallback(
    async (page = 1, customFilter = null, forceRefresh = false) => {
      const effectiveFilter = customFilter !== null ? customFilter : filter;
      const filterKey = JSON.stringify(effectiveFilter);
      const sortKey = sortOrder || 'none';
      const cacheKey = `${page}-${filterKey}-${sortKey}`;

      if (
        !forceRefresh &&
        lastRequest.current.page === page &&
        lastRequest.current.filterKey === filterKey &&
        lastRequest.current.sortKey === sortKey
      ) {
        return requestCache.current[cacheKey]?.data;
      }

      lastRequest.current = { page, filterKey, sortKey };

      if (!forceRefresh && requestCache.current[cacheKey]) {
        const cachedData = requestCache.current[cacheKey];
        const now = Date.now();

        if (cachedData.timestamp > now - 5 * 60 * 1000) {
          setRosesList(cachedData.roses);
          setRosesMessage(cachedData.message);
          setTotalPages(cachedData.data.totalPages);
          setCurrentPage(page);
          return cachedData.data;
        }
      }

      try {
        const params = new URLSearchParams();

        Object.entries(effectiveFilter).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
          }
        });

        if (sortOrder) {
          params.append('ordering', sortOrder === 'asc' ? 'title' : '-title');
        }

        params.append('page', page);

        const response = await api.get(`roses/?${params.toString()}`);

        const roses = response.data.results || [];
        const totalItems = response.data.count || 0;
        const totalPagesCount = Math.ceil(totalItems / 9);

        const message = buildMessage(params, roses);

        setRosesList(roses);
        setRosesMessage(message);
        setTotalPages(totalPagesCount);
        setCurrentPage(page);
      } catch (error) {
        console.error('Ошибка при загрузке роз:', error);
        setRosesMessage('Что-то пошло не так...');
        return { totalPages: 1, roses: [] };
      }
    },
    [api, filter, sortOrder]
  );

  const deleteRose = useCallback(
    async (roseId) => {
      try {
        const response = await api.delete(`/roses/${roseId}/`);

        requestCache.current = {};
        lastRequest.current = { page: null, filterKey: null, sortKey: null };

        const currentRosesCount = rosesList.length;

        if (currentRosesCount === 1 && currentPage > 1) {
          await loadRoses(currentPage - 1, filter, true);
        } else {
          await loadRoses(currentPage, filter, true);
        }

        if (loadGroups) {
          await loadGroups();
        }

        return {
          success: true,
          pagination: response.data.pagination || null,
        };
      } catch (error) {
        return {
          success: false,
          error: error?.response?.data?.detail || 'Ошибка при удалении розы',
        };
      }
    },
    [api, currentPage, filter, loadRoses, rosesList.length, loadGroups]
  );

  const handlePage = useCallback(
    (newPage) => {
      if (
        newPage >= 1 &&
        newPage <= totalPages &&
        newPage !== currentPage &&
        !isLoading
      ) {
        loadRoses(newPage, filter);
      }
    },
    [currentPage, filter, isLoading, loadRoses, totalPages]
  );

  const clearCache = useCallback(() => {
    requestCache.current = {};
    lastRequest.current = { page: null, filterKey: null, sortKey: null };
  }, []);

  useEffect(() => {
    if (isInitialLoad) {
      loadRoses(1, filter);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, filter, loadRoses]);

  useEffect(() => {
    if (!isInitialLoad) {
      loadRoses(1, filter);
    }
  }, [sortOrder, filter, loadRoses, isInitialLoad]);

  useEffect(() => {
    return () => {
      requestCache.current = {};
      lastRequest.current = { page: null, filterKey: null, sortKey: null };
    };
  }, []);

  const context = {
    rosesList,
    rosesMessage,
    totalPages,
    currentPage,
    loadRoses,
    deleteRose,
    setTotalPages,
    handlePage,
    clearCache,
    isLoading,
  };

  return (
    <RoseListContext.Provider value={context}>{children}</RoseListContext.Provider>
  );
};
