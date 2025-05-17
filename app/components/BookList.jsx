"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/redux/store";
import { setBooks } from "../lib/redux/bookSlice";

export default function BookList() {
  const dispatch = useAppDispatch();
  const books = useAppSelector((state) => state.books.books);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState("All");

  useEffect(() => {
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

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search books..."
          className="p-2 border rounded flex-grow text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded text-black"
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

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div
              key={book._id || book.id}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow text-black"
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
          <div className="col-span-2 text-center py-8 text-gray-500">
            No books found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}
