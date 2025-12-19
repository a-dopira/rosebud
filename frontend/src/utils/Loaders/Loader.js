import { RoseLoader } from './RoseLoader';
import { memo } from 'react';

const MemoizedRoseLoader = memo(RoseLoader);

function Loader({ fullscreen = true, className = '' }) {
  if (!fullscreen) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <MemoizedRoseLoader />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <MemoizedRoseLoader />
    </div>
  );
}

export default Loader;
