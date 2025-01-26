import SearchPanel from "../menu-items/SearchPanel";
import Logout from "../menu-items/Logout";
import CategorySelect from "../menu-items/CategorySelect";
import NavButton from "../../utils/NavButton";


export default function Menu() {
    return (
        <div className="flex w-full bg-amber-500 rounded-3xl px-3 h-24 dotted-back mx-auto items-center justify-between my-12">
            <SearchPanel/>
            <Logout/>
            <NavButton to="home/collection/">Колекция</NavButton>
            <NavButton to="/addrose/">Добавить розу</NavButton>
            <NavButton to="/adjusting/">Настроить</NavButton>
            <CategorySelect/>
        </div>
    )
}
