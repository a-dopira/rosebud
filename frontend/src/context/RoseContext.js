import { createContext, useState } from 'react';
import useAxios from '../hooks/useAxios';

const RoseContext = createContext();

export function RoseProvider({ children }) {
  const { api } = useAxios();
  const [rose, setRose] = useState(null);
  const [roseLoading, setRoseLoading] = useState(false);
  const [roseError, setRoseError] = useState(null);

  const loadRose = async (id) => {
    setRoseLoading(true);
    setRoseError(null);
    try {
      const response = await api.get(`/roses/${id}/`);
      setRose(response.data);
      return response.data;
    } catch (e) {
      setRose(null);
      setRoseError('Не удалось загрузить розу');
      return null;
    } finally {
      setRoseLoading(false);
    }
  };

  const data = { rose, setRose, loadRose, roseLoading, roseError };

  return <RoseContext.Provider value={data}>{children}</RoseContext.Provider>;
}

export default RoseContext;
