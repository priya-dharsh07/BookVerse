import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Book, Heart, User, MessageSquare, Settings } from "react-feather";

const backendURL = "http://localhost:5000";

export default function Dashboard() {
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({
    uploads: 0,
    favorites: 0,
    followers: 0,
    following: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], books: [] });
  const navigate = useNavigate();

  const genreColors = {
    Fiction: "bg-blue-500",
    "Non-Fiction": "bg-green-500",
    Mystery: "bg-purple-500",
    Fantasy: "bg-pink-500",
    Science: "bg-yellow-500",
    Romance: "bg-red-500",
    Horror: "bg-gray-700 text-white",
    Thriller: "bg-indigo-600 text-white",
    "Crime Thriller": "bg-black text-white",
    "Historical Fiction": "bg-orange-500 text-black",
    Biography: "bg-green-500 text-black",
    Autobiography: "bg-cyan-400 text-black",
    Comics: "bg-lime-500 text-black",
    Comedy: "bg-rose-400 text-black",
  };

  const getImageURL = (path, type = "cover") => {
    if (!path)
      return type === "avatar"
        ? `${backendURL}/avatars/default.jpg`
        : `${backendURL}/uploads/default.jpg`;
    if (path.startsWith("http")) return path;
    return `${backendURL}${path}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const profileRes = await axios.get(`${backendURL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = profileRes.data.user;
        if (!user) {
          setError("Failed to fetch user data.");
          setLoading(false);
          return;
        }

        // stats
        setStats({
          uploads: Array.isArray(user.uploads) ? user.uploads.length : 0,
          favorites: Array.isArray(user.favorites) ? user.favorites.length : 0,
          followers: user.followers || 0,
          following: user.following || 0,
        });

        // recommendations
        const recRes = await axios.get(
          `${backendURL}/api/books/recommendations/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const books = (recRes.data || []).map((book) => ({
          _id: book._id || book.bookId,
          title: book.title || "Unknown Title",
          author: book.author || "Unknown Author",
          genre: book.genre || "",
          cover: getImageURL(book.cover, "cover"),
          ownerId: book.owner?._id || null,
          ownerAvatar: getImageURL(book.owner?.avatar, "avatar"),
          ownerName: book.owner?.fullName || "Unknown",
          ownerUsername: book.owner?.username || "unknown",
          isAvailable: book.status !== "Lent Out",
        }));

        setRecommendations(books);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to fetch data. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // handle search
  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);

    if (q.trim() === "") {
      setSearchResults({ users: [], books: [] });
      return;
    }

    try {
      const res = await axios.get(
        `${backendURL}/api/search?q=${encodeURIComponent(q)}`
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/userprofile/${userId}`);
    setQuery("");
    setSearchResults({ users: [], books: [] });
  };

  const handleBookClick = (ownerId, bookId) => {
    console.log("Navigating to OwnerProfile", { ownerId, bookId });
    navigate(`/ownerprofile/${ownerId}/${bookId}`);
    setQuery("");
    setSearchResults({ users: [], books: [] });
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-400">{error}</p>;

  return (
    <div className="bg-nightBlack min-h-screen text-white p-6">
      <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#64CCC5] via-[#FFD700] to-[#FF6B6B]">
        VerseBoard
      </h1>

      {/* Search */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search books, authors, or users..."
          className="w-full p-3 rounded-lg bg-gray-900 border border-[#64CCC5] focus:outline-none focus:ring-2 focus:ring-[#64CCC5] placeholder-gray-400"
        />

        {query && (
          <div className="absolute left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg mt-2 p-3 max-h-64 overflow-y-auto z-10">
            {/* Books */}
            {searchResults.books.length > 0 && (
              <div className="mb-3">
                <p className="text-[#64CCC5] font-semibold mb-1">Books</p>
                {searchResults.books.map((book) => (
                  <div
                    key={book.bookId}
                    className="flex items-center mb-2 cursor-pointer hover:bg-gray-800 p-2 rounded"
                    onClick={() => handleBookClick(book.ownerId, book.bookId)}
                  >
                    <img
                      src={getImageURL(book.cover, "cover")}
                      alt={book.title}
                      className="w-10 h-10 rounded mr-2 object-cover"
                    />
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-gray-400 text-sm">by {book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Users */}
            {searchResults.users.length > 0 && (
              <div>
                <p className="text-[#FFD700] font-semibold mb-1">Users</p>
                {searchResults.users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center mb-2 cursor-pointer hover:bg-gray-800 p-2 rounded"
                    onClick={() => handleUserClick(user._id)}
                  >
                    <img
                      src={getImageURL(user.avatar, "avatar")}
                      alt={user.username}
                      className="w-10 h-10 rounded-full mr-2 object-cover border border-[#64CCC5]"
                    />
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.users.length === 0 &&
              searchResults.books.length === 0 && (
                <p className="text-gray-400">No results found.</p>
              )}
          </div>
        )}
      </div>

      {/* Stats */}
<div className="grid grid-cols-2 gap-4 mb-8 justify-items-center">
  {[
    { Icon: Book, label: "Uploads", value: stats.uploads, color: "#64CCC5" },
    { Icon: Heart, label: "Favorites", value: stats.favorites, color: "pink" },
  ].map((item, idx) => (
    <div key={idx} className="stats-card flex flex-col items-center">
      <item.Icon style={{ color: item.color }} className="text-3xl" />
      <p className="mt-2 font-bold">{item.value}</p>
      <p className="text-gray-400 text-sm">{item.label}</p>
    </div>
  ))}
</div>


      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { to: "/uploadbook", Icon: Book, label: "Upload Book", color: "#64CCC5" },
          { to: "/profile", Icon: User, label: "Profile", color: "green" },
          { to: "/chat", Icon: MessageSquare, label: "Messages", color: "purple" },
          { to: "/editprofile", Icon: Settings, label: "Settings", color: "yellow" },
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className="flex flex-col items-center py-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-[#64CCC5] transition cursor-pointer"
          >
            <item.Icon style={{ color: item.color }} className="w-8 h-8" />
            <p className="mt-2 font-medium text-sm text-center">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Recommendations */}
      <h2 className="text-2xl font-bold mb-4">Recommended for you</h2>
      {recommendations.length === 0 ? (
        <p className="text-gray-400">No recommendations available.</p>
      ) : (
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {recommendations.map((book) => (
            <div
              key={book._id}
              className="flex flex-col p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-[#64CCC5] hover:shadow-md transition cursor-pointer"
            >
              <div className="h-80 bg-gray-800 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
  <img
    src={getImageURL(book.cover, "cover")}
    alt={book.title}
    className="w-full h-full object-cover"
  />
</div>

              <p className="font-semibold">{book.title}</p>
              <p className="text-gray-400 text-sm">{book.author}</p>
              {/* Genre Badge */}
              {book.genre && (
                <span
                  className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full max-w-max ${
                    genreColors[book.genre] || "bg-gray-500 text-white"
                  }`}
                >
                  {book.genre}
                </span>
              )}
              <p
                className={`mt-1 text-sm ${
                  book.isAvailable ? "text-green-400" : "text-red-400"
                }`}
              >
                {book.isAvailable ? "Available" : "Lent Out"}
              </p>
              <div className="flex items-center mt-2 mb-2">
                <img
                  src={getImageURL(book.ownerAvatar, "avatar")}
                  alt={book.ownerUsername}
                  className="w-8 h-8 rounded-full mr-2 border border-gray-600"
                />
                <div className="text-xs">
                  <p className="font-semibold">{book.ownerName}</p>
                  <p className="text-gray-400">@{book.ownerUsername}</p>
                </div>
              </div>
              {book.isAvailable ? (
                <button
                  onClick={() => handleBookClick(book.ownerId, book._id)}
                  className="mt-2 px-3 py-1 text-sm bg-[#64CCC5]/90 text-black rounded hover:bg-white hover:text-black transition text-center"
                >
                  Borrow
                </button>
              ) : (
                <p className="mt-2 px-3 py-1 text-sm bg-red-500/70 text-white rounded text-center">
                  Lent Out
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
