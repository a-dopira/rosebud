import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import useAxios from '../hooks/useAxios';

import { buildMessage } from '../utils/MessageBuilder';

export const RoseListContext = createContext();
export const RoseListStateContext = createContext();
export const RoseListActionsContext = createContext();

export const RoseListProvider = ({ children }) => {
  const { api } = useAxios();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState({
    rosesList: [],
    rosesMessage: null,
    totalPages: 1,
    currentPage: 1,
    rosesLoading: false,
  });

  const requestCache = useRef({});

  const buildParams = useCallback(() => {
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

  const loadRoses = useCallback(
    async (forceRefresh = false) => {
      const { params, page } = buildParams();
      const cacheKey = params.toString();

      if (!forceRefresh && requestCache.current[cacheKey]) {
        const cached = requestCache.current[cacheKey];
        if (cached.timestamp > Date.now() - 5 * 60 * 1000) {
          setState((s) => ({
            ...s,
            rosesList: cached.roses,
            rosesMessage: cached.message,
            totalPages: cached.totalPages,
            currentPage: page,
          }));
          return;
        }
      }

      setState((s) => ({ ...s, rosesLoading: true }));

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

        setState((s) => ({
          ...s,
          rosesList: roses,
          rosesMessage: message,
          totalPages: totalPagesCount,
          currentPage: page,
          rosesLoading: false,
        }));
      } catch {
        setState((s) => ({
          ...s,
          rosesList: [],
          rosesMessage: 'Что-то пошло не так...',
          totalPages: 1,
          currentPage: 1,
          rosesLoading: false,
        }));
      }
    },
    [api, buildParams]
  );

  useEffect(() => {
    loadRoses(false);
  }, [location.search, loadRoses]);

  const deleteRose = useCallback(
    async (roseId) => {
      try {
        await api.delete(`/roses/${roseId}/`);
        requestCache.current = {};
        await loadRoses(true);
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Ошибка при удалении розы' };
      }
    },
    [api, loadRoses]
  );

  const handlePage = useCallback(
    (newPage) => {
      const sp = new URLSearchParams(searchParams);
      sp.set('page', String(newPage));
      navigate(`?${sp.toString()}`, { replace: false });
    },
    [navigate, searchParams]
  );

  const stateValue = useMemo(() => state, [state]);

  const actionsValue = useMemo(
    () => ({
      deleteRose,
      handlePage,
    }),
    [deleteRose, handlePage]
  );

  return (
    <RoseListStateContext.Provider value={stateValue}>
      <RoseListActionsContext.Provider value={actionsValue}>
        {children}
      </RoseListActionsContext.Provider>
    </RoseListStateContext.Provider>
  );
};
