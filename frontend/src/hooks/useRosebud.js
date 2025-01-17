import { useState, useCallback } from "react";

import useAxios from "./useAxios";

const useRosebud = () => {

    const api = useAxios();

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(0);

    const loadResources = useCallback(async (path) => {

        setLoading(prevState => prevState + 1);

        const response = await api.get(path);

        setLoading(prevState => prevState > 0 ? prevState - 1 : 0);
        
        return response.data;
        
    }, [api]);

    return { loadResources, loading, message }
};

export default useRosebud