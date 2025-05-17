"use client";
import { Provider } from "react-redux";
import { store } from "./lib/redux/store";
import BookList from "./components/BookList";
import ChatInterface from "./components/ChatInterface";

export default function Home() {
  return (
    <Provider store={store}>
      <div className="container mx-auto p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          AI Book Explorer
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Book List Section */}
          <div className="md:col-span-2 bg-gray-50 p-6 rounded-lg shadow-md">
            <BookList />
          </div>

          {/* Chat Interface Section */}
          <div className="md:col-span-1">
            <ChatInterface />
          </div>
        </div>
      </div>
    </Provider>
  );
}
