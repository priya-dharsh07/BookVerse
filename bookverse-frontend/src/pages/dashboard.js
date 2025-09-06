import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, User, Book, MessageSquare, Settings } from "lucide-react";

export default function VerseBoard() {
  const navigate = useNavigate();

  // Dummy data
  const [stats] = useState({
    uploads: 12,
    favorites: 34,
    followers: 120,
    following: 80,
  });

  const [recommendations] = useState([
    { id: 1, title: "The Silent Patient", author: "Alex Michaelides", ownerId: "user1", isAvailable: true },
    { id: 2, title: "Atomic Habits", author: "James Clear", ownerId: "user2", isAvailable: false },
    { id: 3, title: "1984", author: "George Orwell", ownerId: "user3", isAvailable: true },
    { id: 4, title: "Sapiens", author: "Yuval Noah Harari", ownerId: "user4", isAvailable: true },
  ]);

  const handleBorrow = (book) => {
    navigate("/ownerprofile", { state: { book, ownerId: book.ownerId } });
  };

  return (
    <div className="bg-nightBlack min-h-screen text-white p-6">
      <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#64CCC5] via-[#FFD700] to-[#FF6B6B]">
       VerseBoard</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search books, authors, or users..."
          className="w-full p-3 rounded-lg bg-gray-900 border border-[#64CCC5] focus:outline-none focus:ring-2 focus:ring-[#64CCC5] placeholder-gray-400"
        />
      </div>

      {/* Stats (keep default style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stats-card">
          <Book className="text-[#64CCC5] mx-auto" />
          <p className="text-center mt-2 font-bold">{stats.uploads}</p>
          <p className="text-center text-gray-400 text-sm">Uploads</p>
        </div>
        <div className="stats-card">
          <Heart className="text-pink-500 mx-auto" />
          <p className="text-center mt-2 font-bold">{stats.favorites}</p>
          <p className="text-center text-gray-400 text-sm">Favorites</p>
        </div>
        <div className="stats-card">
          <User className="text-yellow-400 mx-auto" />
          <p className="text-center mt-2 font-bold">{stats.followers}</p>
          <p className="text-center text-gray-400 text-sm">Followers</p>
        </div>
        <div className="stats-card">
          <User className="text-green-400 mx-auto" />
          <p className="text-center mt-2 font-bold">{stats.following}</p>
          <p className="text-center text-gray-400 text-sm">Following</p>
        </div>
      </div>

      {/* Quick Actions (thin sleek Vox-style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/uploadbook"
          className="flex flex-col items-center py-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-[#64CCC5] transition cursor-pointer"
        >
          <Book className="w-8 h-8 text-[#64CCC5]" />
          <p className="mt-2 font-medium text-sm text-center">Upload Book</p>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center py-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-[#64CCC5] transition cursor-pointer"
        >
          <User className="w-8 h-8 text-green-400" />
          <p className="mt-2 font-medium text-sm text-center">Profile</p>
        </Link>
        <Link
          to="/chat"
          className="flex flex-col items-center py-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-[#64CCC5] transition cursor-pointer"
        >
          <MessageSquare className="w-8 h-8 text-purple-400" />
          <p className="mt-2 font-medium text-sm text-center">Messages</p>
        </Link>
        <Link
          to="/editprofile"
          className="flex flex-col items-center py-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-[#64CCC5] transition cursor-pointer"
        >
          <Settings className="w-8 h-8 text-yellow-400" />
          <p className="mt-2 font-medium text-sm text-center">Settings</p>
        </Link>
      </div>

      {/* Recommendations (thin sleek Vox-style) */}
      <h2 className="text-2xl font-bold mb-4">Recommended for you</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((book) => (
          <div
            key={book.id}
            className="flex flex-col p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-[#64CCC5] hover:shadow-md transition cursor-pointer"
          >
            <div className="h-36 bg-gray-800 rounded-lg flex items-center justify-center mb-2 text-gray-500">
              Book Cover
            </div>
            <p className="font-semibold">{book.title}</p>
            <p className="text-gray-400 text-sm">{book.author}</p>
            <p className={`mt-1 text-sm ${book.isAvailable ? "text-green-400" : "text-red-400"}`}>
              {book.isAvailable ? "Available" : "Lent Out"}
            </p>
            {book.isAvailable && (
              <button
                onClick={() => handleBorrow(book)}
                className="mt-2 px-3 py-1 text-sm bg-[#64CCC5]/90 text-black rounded hover:bg-white hover:text-black transition"
              >
                Borrow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
