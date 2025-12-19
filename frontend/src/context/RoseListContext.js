import { createContext, useState, useCallback, useEffect, useRef } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import useAxios from '../hooks/useAxios';

import { buildMessage } from '../utils/MessageBuilder';

export const RoseListContext = createContext();

export const RoseListProvider = ({ children }) => {
  const { api } = useAxios();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [rosesList, setRosesList] = useState([]);
  const [rosesMessage, setRosesMessage] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [rosesLoading, setRosesLoading] = useState(false);

  const requestCache = useRef({});
  const lastRequestKey = useRef(null);

  const buildApiParamsFromUrl = useCallback(() => {
    const sp = new URLSearchParams(location.search);
    const params = new URLSearchParams();

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

  const loadRoses = useCallback(async (forceRefresh = false) => {
    const { params, page } = buildApiParamsFromUrl();
    const cacheKey = params.toString();

    // кеш — без лоадера
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

    setRosesLoading(true);
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
    } finally {
      setRosesLoading(false);
    }
  }, [api, buildApiParamsFromUrl]);

  useEffect(() => {
    loadRoses(false);
  }, [location.search, loadRoses]);

  const clearCache = useCallback(() => {
    requestCache.current = {};
    lastRequestKey.current = null;
  }, []);

  const handlePage = useCallback((newPage) => {
    const sp = new URLSearchParams(searchParams);
    sp.set('page', String(newPage));
    navigate(`?${sp.toString()}`, { replace: false });
  }, [navigate, searchParams]);

  const deleteRose = useCallback(async (roseId) => {
    try {
      await api.delete(`/roses/${roseId}/`);
      clearCache();
      await loadRoses(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.response?.data?.detail || 'Ошибка при удалении розы' };
    }
  }, [api, clearCache, loadRoses]);

  const context = {
    rosesList,
    rosesMessage,
    totalPages,
    currentPage,
    deleteRose,
    handlePage,
    rosesLoading,
  };

  return <RoseListContext.Provider value={context}>{children}</RoseListContext.Provider>;
};