import React from 'react';

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const maxVisiblePages = 5;

  const getPageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = start + maxVisiblePages - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const result = [];
    if (start > 1) {
      result.push(1);
      if (start > 2) result.push('...');
    }
    result.push(...pages);
    if (end < totalPages) {
      if (end < totalPages - 1) result.push('...');
      result.push(totalPages);
    }

    return result;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        type="button"
        aria-label="First"
        className="mr-2 disabled:opacity-50"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 1L2 9.24242L11 17" stroke="#111820" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 1L2 9.24242L7 17" stroke="#111820" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Previous"
        className="mr-2 disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 1L2 9.24242L11 17" stroke="#111820" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex gap-2 text-gray-500 text-sm md:text-base">
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="flex items-center justify-center w-9 md:w-12 h-9 md:h-12">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={`flex items-center justify-center w-9 md:w-12 h-9 md:h-12 aspect-square rounded-md transition-all ${
                page === currentPage ? 'bg-black text-white' : 'bg-white border border-gray-300/60 hover:bg-gray-300/10'
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        aria-label="Next"
        className="ml-2 disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L10 9.24242L1 17" stroke="#111820" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Last"
        className="ml-2 disabled:opacity-50"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L10 9.24242L1 17" stroke="#111820" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
          <path d="M5 1L10 9.24242L5 17" stroke="#111820" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;