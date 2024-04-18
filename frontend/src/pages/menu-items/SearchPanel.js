import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataContext from '../../context/DataContext';
import useAxios from '../../utils/useAxios';
import Magnifier from '../../utils/Magnifier';

function SearchPanel() {

  const { setRosesList, setMessage} = useContext(DataContext)
  const location = useLocation()
  const navigate = useNavigate()

  const [inputValue, setInputValue] = useState('');
  const api = useAxios();

  
  useEffect(() => {
    setInputValue('')
  }, [location])

  const onSubmit = async (event) => {
    event.preventDefault();
    setInputValue(event.target.elements.search_rose.value);
    await api.get('/roses/', {
      params: {
        title: inputValue,
      },
    })
    .then(response => {
      if (response.data.length > 0) {
        setRosesList(response.data)
        setMessage('Поиск по результату ' + inputValue)
        navigate(`/home/search/?title=${inputValue}`)
      } else {
        api.get('/roses/', {
          params: {
            title_eng: inputValue,
          },
        })
        .then(response => {
          if (response.data.length > 0) {
            setRosesList(response.data)
            setMessage('Поиск по результату ' + inputValue)
            navigate(`/home/search/?title_eng=${inputValue}`)
          } else {
            setRosesList([])
            setMessage('Поиск по ' + inputValue + ' не дал результатов')
            navigate(`/home/`);
          }
        })
      }
    })
};


  return (
    <div className="bg-rose-500 border-solid border-gray-300 border-[1px] rounded-md w-56 hover:bg-rose-800">
      <form className="flex items-center" method="get" onSubmit={onSubmit}>
        <input 
          className="w-44 text-xl rounded-md p-2 mr-2" 
          name="search_rose" 
          type="text" 
          value={inputValue} 
          onChange={e => setInputValue(e.target.value)}
          placeholder="Поиск..."
        />
        <button type="submit">
          <Magnifier/>
        </button>
      </form>
    </div>
  );
}

export default SearchPanel
