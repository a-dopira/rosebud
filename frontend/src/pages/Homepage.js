import { Routes, Route } from 'react-router-dom';

import Menu from './menu/Menu';
import Profile from './profile/Profile';
import Adjusting from './menu-items/Adjusting';
import AddRose from './content/AddRose';
import RoseGrid from './content/RoseGrid';
import RoseLayout from './content/RoseLayout';

import { RoseProvider } from '../context/RoseContext';
import { RoseListProvider } from '../context/RoseListContext';

function RoseList() {
  return (
    <RoseListProvider>
      <Routes>
        <Route index element={<RoseGrid />} />
        <Route path="collection" element={<RoseGrid />} />
        <Route path="group/:groupName" element={<RoseGrid />} />
        <Route path="search" element={<RoseGrid />} />
      </Routes>
    </RoseListProvider>
  );
}

export default function Homepage() {
  return (
    <div className="animate-fade-in">
      <Profile className="w-full" />
      <Menu />
      <Routes>
        <Route path="home/*" element={<RoseList />} />
        <Route path="addrose/" element={<AddRose />} />
        <Route path="adjusting/" element={<Adjusting />} />
        <Route
          path="/:roseId/*"
          element={
            <RoseProvider>
              <RoseLayout />
            </RoseProvider>
          }
        />
      </Routes>
    </div>
  );
}
