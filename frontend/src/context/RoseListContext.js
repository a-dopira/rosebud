import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import useAxios from "../hooks/useAxios";

import DataContext from "./DataContext";

export const RoseListContext = createContext();

export const RoseListProvider = ({ children }) => {
    const { filter, loadGroups } = useContext(DataContext);

    const api = useAxios();
  
    const [rosesList, setRosesList] = useState([]);
    const [rosesMessage, setRosesMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    
    const requestCache = useRef({});
    const lastRequest = useRef({ page: null, filterKey: null });
    
    const loadRoses = useCallback(async (page = 1, customFilter = null, forceRefresh = false) => {
        const effectiveFilter = customFilter !== null ? customFilter : filter;
        const filterKey = JSON.stringify(effectiveFilter);
        const cacheKey = `${page}-${filterKey}`;
        
        if (!forceRefresh && 
            lastRequest.current.page === page && 
            lastRequest.current.filterKey === filterKey) {
        console.log('Предотвращен дублирующий запрос:', { page, filter: effectiveFilter });
        return requestCache.current[cacheKey]?.data;
        }
        
        lastRequest.current = { page, filterKey };
        
        if (!forceRefresh && requestCache.current[cacheKey]) {
        const cachedData = requestCache.current[cacheKey];
        const now = Date.now();
        
        if (cachedData.timestamp > now - 5 * 60 * 1000) {
            console.log('Использую кэшированные данные:', cacheKey);
            setRosesList(cachedData.roses);
            setRosesMessage(cachedData.message);
            setTotalPages(cachedData.data.totalPages);
            setCurrentPage(page);
            return cachedData.data;
        }
        }
        
        setIsLoading(true);
        
        try {
        const params = new URLSearchParams();
        
        Object.entries(effectiveFilter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
            }
        });
        
        params.append('page', page);
        
        const response = await api.get(`/roses/?${params.toString()}`);
        
        const roses = response.data.results.roses;
        const totalPagesCount = response.data.results.total_pages;
        const message = response.data.message || null;
        
        setRosesList(roses);
        
        if (roses.length === 0) {
            setRosesMessage('Нет роз по заданному поиску. Попробуй что-то другое...');
        } else {
            setRosesMessage(message);
        }
        
        setTotalPages(totalPagesCount);
        setCurrentPage(page);
        
        const responseData = { 
            totalPages: totalPagesCount,
            roses: roses
        };
        
        requestCache.current[cacheKey] = {
            data: responseData,
            roses: roses,
            message: message,
            timestamp: Date.now()
        };
        
        setIsLoading(false);
        return responseData;
        } catch (error) {
        console.error('Ошибка при загрузке роз:', error);
        setRosesMessage('Что-то пошло не так...');
        setIsLoading(false);
        return { totalPages: 1, roses: [] };
        }
    }, [api, filter]);
    
    const deleteRose = useCallback(async (roseId) => {
        try {
        const response = await api.delete(`/roses/${roseId}/`);
        
        requestCache.current = {};
        lastRequest.current = { page: null, filterKey: null };
        
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
            pagination: response.data.pagination || null
        };
        } catch (error) {
        console.error('Ошибка при удалении розы:', error);
        return { 
            success: false, 
            error: error?.response?.data?.detail || 'Ошибка при удалении розы' 
        };
        }
    }, [api, currentPage, filter, loadRoses, rosesList.length, loadGroups]);
    
    const handlePage = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !isLoading) {
        loadRoses(newPage, filter);
        }
    }, [currentPage, filter, isLoading, loadRoses, totalPages]);
    
    const clearCache = useCallback(() => {
        requestCache.current = {};
        lastRequest.current = { page: null, filterKey: null };
    }, []);
    
    useEffect(() => {
        loadRoses(1, filter);
    }, [filter, loadRoses]);
    
    useEffect(() => {
        return () => {
        requestCache.current = {};
        lastRequest.current = { page: null, filterKey: null };
        };
    }, []);
    
    const context = {
        rosesList,
        rosesMessage,
        isLoading,
        totalPages,
        currentPage,
        loadRoses,
        deleteRose,
        setTotalPages,
        handlePage,
        clearCache
    };

    return (
        <RoseListContext.Provider value={context}>
            {children}
        </RoseListContext.Provider>);
};