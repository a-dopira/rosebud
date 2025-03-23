import { RoseLoader } from "./RoseLoader";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-md">
      <RoseLoader />
    </div>
  );
};

export default Loader;