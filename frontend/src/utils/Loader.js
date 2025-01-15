const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-md">
      <svg 
        className="w-24 h-24 animate-pulse" 
        viewBox="0 0 96 96" 
        xmlns="http://www.w3.org/2000/svg"
      >
      </svg>
    </div>
  );
};

export default Loader;