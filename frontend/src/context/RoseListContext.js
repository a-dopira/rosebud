import { createContext, useState, useCallback } from "react";
import useAxios from "../hooks/useAxios";

const RoseListContext = createContext()

export function RoseListProvider({ children }) {
  const api = useAxios();

  const [rosesList, setRosesList] = useState([]);
  const [message, setMessage] = useState(null);

  // ВАЖНО: оборачиваем loadRoses в useCallback, чтобы ссылка
  // на функцию не менялась на каждом рендере.
  const loadRoses = async (page = 1, filter) => {
      try {
        const params = new URLSearchParams({ ...filter, page });
        const response = await api.get(`roses/?${params.toString()}`);

        setRosesList(response.data.results.roses);
        if (response.data.results.roses.length === 0) {
          setMessage('Нет роз по заданному поиску. Попробуй что-то другое...');
        } else {
          setMessage(null);
        }
        return { totalPages: response.data.results.total_pages };
      } catch (error) {
        setMessage('Что-то пошло не так...');
        return { totalPages: 1 };
      }
    };

  const contextData = {
    rosesList,
    message,
    setRosesList,
    setMessage,
    loadRoses,
  };

  return (
    <RoseListContext.Provider value={contextData}>
      {children}
    </RoseListContext.Provider>
  );
}

export default RoseListContext;