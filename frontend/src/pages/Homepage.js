import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { memo, useContext, useEffect } from 'react';

import Menu from './menu/Menu';
import Profile from './profile/Profile';
import Adjusting from './menu-items/Adjusting';
import AddRose from './content/AddRose';
import RoseGrid from './content/RoseGrid';
import RoseLayout from './content/RoseLayout';

import { RoseProvider } from '../context/RoseContext';
import { RoseListProvider } from '../context/RoseListContext';

import DataContext from '../context/DataContext';

const RoseList = memo(function RoseList() {
  const { groupName } = useParams();
  const location = useLocation();
  const { setFilter } = useContext(DataContext);

  useEffect(() => {
    if (groupName) {
      setFilter({ group: groupName });
    } else if (location.pathname.includes('/home/collection')) {
      setFilter({});
    }
  }, [groupName, location.pathname, setFilter]);

  return (
    <RoseListProvider>
      <RoseGrid />
    </RoseListProvider>
  );
});

export default function Homepage() {
  return (
    <div className="animate-fade-in">
      <Profile />
      <Menu />
      <Routes>
        <Route path="addrose/" element={<AddRose />} />
        <Route path="adjusting/" element={<Adjusting />} />
        <Route path="collection/*" element={<RoseList />} />
        <Route path="group/:groupName" element={<RoseList />} />
        <Route path="search/*" element={<RoseList />} />

        <Route
          path=":roseId/*"
          element={
            <RoseProvider>
              <RoseLayout />
            </RoseProvider>
          }
        />

        <Route index element={<Navigate to="collection" replace />} />
      </Routes>
    </div>
  );
}
