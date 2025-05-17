"use client";
import { useState } from "react";
import { useAppDispatch } from "../lib/redux/store";
import { addBook } from "../lib/redux/bookSlice";

export default function AddBookForm() {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    Name: "",
    Author: "",
    Genre: "Fiction",   
    Year: new Date().getFullYear(),
    Price: 0,
    UserRating: 4.0,
    Reviews: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newBook = await response.json();
      dispatch(addBook(newBook));
      setFormData({
        Name: "",
        Author: "",
        Genre: "Fiction",
        Year: new Date().getFullYear(),
        Price: 0,
        UserRating: 4.0,
        Reviews: 0,
      });
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Add New Book</h3>
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          required
          className="w-full p-2 border rounded"
          value={formData.Name}
          onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Author</label>
        <input
          type="text"
          required
          className="w-full p-2 border rounded"
          value={formData.Author}
          onChange={(e) => setFormData({ ...formData, Author: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Genre</label>
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
            <option value="Non Fiction">Non Fiction</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Year</label>
          <input
            type="number"
            required
            className="w-full p-2 border rounded"
            value={formData.Year}
            onChange={(e) =>
              setFormData({ ...formData, Year: parseInt(e.target.value) })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Price ($)</label>
          <input
            type="number"
            step="0.01"
            required
            className="w-full p-2 border rounded"
            value={formData.Price}
            onChange={(e) =>
              setFormData({ ...formData, Price: parseFloat(e.target.value) })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Rating</label>
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
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Add Book
      </button>
    </form>
  );
}
