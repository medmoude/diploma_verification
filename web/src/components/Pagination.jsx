import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

function getPages(current, total) {
  const delta = 2;
  const pages = [];
  const range = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) range.unshift("...");
  if (current + delta < total - 1) range.push("...");

  range.unshift(1);
  if (total > 1) range.push(total);

  return range;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPages(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-8 select-none">

      {/* Left arrow */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {/* Page numbers */}
      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={index}
            className="px-3 text-slate-400"
          >
            …
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`min-w-[40px] h-10 px-3 rounded-full font-medium transition
              ${
                page === currentPage
                  ? "bg-indigo-600 text-white shadow-md scale-105"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
          >
            {page}
          </button>
        )
      )}

      {/* Right arrow */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}
