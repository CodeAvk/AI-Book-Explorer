// scripts/seed.js
require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const { connectDB, Book } = require("../lib/database");
const path = require("path");

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Connect to MongoDB
    await connectDB();
    console.log("Connected to database");

    const filePath = path.join(__dirname, "../lib/book-details.csv");
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
      throw new Error("CSV file not found at path: " + filePath);
    }

    const books = [];
    let recordCount = 0;

    // Process CSV file
    console.log("Reading CSV file...");
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          books.push({
            Name: row.Name,
            Author: row.Author,
            UserRating: parseFloat(row["User Rating"]), // Handle space in column name
            Reviews: parseInt(row.Reviews),
            Price: parseFloat(row.Price), // Using float for currency
            Year: parseInt(row.Year),
            Genre: row.Genre,
          });
          recordCount++;
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`Processed ${recordCount} records from CSV`);

    // Clear existing data
    console.log("Clearing existing book data...");
    const deleteResult = await Book.deleteMany();
    console.log(`Deleted ${deleteResult.deletedCount} existing records`);

    // Insert new data
    console.log("Inserting new records...");
    const insertResult = await Book.insertMany(books);
    console.log(`Successfully inserted ${insertResult.length} records`);

    // Create indexes
    console.log("Creating indexes...");
    await Book.createIndexes();
    console.log("Indexes created");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection during seeding:", err);
  process.exit(1);
});

seedDatabase();
