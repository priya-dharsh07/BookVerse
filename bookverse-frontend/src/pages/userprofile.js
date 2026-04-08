import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const backendURL = "http://localhost:5000";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [uploadedBooks, setUploadedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const formatJoinedDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getImageURL = (path, type = "avatar") => {
    if (!path) {
      return type === "avatar"
        ? `${backendURL}/avatars/default.jpg`
        : `${backendURL}/uploads/default.jpg`;
    }
    if (path.startsWith("blob:") || path.startsWith("data:")) return path; // local or base64 upload
    if (path.startsWith("http")) return path;
    return `${backendURL}${path}`;
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendURL}/api/users/${id}`);
      const u = res.data.user;
      setUser(u);
      setUploadedBooks(res.data.books || []);
      setFavoriteBooks(res.data.favorites || []);
    } catch (err) {
      console.error("Fetch user profile error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    const token = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");
    if (!token || !currentUserId) return navigate("/login");

    try {
      await axios.get(`${backendURL}/api/chat/${currentUserId}/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/owner-chat/${user._id}`);
    } catch (err) {
      console.error("Chat error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line
  }, [id]);

  if (loading)
    return <p className="text-white text-center mt-20">Loading profile...</p>;
  if (!user)
    return <p className="text-white text-center mt-20">User not found</p>;

  return (
    <div className="min-h-screen bg-nightBlack text-white p-10">
      {/* User Header */}
      <div className="bg-spacePurple/90 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center gap-6">
        <img
          src={getImageURL(user.avatar, "avatar")}
          alt={user.fullName}
          className="w-28 h-28 rounded-full border-4 border-[#64CCC5] shadow-md"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold">{user.fullName}</h2>
          <p className="text-gray-400">@{user.username}</p>
          <div className="mt-2">
            {user.about ? (
              <p className="text-gray-300 text-sm italic bg-darkPurple/50 p-2 rounded-lg max-w-md mx-auto md:mx-0">
                {user.about}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic bg-darkPurple/20 p-2 rounded-lg max-w-md mx-auto md:mx-0">
                No bio yet.
              </p>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Joined {formatJoinedDate(user.createdAt)}
          </p>
        </div>

        {/* Stats + Chat Button */}
        <div className="ml-auto flex flex-col gap-4 text-center mt-4 md:mt-0">
          <div className="flex gap-6 justify-center">
            <div>
              <p className="text-xl font-bold text-[#64CCC5]">
                {uploadedBooks.length}
              </p>
              <p className="text-gray-400 text-sm">Uploads</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[#64CCC5]">
                {favoriteBooks.length}
              </p>
              <p className="text-gray-400 text-sm">Favorites</p>
            </div>
          </div>
          <button
            onClick={startChat}
            className="mt-2 px-6 py-2 bg-[#64CCC5] text-black font-bold rounded-xl"
          >
            Chat
          </button>
        </div>
      </div>

      {/* Favorite Books */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-6 text-[#64CCC5]">Favorite Books</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 place-items-center">
          {favoriteBooks.length === 0 && (
            <p className="text-gray-400">No favorites yet.</p>
          )}
          {favoriteBooks.map((book) => (
            <div
              key={book._id}
              className="bg-darkPurple rounded-xl p-4 shadow-md w-[250px] text-center hover:shadow-[#64CCC5]/40 transition"
            >
              <img
                src={getImageURL(book.cover, "cover")}
                alt={book.title}
                className="w-[200px] h-[300px] object-cover rounded-lg mb-3 mx-auto shadow-md"
              />
              <h4 className="text-lg font-semibold truncate">{book.title}</h4>
              <p className="text-gray-400 text-sm">by {book.author}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Books */}
      <div className="mt-14">
        <h3 className="text-xl font-bold mb-6 text-[#64CCC5]">Uploads</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 place-items-center">
          {uploadedBooks.length === 0 && (
            <p className="text-gray-400">No uploads yet.</p>
          )}
          {uploadedBooks.map((book) => (
            <div
              key={book._id}
              className="relative bg-darkPurple rounded-xl p-4 shadow-md w-[250px] text-center hover:shadow-[#64CCC5]/40 transition"
            >
              <img
                src={getImageURL(book.cover, "cover")}
                alt={book.title}
                className="w-[200px] h-[300px] object-cover rounded-lg mb-3 mx-auto shadow-md"
              />
              <h4 className="text-lg font-semibold truncate">{book.title}</h4>
              <p className="text-gray-400 text-sm">by {book.author}</p>

              {book.genre && (
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full ${
                    genreColors[book.genre] || "bg-gray-500 text-white"
                  }`}
                >
                  {book.genre}
                </span>
              )}

              <p
                className={`mt-2 text-sm font-medium ${
                  book.status === "Available"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {book.status}
              </p>

              {book.status === "Available" && (
                <button
                  onClick={startChat}
                  className="mt-3 px-3 py-1 bg-[#64CCC5] text-black font-bold rounded-lg"
                >
                  Borrow / Chat
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
