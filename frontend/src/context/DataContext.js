import { createContext, useState, useCallback, useMemo } from "react";
import useRosebud from "../hooks/useRosebud";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [groups, setGroups] = useState([]);
    const [filter, setFilter] = useState({});

    const { loadResources } = useRosebud();

    const loadGroups = useCallback(async () => {
        const response = await loadResources("groups/");
        setGroups(response);
    }, [loadResources]);

    const value = useMemo(() => ({ groups, filter, setFilter, loadGroups }), [groups, filter, setFilter, loadGroups]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;
