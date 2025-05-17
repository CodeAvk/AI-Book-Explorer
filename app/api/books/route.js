// app/api/books/route.js
import { connectDB, Book } from "../../lib/database";
// import {} from ""

// GET all books
export async function GET() {
  try {
    await connectDB();
    console.log("GET request received");
    // const books = await Book.find().sort({ Name: 1 }).exec();
    const books = await Book.find();
    // console.log("Books:", books);
    return new Response(JSON.stringify(books), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch books" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST a new book
export async function POST(request) {
  try {
    await connectDB();
    const bookData = await request.json();

    // Basic validation
    if (!bookData.Name || !bookData.Author) {
      return new Response(
        JSON.stringify({ error: "Name and Author are required" }),
        { status: 400 }
      );
    }

    const newBook = new Book(bookData);
    await newBook.save();

    return new Response(JSON.stringify(newBook), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to create book",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
