"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/redux/store";
import { setBooks } from "../lib/redux/bookSlice";

export default function BookList() {
  const dispatch = useAppDispatch();
  const books = useAppSelector((state) => state.books.books);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(6);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fetch books on component mount
    async function fetchBooks() {
      try {
        const response = await fetch("/api/books");
        const data = await response.json();
        dispatch(setBooks(data));
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    }
    fetchBooks();

    // Check if mobile view for responsive design
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Adjust books per page based on screen size
      setBooksPerPage(window.innerWidth < 768 ? 4 : 6);
    };

    // Initial check
    checkIfMobile();

    // Add resize listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [dispatch]);

  // Filter and search logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.Author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === "All" || book.Genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  // Get unique genres for filter
  const genres = [
    "All",
    ...new Set(books.map((book) => book.Genre).filter(Boolean)),
  ];

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGenre]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4">
        <input
          type="text"
          placeholder="Search books..."
          className="p-2 border rounded flex-grow text-black text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded text-black text-sm"
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
        >
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {/* Total count */}
      <div className="text-sm text-gray-600">
        Showing {currentBooks.length} of {filteredBooks.length} books
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentBooks.length > 0 ? (
          currentBooks.map((book) => (
            <div
              key={book._id || book.id}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow text-black bg-white"
            >
              <h3 className="font-bold text-lg">{book.Name}</h3>
              <p className="text-gray-600">{book.Author}</p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {book.Genre}
                </span>
                <span>⭐ {book.UserRating}</span>
              </div>
              <div className="mt-2 text-sm">
                <p>
                  Year: {book.Year} | Price: ${book.Price}
                </p>
                <p>Reviews: {book.Reviews?.toLocaleString() || 0}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No books found matching your criteria
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredBooks.length > 0 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-1">
            {/* Previous button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              &laquo;
            </button>

            {/* Page numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                // Logic for which pages to show
                let pageNum;

                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all
                  pageNum = idx + 1;
                } else {
                  // For more than 5 pages, show a window based on current page
                  if (currentPage <= 3) {
                    // Near start: show 1-5
                    pageNum = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Near end: show last 5
                    pageNum = totalPages - 4 + idx;
                  } else {
                    // In middle: show current page and 2 on each side
                    pageNum = currentPage - 2 + idx;
                  }
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 border rounded-md ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages || totalPages === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              &raquo;
            </button>
          </nav>
        </div>
      )}

      {/* Per page selector */}
      <div className="flex justify-end items-center text-sm">
        <label htmlFor="booksPerPage" className="mr-2 text-gray-600">
          Books per page:
        </label>
        <select
          id="booksPerPage"
          value={booksPerPage}
          onChange={(e) => {
            setBooksPerPage(Number(e.target.value));
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
          className="border rounded p-1 text-black"
        >
          <option value={4}>4</option>
          <option value={6}>6</option>
          <option value={9}>9</option>
          <option value={12}>12</option>
        </select>
      </div>
    </div>
  );
}
