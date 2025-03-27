import { createContext, useState } from 'react';
import useAxios from '../hooks/useAxios';

const RoseContext = createContext();

export function RoseProvider({ children }) {
  const api = useAxios();
  const [rose, setRose] = useState([]);

  const loadRose = async (id) => {
    const response = await api.get(`roses/${id}/`);
    setRose(response.data);
  };

  const data = {
    rose,
    setRose,
    loadRose,
  };

  return <RoseContext.Provider value={data}>{children}</RoseContext.Provider>;
}

export default RoseContext;
