"use client";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../lib/redux/store";
import { addBook, setBooks } from "../lib/redux/bookSlice";

export default function ChatInterface() {
  const dispatch = useAppDispatch();
  const books = useAppSelector((state) => state.books.books);

  // Create a ref for the chat messages container
  const messagesEndRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "system",
      content: "I'm your AI Book Assistant. How can I help you today?",
    },
  ]);

  // Book form state
  const [showBookForm, setShowBookForm] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    Author: "",
    Genre: "Fiction",
    Year: new Date().getFullYear(),
    Price: 0,
    UserRating: 4.0,
    Reviews: 0,
  });

  // Book details view state
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetails, setShowBookDetails] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState("All");
  const [showBookList, setShowBookList] = useState(false);

  // Scroll to bottom whenever chat history changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    setIsMounted(true);

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
  }, [dispatch]);

  // Get unique genres for filter
  const genres = [
    "All",
    ...new Set(books.map((book) => book.Genre).filter(Boolean)),
  ];

  // Filter and search logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.Author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === "All" || book.Genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    const newUserMessage = { role: "user", content: message };
    setChatHistory((prev) => [...prev, newUserMessage]);

    // Process the message
    await processUserMessage(message);

    // Clear the input
    setMessage("");
  };

  const processUserMessage = async (userMessage) => {
    const userMsg = userMessage.toLowerCase();

    // Check for book details request
    const viewDetailsMatch =
      userMsg.match(/view details for ["'](.+?)["']/i) ||
      userMsg.match(/details (of|for|about) ["'](.+?)["']/i) ||
      userMsg.match(/show me ["'](.+?)["']/i) ||
      userMsg.match(/view details for (.+)/i); // Added this pattern to match without quotes

    if (viewDetailsMatch) {
      const bookTitle = viewDetailsMatch[1] || viewDetailsMatch[2];
      const book = books.find((b) =>
        b.Name.toLowerCase().includes(bookTitle.toLowerCase())
      );

      if (book) {
        setSelectedBook(book);
        setShowBookDetails(true);
        setShowBookForm(false);
        setShowBookList(false);

        // Add AI response
        const response = {
          role: "assistant",
          content: `Here are the details for "${book.Name}":`,
          showBookDetails: true,
          book: book,
        };

        setTimeout(() => {
          setChatHistory((prev) => [...prev, response]);
        }, 500);
        return;
      } else {
        // Book not found response
        setTimeout(() => {
          setChatHistory((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `I couldn't find a book with the title "${bookTitle}". Please check the title and try again.`,
            },
          ]);
        }, 500);
        return;
      }
    }

    // Check for add book request
    if (userMsg.includes("add book") || userMsg.includes("new book")) {
      setShowBookForm(true);
      setShowBookDetails(false);
      setShowBookList(false);

      // Add AI response
      const response = {
        role: "assistant",
        content: "Please fill in the form below to add a new book:",
        showBookForm: true,
      };

      setTimeout(() => {
        setChatHistory((prev) => [...prev, response]);
      }, 500);
      return;
    }

    // Check for show all books / list books request
    if (
      userMsg.includes("show all books") ||
      userMsg.includes("list books") ||
      userMsg.includes("view books") ||
      userMsg.includes("see books")
    ) {
      setShowBookList(true);
      setShowBookForm(false);
      setShowBookDetails(false);

      // Add AI response
      const response = {
        role: "assistant",
        content: `Here are all the books (${books.length} total):`,
        showBookList: true,
      };

      setTimeout(() => {
        setChatHistory((prev) => [...prev, response]);
      }, 500);
      return;
    }

    // Process normal AI response
    let aiResponse = await generateAIResponse(userMessage);

    // Add AI response after delay
    setTimeout(() => {
      setChatHistory((prev) => [...prev, aiResponse]);
    }, 500);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newBook = await response.json();
      dispatch(addBook(newBook));

      // Add confirmation message
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Book "${formData.Name}" by ${formData.Author} has been added successfully!`,
        },
      ]);

      // Reset form and hide it
      setFormData({
        Name: "",
        Author: "",
        Genre: "Fiction",
        Year: new Date().getFullYear(),
        Price: 0,
        UserRating: 4.0,
        Reviews: 0,
      });
      setShowBookForm(false);
    } catch (error) {
      console.error("Error adding book:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ There was an error adding the book. Please try again.",
        },
      ]);
    }
  };

  const generateAIResponse = async (userMessage) => {
    const userMsg = userMessage.toLowerCase();
    let response = { role: "assistant", content: "" };

    // Recommendation logic
    if (userMsg.includes("recommend") || userMsg.includes("suggestion")) {
      const genreKeywords = [
        "fiction",
        "mystery",
        "thriller",
        "fantasy",
        "romance",
        "sci-fi",
        "non fiction",
        "history",
      ];

      const matchedGenre = genreKeywords.find((genre) =>
        userMsg.includes(genre)
      );

      if (matchedGenre && books.length > 0) {
        const matchingBooks = books.filter(
          (book) =>
            book.Genre && book.Genre.toLowerCase().includes(matchedGenre)
        );

        if (matchingBooks.length > 0) {
          // Sort by user rating for better recommendations
          const topBooks = [...matchingBooks]
            .sort((a, b) => b.UserRating - a.UserRating)
            .slice(0, 3);

          response.content =
            `📚 <strong>${
              matchedGenre.charAt(0).toUpperCase() + matchedGenre.slice(1)
            } Recommendations:</strong><br><br>` +
            topBooks
              .map(
                (book) =>
                  `• <span class="font-semibold">"${book.Name}"</span> by ${book.Author}<br>` +
                  `⭐ ${book.UserRating} | ${book.Year} | $${book.Price}`
              )
              .join("<br><br>");

          // Add view details prompt
          response.content += `<br><br>Type "view details for '[book title]'" to see more information.`;
        } else {
          response.content = `I couldn't find any ${matchedGenre} books. Would you like to add one? Just say "Add a new book".`;
        }
      } else {
        response.content =
          "What genre are you interested in? (e.g., Mystery, Romance, Sci-Fi)";
      }
    }
    // Search book logic
    else if (userMsg.includes("search") || userMsg.includes("find book")) {
      const searchQuery = userMsg
        .replace(/search (for|books|about)|find book/gi, "")
        .trim();

      if (searchQuery && books.length > 0) {
        const searchResults = books.filter(
          (book) =>
            book.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.Author.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (searchResults.length > 0) {
          response.content =
            `📚 <strong>Search Results for "${searchQuery}":</strong><br><br>` +
            searchResults
              .slice(0, 5)
              .map(
                (book) =>
                  `• <span class="font-semibold">"${book.Name}"</span> by ${book.Author}<br>` +
                  `⭐ ${book.UserRating} | ${book.Genre} | ${book.Year}`
              )
              .join("<br><br>");

          // Add view details prompt
          response.content += `<br><br>Type "view details for '[book title]'" to see more information.`;
        } else {
          response.content = `I couldn't find any books matching "${searchQuery}". Would you like to try another search term or add a new book?`;
        }
      } else {
        response.content =
          "What book are you looking for? Please provide a title or author name.";
      }
    }
    // Summary of a book
    else if (userMsg.includes("summarize") || userMsg.includes("summary")) {
      response.content =
        "I don't have summaries for these books yet. Would you like to view the book details instead?";
    }
    // Help command
    else if (userMsg.includes("help")) {
      response.content =
        "I can help with:<br><br>" +
        "🔍 <strong>Finding books</strong> - 'Recommend mystery books' or 'Search for [title/author]'<br>" +
        "📖 <strong>Book details</strong> - 'View details for [book title]'<br>" +
        "📋 <strong>Listing books</strong> - 'Show all books'<br>" +
        "➕ <strong>Adding books</strong> - 'Add a new book'<br>" +
        "📊 <strong>Book stats</strong> - 'How many books do you have?'";
    }
    // Book count
    else if (userMsg.includes("how many")) {
      response.content = `There are currently <strong>${books.length}</strong> books in the collection.`;
    }
    // Default response
    else {
      response.content =
        "I'm your book assistant! Here's what you can ask me:<br><br>" +
        "• 'Recommend [genre] books'<br>" +
        "• 'Search for [title or author]'<br>" +
        "• 'View details for [book title]'<br>" +
        "• 'Show all books'<br>" +
        "• 'Add a new book'";
    }

    return response;
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">📖 AI Book Explorer</h2>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[500px] text-black">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-100 text-blue-900 rounded-br-none"
                  : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
              }`}
            >
              <div
                className="prose prose-sm"
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />

              {/* Book Details View (when requested) */}
              {msg.showBookDetails && msg.book && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-bold text-lg mb-2">{msg.book.Name}</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <strong>Author:</strong>
                    </div>
                    <div>{msg.book.Author}</div>
                    <div>
                      <strong>Genre:</strong>
                    </div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {msg.book.Genre}
                      </span>
                    </div>
                    <div>
                      <strong>Year:</strong>
                    </div>
                    <div>{msg.book.Year}</div>
                    <div>
                      <strong>Price:</strong>
                    </div>
                    <div>${msg.book.Price}</div>
                    <div>
                      <strong>Rating:</strong>
                    </div>
                    <div>
                      ⭐ {msg.book.UserRating} ({msg.book.Reviews || 0} reviews)
                    </div>
                  </div>
                </div>
              )}

              {/* Book List (when requested) */}
              {msg.showBookList && (
                <div className="mt-4">
                  {/* Search and Filter Controls */}
                  <div className="flex gap-2 mb-4">
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

                  {/* Books Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {filteredBooks.length > 0 ? (
                      filteredBooks.slice(0, 5).map((book) => (
                        <div
                          key={book._id || book.id}
                          className="p-3 border rounded-lg hover:shadow-md transition-shadow bg-white"
                        >
                          <h4 className="font-bold">{book.Name}</h4>
                          <p className="text-gray-600 text-sm">{book.Author}</p>
                          <div className="mt-1 flex justify-between text-xs">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {book.Genre}
                            </span>
                            <span>⭐ {book.UserRating}</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {book.Year} | ${book.Price}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedBook(book);
                              setShowBookDetails(true);
                              // Add to chat
                              setChatHistory((prev) => [
                                ...prev,
                                {
                                  role: "user",
                                  content: `View details for "${book.Name}"`,
                                },
                              ]);
                              setTimeout(() => {
                                setChatHistory((prev) => [
                                  ...prev,
                                  {
                                    role: "assistant",
                                    content: `Here are the details for "${book.Name}":`,
                                    showBookDetails: true,
                                    book: book,
                                  },
                                ]);
                              }, 500);
                            }}
                            className="mt-2 text-xs text-blue-600 hover:underline"
                          >
                            View details
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No books found matching your criteria
                      </div>
                    )}

                    {filteredBooks.length > 5 && (
                      <div className="text-center text-sm text-blue-600">
                        + {filteredBooks.length - 5} more books
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Book Form (when requested) */}
              {msg.showBookForm && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <form onSubmit={handleAddBook} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium">Title</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 border rounded"
                        value={formData.Name}
                        onChange={(e) =>
                          setFormData({ ...formData, Name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Author
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 border rounded"
                        value={formData.Author}
                        onChange={(e) =>
                          setFormData({ ...formData, Author: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium">
                          Genre
                        </label>
                        <select
                          className="w-full p-2 border rounded"
                          value={formData.Genre}
                          onChange={(e) =>
                            setFormData({ ...formData, Genre: e.target.value })
                          }
                        >
                          <option value="Fiction">Fiction</option>
                          <option value="Mystery">Mystery</option>
                          <option value="Romance">Romance</option>
                          <option value="Thriller">Thriller</option>
                          <option value="Fantasy">Fantasy</option>
                          <option value="Sci-Fi">Sci-Fi</option>
                          <option value="Non Fiction">Non Fiction</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Year
                        </label>
                        <input
                          type="number"
                          required
                          className="w-full p-2 border rounded"
                          value={formData.Year}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              Year: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="w-full p-2 border rounded"
                          value={formData.Price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              Price: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Rating
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          required
                          className="w-full p-2 border rounded"
                          value={formData.UserRating}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              UserRating: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Add Book
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Invisible element to scroll into view */}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-2 px-4 py-2 bg-gray-100 border-t">
        <button
          onClick={() => {
            setMessage("Show all books");
            handleSendMessage({ preventDefault: () => {} });
          }}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 text-black"
        >
          📚 Show all books
        </button>
        <button
          onClick={() => {
            setMessage("Add a new book");
            handleSendMessage({ preventDefault: () => {} });
          }}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 text-black"
        >
          ➕ Add book
        </button>
        <button
          onClick={() => {
            setMessage("Recommend a mystery book");
            handleSendMessage({ preventDefault: () => {} });
          }}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 text-black"
        >
          🔍 Recommend mystery
        </button>
        <button
          onClick={() => {
            setMessage("Help");
            handleSendMessage({ preventDefault: () => {} });
          }}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 text-black"
        >
          ❓ Help
        </button>
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about books or recommendations..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
