import { useEffect, useContext } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import RoseHeader from '../single-rose-partials/RoseHeader';
import RoseMenu from '../single-rose-partials/RosePartials/RoseMenu';
import MedControl from '../single-rose-partials/RosePartials/RoseVermins';
import Foliage from '../single-rose-partials/RosePartials/RoseFoliages';
import Feeding from '../single-rose-partials/RosePartials/RoseFeedings';
import RoseNote from '../single-rose-partials/RosePartials/RoseNote';
import RoseMedia from '../single-rose-partials/RosePartials/RoseMedia';

import RoseContext from '../../context/RoseContext';

function RoseLayout() {
  const { roseId } = useParams();
  const { loadRose } = useContext(RoseContext);

  useEffect(() => {
    loadRose(roseId);
  }, [roseId]);

  return (
    <>
      <RoseHeader />
      <RoseMenu />
      <Routes>
        <Route path="medication" element={<MedControl />} />
        <Route path="foliage" element={<Foliage />} />
        <Route path="feedings" element={<Feeding />} />
        <Route path="notes" element={<RoseNote />} />
        <Route path="media" element={<RoseMedia />} />
      </Routes>
    </>
  );
}

export default RoseLayout;
