import { createContext, useState, useCallback, useMemo, useEffect } from "react";
import useRosebud from "../hooks/useRosebud";

const DataContext = createContext();
export const DataProvider = ({ children }) => {
    const { loadResources } = useRosebud();
    const [groups, setGroups] = useState([]);
    const [filter, setFilter] = useState({});
    
    const loadGroups = useCallback(async () => {
        const response = await loadResources("groups/");
        setGroups(response);
    }, [loadResources]);

    useEffect(() => {
        loadGroups();
    }, [loadGroups]);

    const value = useMemo(() => ({
        groups,
        filter,
        setFilter,
        loadGroups
    }), [groups, filter, loadGroups]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
// export const DataProvider = ({ children }) => {
//     const [groups, setGroups] = useState([]);
//     const [filter, setFilter] = useState({});

//     const { loadResources } = useRosebud();

//     const loadGroups = useCallback(async () => {
//         const response = await loadResources("groups/");
//         setGroups(response);
//     }, [loadResources]);

//     // Memoized setFilter to prevent unnecessary re-renders
//     const handleSetFilter = useCallback((newFilter) => {
//         setFilter(prev => {
//             // Only update if filter actually changed
//             if (JSON.stringify(prev) === JSON.stringify(newFilter)) {
//                 return prev;
//             }
//             return newFilter;
//         });
//     }, []);

//     const value = useMemo(() => ({
//         groups,
//         filter,
//         setFilter: handleSetFilter,
//         loadGroups
//     }), [groups, filter, handleSetFilter, loadGroups]);

//     return (
//         <DataContext.Provider value={value}>
//             {children}
//         </DataContext.Provider>
//     );
// };

export default DataContext;
