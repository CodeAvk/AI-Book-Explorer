// redux/bookSlice.js
import { createSlice } from "@reduxjs/toolkit";

const bookSlice = createSlice({
  name: "books",
  initialState: {
    books: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addBook: (state, action) => {
      console.log("Adding book:", action.payload);
      state.books.push(action.payload);
    },
    setBooks: (state, action) => {
      console.log("Setting books:", action.payload);
      state.books = action.payload;
    },
  },
});

export const { addBook, setBooks } = bookSlice.actions;
export default bookSlice.reducer;
