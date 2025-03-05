import { createContext, useState, useCallback, useEffect } from "react";
import useRosebud from "../hooks/useRosebud";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { loadResources } = useRosebud();
    const [referenceData, setReferenceData] = useState({
        groups: [],
        breeders: [],
        pests: [],
        fungi: []
    });
    const [filter, setFilter] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAllReferenceData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await loadResources('adjustment/');
            setReferenceData(data);
            setError(null);
        } catch (err) {
            setError(err.detail || 'Ошибка загрузки данных');
            console.error('Ошибка загрузки справочных данных:', err);
        } finally {
            setLoading(false);
        }
    }, [loadResources]);

    useEffect(() => {
        loadAllReferenceData();
    }, [loadAllReferenceData]);

    const updateGroups = useCallback(async () => {
        try {
            const groups = await loadResources('groups/');
            setReferenceData(prev => ({ ...prev, groups }));
        } catch (error) {
            console.error('Ошибка обновления групп:', error);
        }
    }, [loadResources]);

    const updateBreeders = useCallback(async () => {
        try {
            const breeders = await loadResources('breeders/');
            setReferenceData(prev => ({ ...prev, breeders }));
        } catch (error) {
            console.error('Ошибка обновления селекционеров:', error);
        }
    }, [loadResources]);

    const updatePests = useCallback(async () => {
        try {
            const pests = await loadResources('pests/');
            setReferenceData(prev => ({ ...prev, pests }));
        } catch (error) {
            console.error('Ошибка обновления вредителей:', error);
        }
    }, [loadResources]);

    const updateFungi = useCallback(async () => {
        try {
            const fungi = await loadResources('fungi/');
            setReferenceData(prev => ({ ...prev, fungi }));
        } catch (error) {
            console.error('Ошибка обновления грибов:', error);
        }
    }, [loadResources]);

    const updateGroupsDirectly = useCallback((groups) => {
        setReferenceData(prev => ({ ...prev, groups }));
    }, []);

    const updateBreedersDirectly = useCallback((breeders) => {
        setReferenceData(prev => ({ ...prev, breeders }));
    }, []);

    const updatePestsDirectly = useCallback((pests) => {
        setReferenceData(prev => ({ ...prev, pests }));
    }, []);

    const updateFungiDirectly = useCallback((fungi) => {
        setReferenceData(prev => ({ ...prev, fungi }));
    }, []);

    const value = {
        ...referenceData,
        loading,
        error,
        filter,
        setFilter,
        loadAllReferenceData,
        updateGroups,
        updateBreeders,
        updatePests,
        updateFungi,
        updateGroupsDirectly,
        updateBreedersDirectly,
        updatePestsDirectly,
        updateFungiDirectly
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;
