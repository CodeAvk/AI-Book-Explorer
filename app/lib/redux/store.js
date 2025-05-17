import { configureStore } from "@reduxjs/toolkit";
import bookReducer from "./bookSlice";
import { useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    books: bookReducer,
  },
});

// // Infer the `RootState` and `AppDispatch` types from the store itself
// export const RootState = store.getState;
// export const AppDispatch = store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;