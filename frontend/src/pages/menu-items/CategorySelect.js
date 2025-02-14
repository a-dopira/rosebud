import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import DataContext from "../../context/DataContext";
import dropdown_arrow from '../../assets/icons/down-arrow-svgrepo-com.svg'


function CategorySelect() {

    const { groups, loadGroups, setFilter } = useContext(DataContext);
    const [isOpen, setIsOpen] = useState(false)

    const node = useRef();

    useEffect(() => {
        loadGroups();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (node.current.contains(e.target)) {
                return;
            }
            setIsOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [node]);

    const groupClasses = 'rounded border-[1px] border-gray-300 bg-white absolute top-[50px] w-full shadow-md z-10'

    return (
        <div className="menu" ref={node}>
            <div className="relative group"
                onClick={() => setIsOpen(!isOpen)}>
                <div
                    className="dotted-back px-5 py-2 rounded cursor-pointer font-bold
                    text-xl flex justify-between w-full bg-white shadow-sm gap-3.5"
                >
                    Категории
                    <img width="10" src={dropdown_arrow} alt="dropdown-arrow" />
                </div>
                <ul
                    className={isOpen ? groupClasses + ' group-hover:block' : groupClasses + ' hidden'}
                >
                    {groups.map(group => (
                        <li key={group.id} className="drop-menu-item w-full hover:bg-gray-100 z-10">
                            <Link to={`home/group/${group.name}`} onClick={() => setFilter({ group: group.name })}>
                                <div className="cursor-pointer hover:bg-gray-300 p-3">
                                    {group.name} ({group.rose_count})
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default CategorySelect
