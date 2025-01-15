import { createContext, useState } from "react";
import useAxios from "../hooks/useAxios";

const DataContext = createContext()

export function DataProvider({ children }) {
    const [groupList, setGroupList] = useState([]);
    const [breederList, setBreederList] = useState([]);
    const [pests, setPests] = useState([]);
    const [fungi, setFungi] = useState([]);
    const [rosesList, setRosesList] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [adjFilter, setAdjFilter] = useState({})
    const [filterTitle, setFilterTitle] = useState(null)

    const [message, setMessage] = useState(null);
    const api = useAxios();

    const loadGroups = async () => {
        const response = await api.get('groups/');
        setGroupList(response.data);
    };

    const loadBreeders = async () => {
        const response = await api.get('/breeders/')
        setBreederList(response.data)
    }

    const loadPests = async () => {
        const response = await api.get('pests/')
        setPests(response.data)
    }

    const loadFungi = async () => {
        const response = await api.get('fungi/')
        setFungi(response.data)
    }

    const loadRoses = async (page=1, filters=adjFilter, filter=filterTitle) => {
        try {
            const params = new URLSearchParams({
                ...filters,
                page,
            })

            setAdjFilter(filters)
            setFilterTitle(filter)

            const response = await api.get(`roses/?${params.toString()}`);

            setRosesList(response.data.results);
            setCurrentPage(page);
            setTotalPages(response.data.total_pages)

            setMessage(
                response.data.results.length > 0
                ? (filters && filter)
                    ? `Все розы по поиску ${ filter }`
                    : null
                : 'Нет роз по заданному поиску. Попробуй что то другое...'
            )

            return 
        } catch (error) {
            setMessage('Что-то пошло не так... Нужно пробывать нечто другое...')
        }
    }

    const contextData = {
        groupList,
        breederList,
        pests,
        fungi,
        rosesList,
        message,
        currentPage,
        totalPages,
        setGroupList,
        setBreederList,
        setPests,
        setFungi,
        setRosesList,
        setMessage,
        loadGroups,
        loadBreeders,
        loadPests,
        loadFungi,
        loadRoses,
    }

    return (
        <DataContext.Provider value={contextData}>
            {children}
        </DataContext.Provider>
    );
}

export default DataContext;