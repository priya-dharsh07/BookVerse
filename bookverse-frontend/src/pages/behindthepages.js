import React, { useState } from "react";
import axios from "axios";

const API_KEY = "AIzaSyDeUSuVlhchkFadPXL2ArXefyefj38nxuY"; 

export default function BehindThePages() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchBooks = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}`
      );
      setResults(res.data.items || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch books. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const showBookDetails = async (book) => {
    setSelectedBook(book.volumeInfo);
  };

  return (
    <div className="min-h-screen bg-nightBlack text-white p-6 max-w-[1400px] mx-auto">
      <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#64CCC5] to-[#FFD700] bg-clip-text text-transparent">
        Behind the Pages
      </h1>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search for a book..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-gray-900 border border-[#64CCC5] focus:outline-none"
        />
        <button
          onClick={searchBooks}
          className="px-4 py-2 bg-[#64CCC5] text-black font-semibold rounded-lg hover:bg-white transition"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {/* Search Results */}
      {!selectedBook ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {results.map((book) => (
            <div
              key={book.id}
              className="bg-gray-900 p-3 rounded-lg border border-gray-700 hover:border-[#64CCC5] cursor-pointer"
              onClick={() => showBookDetails(book)}
            >
              <img
                src={book.volumeInfo.imageLinks?.thumbnail}
                alt={book.volumeInfo.title}
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <h2 className="font-semibold text-lg">{book.volumeInfo.title}</h2>
              <p className="text-gray-400 text-sm">{book.volumeInfo.authors?.join(", ")}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 p-6 rounded-lg border border-[#64CCC5] max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedBook(null)}
            className="mb-4 text-[#64CCC5] hover:underline"
          >
            ← Back to search
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={selectedBook.imageLinks?.thumbnail}
              alt={selectedBook.title}
              className="w-52 h-80 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-3xl font-bold">{selectedBook.title}</h2>
              <p className="text-xl text-gray-300 mb-2">
                {selectedBook.authors?.join(", ")}
              </p>
              {selectedBook.averageRating && (
                <p className="text-yellow-400 font-semibold">
                  ⭐ {selectedBook.averageRating} / 5
                </p>
              )}
              <p className="mt-3 text-gray-400 italic">
                {selectedBook.publishedDate} • {selectedBook.publisher}
              </p>
              <p className="mt-4 text-gray-300">{selectedBook.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
