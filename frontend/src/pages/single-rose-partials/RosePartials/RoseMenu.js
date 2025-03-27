import { memo } from 'react';

import AdaptiveMenu from '../../../utils/AdaptiveMenu';
import NavButton from '../../../utils/NavButton';

const RoseMenu = memo(() => {
  return (
    <AdaptiveMenu
      className="
          pattern-vertical-lines pattern-amber-500 pattern-size-16 
          pattern-bg-umbra pattern-opacity-100 my-6
      "
      stickyPosition="top-32"
    >
      <NavButton to="notes">Заметки</NavButton>
      <NavButton to="media">Медиа</NavButton>
      <NavButton to="medication">Обработка от вредителей</NavButton>
      <NavButton to="feedings">Подкормка</NavButton>
      <NavButton to="foliage">Обрезки</NavButton>
    </AdaptiveMenu>
  );
});

export default RoseMenu;
