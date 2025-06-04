export const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}: {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-full bg-neutral2-5 text-gray-100 hover:bg-neutral2-10 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300"
      >
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
            currentPage === page
              ? 'bg-gradient-to-r from-cherry to-black-600 text-white shadow-md'
              : 'bg-neutral2-5 text-gray-100 hover:bg-neutral2-10'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-full bg-neutral2-5 text-gray-100 hover:bg-neutral2-10 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-300"
      >
        Next
      </button>
    </div>
  );
};