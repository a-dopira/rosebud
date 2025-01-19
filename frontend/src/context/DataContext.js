import { createContext, useState, useCallback } from "react";
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

    return (
        <DataContext.Provider value={{ groups, filter, setFilter, loadGroups }}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;
