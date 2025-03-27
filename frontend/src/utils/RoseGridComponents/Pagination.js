import { memo } from 'react';

const Pagination = memo(({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination flex justify-center items-center space-x-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
          ${
            currentPage === 1
              ? 'bg-rose-800 cursor-not-allowed'
              : 'hover:bg-rose-800 hover:translate-y-[-2px] hover:shadow-3xl-rounded'
          }`}
    >
      &#60;
    </button>
    <span
      className="bg-rose-500 border-solid hover:cursor-default border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md text-center"
      style={{ minWidth: '3.5rem' }}
    >
      {currentPage}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages || totalPages === 0}
      className={`bg-rose-500 border-solid border-gray-300 border-[1px] px-5 py-1.5 text-white rounded-md
          ${
            currentPage === totalPages
              ? 'bg-rose-800 cursor-not-allowed'
              : 'hover:bg-rose-800 hover:translate-y-[-2px] hover:shadow-3xl-rounded'
          }`}
    >
      &#62;
    </button>
  </div>
));

export default Pagination;
