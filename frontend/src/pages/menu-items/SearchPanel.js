import { useState } from 'react';
import { useNavigate,useSearchParams } from 'react-router-dom';
import Magnifier from '../../utils/Magnifier';

function SearchPanel() {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const onSubmit = (event) => {
    event.preventDefault();
    const q = inputValue.trim();
    if (!q) return;

    const next = new URLSearchParams(searchParams);
    next.set("search", q);
    next.set("page", "1");
    next.delete("group");

    navigate(`/home/search?${next.toString()}`);
    setInputValue("");
  };


  return (
    <div
      className="bg-rose-500 border-solid border-gray-300 border-[1px] rounded-md w-56
                     hover:bg-rose-800 flex-shrink-0 justify-center"
    >
      <form className="flex items-center" method="get" onSubmit={onSubmit}>
        <input
          className="w-44 form-input rounded-l-md mr-2"
          name="search_rose"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Поиск..."
        />
        <button type="submit" className="touch-manipulation">
          <Magnifier />
        </button>
      </form>
    </div>
  );
}

export default SearchPanel;
