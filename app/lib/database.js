import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
console.log(MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const bookSchema = new mongoose.Schema({
  Name: String,
  Author: String,
  UserRating: Number,
  Reviews: Number,
  Price: Number,
  Year: Number,
  Genre: String,
});

// const Book =
const Book =
  mongoose.models.Book || mongoose.model("Book", bookSchema, "books");

export { connectDB, Book };
