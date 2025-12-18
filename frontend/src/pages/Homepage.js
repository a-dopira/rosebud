import { Routes, Route, Navigate, useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { memo, useEffect } from 'react';

import Menu from './menu/Menu';
import Profile from './profile/Profile';
import Adjusting from './menu-items/Adjusting/Adjusting';
import AddRose from './content/AddRose';
import RoseGrid from './content/RoseGrid';
import RoseLayout from './content/RoseLayout';

import { RoseProvider } from '../context/RoseContext';
import { RoseListProvider } from '../context/RoseListContext';

const RoseList = memo(function RoseList() {
  const { groupName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sp = new URLSearchParams(searchParams);

    if (groupName) {
      sp.set("group", groupName);
      sp.set("page", "1");
      sp.delete("search");
      navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
      return;
    }

    if (location.pathname.includes("/home/collection")) {
      if ([...sp.keys()].length > 0) {
        navigate(location.pathname, { replace: true });
      }
    }
  }, [groupName, location.pathname, navigate]);

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
