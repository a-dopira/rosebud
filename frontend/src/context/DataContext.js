import { createContext, useState } from "react";
import useAxios from "../hooks/useAxios";

const DataContext = createContext()

export function DataProvider({ children }) {

    const [rosesList, setRosesList] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [queryParam, setQueryParam] = useState({})

    const [message, setMessage] = useState(null);
    const api = useAxios();

    const loadRoses = async (page=1, filter=queryParam) => {
        try {
            const params = new URLSearchParams({
                ...filter,
                page,
            })

            setQueryParam(filter)

            const response = await api.get(`roses/?${params.toString()}`);

            setRosesList(response.data.results);
            setCurrentPage(page);
            setTotalPages(response.data.total_pages)

            setMessage(
                response.data.results.length > 0
                ? (queryParam)
                    ? `Все розы по поиску ${ queryParam }`
                    : null
                : 'Нет роз по заданному поиску. Попробуй что то другое...'
            )

            return 
        } catch (error) {
            setMessage('Что-то пошло не так... Нужно пробывать нечто другое...')
        }
    }

    const contextData = {
        rosesList,
        message,
        currentPage,
        totalPages,
        setRosesList,
        setMessage,
        setQueryParam,
        loadRoses,
    }

    return (
        <DataContext.Provider value={contextData}>
            {children}
        </DataContext.Provider>
    );
}

export default DataContext;