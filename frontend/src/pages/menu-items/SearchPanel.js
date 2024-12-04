import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DataContext from '../../context/DataContext';
import Magnifier from '../../utils/Magnifier';

function SearchPanel() {

  const { loadRoses } = useContext(DataContext);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (event) => {
      event.preventDefault();
      const searchValue = inputValue.trim();
      if (!searchValue) return;

      const results = await loadRoses(1, {search: searchValue}, searchValue); // Передаём query как строку поиска
      if (results?.length > 0) {
          navigate(`/home/search/?search=${searchValue}`); // Навигация к результатам
      } else {
          navigate('/home/');
      }
      setInputValue('')
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
