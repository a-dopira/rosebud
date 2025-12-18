import { createContext, useState, useCallback, useEffect, useRef } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import useAxios from '../hooks/useAxios';

import { buildMessage } from '../utils/MessageBuilder';

export const RoseListContext = createContext();

export const RoseListProvider = ({ children }) => {
  const { api, isLoading } = useAxios();

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [rosesList, setRosesList] = useState([]);
  const [rosesMessage, setRosesMessage] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const requestCache = useRef({});
  const lastRequestKey = useRef(null);

  const buildApiParamsFromUrl = useCallback(() => {
    const sp = new URLSearchParams(location.search);

    const params = new URLSearchParams();

    // поддерживаем: search, group, ordering, page
    const search = sp.get('search');
    const group = sp.get('group');
    const ordering = sp.get('ordering');
    const page = sp.get('page') || '1';

    if (search) params.set('search', search);
    if (group) params.set('group', group);
    if (ordering) params.set('ordering', ordering);
    params.set('page', page);

    return { params, page: Number(page) || 1 };
  }, [location.search]);

  const loadRoses = useCallback(
    async (forceRefresh = false) => {
      const { params, page } = buildApiParamsFromUrl();
      const cacheKey = params.toString();

      if (
        !forceRefresh &&
        lastRequestKey.current === cacheKey &&
        requestCache.current[cacheKey]
      ) {
        const cached = requestCache.current[cacheKey];
        setRosesList(cached.roses);
        setRosesMessage(cached.message);
        setTotalPages(cached.totalPages);
        setCurrentPage(page);
        return;
      }

      lastRequestKey.current = cacheKey;

      if (!forceRefresh && requestCache.current[cacheKey]) {
        const cached = requestCache.current[cacheKey];
        if (cached.timestamp > Date.now() - 5 * 60 * 1000) {
          setRosesList(cached.roses);
          setRosesMessage(cached.message);
          setTotalPages(cached.totalPages);
          setCurrentPage(page);
          return;
        }
      }

      try {
        const response = await api.get(`/roses/?${params.toString()}`);
        const roses = response.data.results || [];
        const totalItems = response.data.count || 0;
        const totalPagesCount = Math.max(1, Math.ceil(totalItems / 9));

        const message = buildMessage(params, roses);

        requestCache.current[cacheKey] = {
          timestamp: Date.now(),
          roses,
          message,
          totalPages: totalPagesCount,
          count: totalItems,
        };

        setRosesList(roses);
        setRosesMessage(message);
        setTotalPages(totalPagesCount);
        setCurrentPage(page);
      } catch (e) {
        setRosesMessage('Что-то пошло не так...');
        setRosesList([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    },
    [api, buildApiParamsFromUrl]
  );

  // грузим при любом изменении URL query
  useEffect(() => {
    loadRoses(false);
  }, [location.search, loadRoses]);

  const clearCache = useCallback(() => {
    requestCache.current = {};
    lastRequestKey.current = null;
  }, []);

  const handlePage = useCallback(
    (newPage) => {
      const sp = new URLSearchParams(searchParams);
      sp.set('page', String(newPage));
      navigate(`?${sp.toString()}`, { replace: false });
    },
    [navigate, searchParams]
  );

  const deleteRose = useCallback(
    async (roseId) => {
      try {
        await api.delete(`/roses/${roseId}/`);

        // после удаления — чистим кэш и перезагружаем текущий URL
        clearCache();

        // если была 1 роза на странице и страница > 1 — откатимся на предыдущую
        const sp = new URLSearchParams(searchParams);
        const page = Number(sp.get('page') || 1);

        if (rosesList.length === 1 && page > 1) {
          sp.set('page', String(page - 1));
          navigate(`?${sp.toString()}`, { replace: false });
        } else {
          // принудительно перечитать текущий URL
          loadRoses(true);
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error?.response?.data?.detail || 'Ошибка при удалении розы',
        };
      }
    },
    [api, clearCache, loadRoses, navigate, rosesList.length, searchParams]
  );

  const context = {
    rosesList,
    rosesMessage,
    totalPages,
    currentPage,
    deleteRose,
    handlePage,
    clearCache,
    isLoading,
  };

  return (
    <RoseListContext.Provider value={context}>{children}</RoseListContext.Provider>
  );
};
