import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backendURL = "http://localhost:5000";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [uploadedBooks, setUploadedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (path.startsWith("http")) return path;
    return `${backendURL}${path}`;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(`${backendURL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user || null);
      setUploadedBooks(res.data.uploads || []);
      setFavoriteBooks(
        (res.data.favorites || []).map((fav) => ({
          _id: fav._id || fav.bookId,
          ...fav,
        }))
      );
    } catch (err) {
      console.error("Fetch profile error:", err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFavorite = async (book) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.post(
        `${backendURL}/api/auth/favorite`,
        {
          bookId: book._id,
          title: book.title,
          author: book.author,
          cover: book.cover,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFavoriteBooks(
        (res.data.favorites || []).map((fav) => ({
          _id: fav._id || fav.bookId,
          ...fav,
        }))
      );
    } catch (err) {
      console.error("Toggle favorite error:", err);
      fetchProfile();
    }
  };

  const deleteUpload = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.delete(`${backendURL}/api/auth/upload/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.uploads) setUploadedBooks(res.data.uploads);
      if (res.data.favorites)
        setFavoriteBooks(
          res.data.favorites.map((fav) => ({
            _id: fav._id || fav.bookId,
            ...fav,
          }))
        );
    } catch (err) {
      console.error("Delete upload error:", err);
      fetchProfile();
    }
  };

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

  if (loading)
    return <p className="text-white text-center mt-20">Loading profile...</p>;
  if (!user)
    return <p className="text-white text-center mt-20">No user data</p>;

  return (
    <div className="min-h-screen bg-nightBlack text-white p-10">
      {/* Profile Header */}
      <div className="bg-spacePurple/90 rounded-2xl p-6 shadow-lg flex items-center gap-6">
        <img
          src={getImageURL(user.avatar, "avatar")}
          alt={user.fullName}
          className="w-28 h-28 rounded-full border-4 border-[#64CCC5] shadow-md"
        />

        <div>
          <h2 className="text-3xl font-bold">{user.fullName}</h2>
          <p className="text-gray-400">@{user.username}</p>
          <div className="mt-2">
            {user.about ? (
              <p className="text-gray-300 text-sm italic bg-darkPurple/50 p-2 rounded-lg max-w-md">
                {user.about}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic bg-darkPurple/20 p-2 rounded-lg max-w-md">
                No bio yet — click Edit Profile to add one.
              </p>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Joined {formatJoinedDate(user.createdAt)}
          </p>
        </div>

        <div className="ml-auto flex gap-6 text-center">
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

      {/* My Uploads */}
      <div className="mt-14">
        <h3 className="text-xl font-bold mb-6 text-[#64CCC5]">My Uploads</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 place-items-center">
          {uploadedBooks.length === 0 && (
            <p className="text-gray-400">You haven't uploaded any books yet.</p>
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

              <div className="flex flex-col gap-2 mt-3">
                <button
                  onClick={() => navigate("/uploadbook", { state: { book } })}
                  className="px-3 py-1 bg-[#64CCC5] text-black font-bold rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteUpload(book._id)}
                  className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg"
                >
                  Delete
                </button>
                <button
                  onClick={() => toggleFavorite(book)}
                  className={`px-3 py-1 font-bold rounded-lg transition ${
                    favoriteBooks.some((fav) => fav._id === book._id)
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {favoriteBooks.some((fav) => fav._id === book._id)
                    ? "★ Unfavorite"
                    : "☆ Favorite"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-12 flex justify-center gap-6">
        <button
          onClick={() => navigate("/editprofile")}
          className="px-6 py-2 bg-[#64CCC5] text-black font-bold rounded-xl"
        >
          Edit Profile
        </button>
        <button
          onClick={() => navigate("/uploadbook")}
          className="px-6 py-2 bg-[#64CCC5] text-black font-bold rounded-xl"
        >
          Upload
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
