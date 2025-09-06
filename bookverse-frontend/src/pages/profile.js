import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [uploadedBooks, setUploadedBooks] = useState([]);

  const formatJoinedDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", { month: "short", year: "numeric" });
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get("http://localhost:5000/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data.user);
      setFavoriteBooks(res.data.favorites || []);
      setUploadedBooks(res.data.uploads || []);
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const toggleFavorite = async (book) => {
    try {
      const token = localStorage.getItem("token");
      const isFav = favoriteBooks.some((fav) => fav._id === book._id || fav.bookId === book._id);

      if (isFav) {
        setFavoriteBooks((prev) => prev.filter((fav) => fav._id !== book._id && fav.bookId !== book._id));
        await axios.delete(`http://localhost:5000/api/auth/favorite/${book._id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        setFavoriteBooks((prev) => [...prev, { ...book, bookId: book._id }]);
        await axios.post("http://localhost:5000/api/auth/favorite", { bookId: book._id, title: book.title, author: book.author, cover: book.cover }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (err) {
      console.error(err);
      fetchProfile();
    }
  };

  const deleteUpload = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/auth/upload/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUploadedBooks((prev) => prev.filter((book) => book._id !== id));
      setFavoriteBooks((prev) => prev.filter((fav) => fav._id !== id && fav.bookId !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p className="text-white text-center mt-20">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-nightBlack text-white p-10">
      <div className="bg-spacePurple/90 rounded-2xl p-6 shadow-lg flex items-center gap-6">
        <img src={user.avatar || "/avatars/default.jpg"} alt={user.fullName} className="w-28 h-28 rounded-full border-4 border-[#64CCC5] shadow-md"/>
        <div>
  <h2 className="text-3xl font-bold">{user.fullName}</h2>
  <p className="text-gray-400">@{user.username}</p>

  {/* About Section */}
  {user.about && (
    <p className="mt-2 text-gray-300 text-sm italic bg-darkPurple/50 p-2 rounded-lg max-w-md">
      {user.about}
    </p>
  )}
</div>

        <div className="ml-auto flex gap-6 text-center">
          <div>
            <p className="text-xl font-bold text-[#64CCC5]">{uploadedBooks.length}</p>
            <p className="text-gray-400 text-sm">Uploads</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#64CCC5]">{favoriteBooks.length}</p>
            <p className="text-gray-400 text-sm">Favorites</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-[#64CCC5]">Favorite Books</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favoriteBooks.map((book) => (
            <div key={book._id || book.bookId} className="bg-darkPurple rounded-xl p-4 shadow-md">
              <img src={book.cover || "/images/book-placeholder.jpg"} alt={book.title} className="w-full h-40 object-cover rounded-lg mb-3"/>
              <h4 className="text-lg font-semibold">{book.title}</h4>
              <p className="text-gray-400 text-sm">by {book.author}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold mb-4 text-[#64CCC5]">My Uploads</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {uploadedBooks.map((book) => (
            <div key={book._id} className="relative group bg-darkPurple rounded-xl p-4 shadow-md hover:shadow-[#64CCC5]/40 transition">
              <img src={book.cover || "/images/book-placeholder.jpg"} alt={book.title} className="w-full h-40 object-cover rounded-lg mb-3"/>
              <h4 className="text-lg font-semibold">{book.title}</h4>
              <p className="text-gray-400 text-sm">by {book.author}</p>
              <p className={`mt-2 text-sm font-medium ${book.status === "Available" ? "text-green-400" : "text-red-400"}`}>{book.status}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => navigate("/uploadbook", { state: { book } })} className="px-3 py-1 bg-[#64CCC5] text-black font-bold rounded-lg">Edit</button>
                <button onClick={() => deleteUpload(book._id)} className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg">Delete</button>
                <button onClick={() => toggleFavorite(book)} className={`px-3 py-1 font-bold rounded-lg transition ${favoriteBooks.some((fav) => fav._id === book._id || fav.bookId === book._id) ? "bg-yellow-400 text-black" : "bg-gray-600 text-white"}`}>
                  {favoriteBooks.some((fav) => fav._id === book._id || fav.bookId === book._id) ? "★ Unfavorite" : "☆ Favorite"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-6">
        <button onClick={() => navigate("/editprofile")} className="px-6 py-2 bg-[#64CCC5] text-black font-bold rounded-xl">Edit Profile</button>
        <button onClick={() => navigate("/uploadbook")} className="px-6 py-2 bg-[#64CCC5] text-black font-bold rounded-xl">Upload</button>
        <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl">Logout</button>
      </div>
    </div>
  );
}
