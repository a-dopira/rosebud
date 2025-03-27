import { memo } from 'react';

import SearchPanel from '../menu-items/SearchPanel';
import Logout from '../menu-items/Logout';
import CategorySelect from '../menu-items/CategorySelect';
import NavButton from '../../utils/NavButton';

import AdaptiveMenu from '../../utils/AdaptiveMenu';

const Menu = memo(() => {
  return (
    <AdaptiveMenu
      className="bg-amber-500 dotted-back my-12"
      stickyPosition="top-5"
    >
      <SearchPanel />
      <Logout />
      <NavButton to="/home/collection">Коллекция</NavButton>
      <NavButton to="/addrose/">Добавить розу</NavButton>
      <NavButton to="/adjusting/">Настроить</NavButton>
      <CategorySelect />
    </AdaptiveMenu>
  );
});

export default Menu;
