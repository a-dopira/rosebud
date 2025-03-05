import { useState, useCallback } from "react";

import useAxios from "./useAxios";

const useRosebud = () => {
    const api = useAxios();
    const [loading, setLoading] = useState(0);

    const loadResources = useCallback(async (path, options = {}) => {
        const { method = 'GET', body = null } = options;
        
        setLoading(prevState => prevState + 1);
        
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
            console.error(`Error in ${method} ${path}:`, error);
            
            if (error.response && error.response.data) {
                throw {
                    ...error.response.data,
                    status: error.response.status,
                    statusText: error.response.statusText
                };
            }
            throw {
                detail: error.message || 'Произошла ошибка при выполнении запроса'
            };
        } finally {
            setLoading(prevState => prevState > 0 ? prevState - 1 : 0);
        }
    }, [api]);

    return { loadResources, loading };
};

export default useRosebud