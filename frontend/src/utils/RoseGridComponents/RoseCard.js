import { Link } from 'react-router-dom';
import { memo } from 'react';
import { RoseLoader } from '../Loaders/RoseLoader';
import SmartMedia from '../RoseComponents/SmartMedia';

const RoseCard = memo(({ rose, onDelete }) => (
  <div id={rose.id} className="flex justify-center relative isolate">
    <div className="rose-card">
      <button
        id="open-delete-modal"
        className="absolute top-2 right-2 p-1 text-red-500 text-3xl font-semibold hover:text-umbra z-10"
        onClick={() => onDelete(rose)}
      >
        &times;
      </button>
      <Link
        to={`/home/${rose.id}/notes`}
        className="text-center w-full space-y-2 flex flex-col"
      >
        <div className="p-4 h-48 relative flex items-center justify-center">
          {rose.photo ? (
            <SmartMedia
              type="image"
              src={rose.photo}
              alt={rose.title}
              className="h-full w-auto max-w-full object-contain"
              loaderId={`loader-${rose.id}`}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <RoseLoader />
            </div>
          )}
        </div>
        <div className="p-2 min-h-8 bg-white bg-opacity-80 relative z-5 mt-1 truncate">
          {rose.title}
        </div>
      </Link>
    </div>
  </div>
));

export default RoseCard;
