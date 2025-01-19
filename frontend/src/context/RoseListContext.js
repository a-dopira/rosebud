import { createContext, useState } from "react";
import useAxios from "../hooks/useAxios";

const RoseListContext = createContext()

export function RoseListProvider({ children }) {

    const [rosesList, setRosesList] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [queryParam, setQueryParam] = useState({})

    const [message, setMessage] = useState(null);
    const api = useAxios();

    const loadRoses = async (page = 1, filter = queryParam) => {
        try {
          setQueryParam(filter);
          const params = new URLSearchParams({ ...filter, page });
          const response = await api.get(`roses/?${params.toString()}`);
      
          setRosesList(response.data.results);
          setCurrentPage(page);
          setTotalPages(response.data.total_pages);
          if (response.data.results.length === 0) {
            setMessage('Нет роз по заданному поиску. Попробуй что-то другое...');
          } else {
            if (Object.keys(filter).length === 0) {
              setMessage(null);
            } else if (filter.search) {
              setMessage(`Все розы по поиску «${filter.search}»`);
            } else if (filter.group) {
              setMessage(`Все розы в группе «${filter.group}»`);
            } else {
              setMessage(null);
            }
          }
      
        } catch (error) {
          setMessage('Что-то пошло не так... Нужно пробывать нечто другое...');
        }
      };

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
        <RoseListContext.Provider value={contextData}>
            {children}
        </RoseListContext.Provider>
    );
}

export default RoseListContext;