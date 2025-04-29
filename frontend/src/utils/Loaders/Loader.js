import { RoseLoader } from './RoseLoader';
import useAxios from '../../hooks/useAxios';
import { memo } from 'react';

const MemoizedRoseLoader = memo(RoseLoader);

const Loader = () => {
  const { isLoading } = useAxios();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-md">
      <MemoizedRoseLoader />
    </div>
  );
};

export default Loader;
