import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const backendURL = "http://localhost:5000";

export default function OwnerProfile() {
  const { ownerId, bookId } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = localStorage.getItem("userId");

  const getImageURL = (path, type = "avatar") => {
    if (!path)
      return type === "avatar"
        ? `${backendURL}/avatars/default.jpg`
        : `${backendURL}/uploads/default.jpg`;
    if (path.startsWith("http")) return path;
    return `${backendURL}${path}`;
  };

  useEffect(() => {
    const fetchOwnerBook = async () => {
      try {
        setLoading(true);
        const [userRes, bookRes] = await Promise.all([
          axios.get(`${backendURL}/api/users/${ownerId}`),
          axios.get(`${backendURL}/api/users/${ownerId}/book/${bookId}`)
        ]);

        setOwner({
          ...userRes.data.user,
          uploads: userRes.data.books,
          favorites: userRes.data.favorites
        });
        setBook(bookRes.data.book);
      } catch (err) {
        console.error("Error fetching owner/book:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerBook();
  }, [ownerId, bookId]);

  if (loading) return <p className="text-center text-[#64CCC5]">Loading...</p>;
  if (!owner || !book)
    return <p className="text-center text-red-400">Owner or Book not found</p>;

  return (
    <div className="p-10 min-h-screen bg-nightBlack text-white">
      {/* Owner info */}
      <div className="bg-spacePurple/90 p-6 rounded-xl shadow-md flex gap-6 items-center">
        <img
          src={getImageURL(owner.avatar)}
          alt={owner.fullName}
          className="w-24 h-24 rounded-full border-4 border-[#64CCC5]"
        />
        <div>
          <h2 className="text-2xl font-bold">{owner.fullName}</h2>
          <p className="text-gray-300">@{owner.username}</p>
          <p className="text-gray-400 text-sm mt-2">{owner.about || "No bio yet."}</p>
          <div className="mt-3 flex gap-6 text-sm text-gray-300">
            <p>Uploads: <span className="text-[#64CCC5] font-bold">{owner.uploads?.length || 0}</span></p>
            <p>Favorites: <span className="text-[#64CCC5] font-bold">{owner.favorites?.length || 0}</span></p>
          </div>
        </div>
      </div>

      {/* Selected Book */}
      <div className="mt-10 bg-darkPurple p-6 rounded-xl shadow-md max-w-md mx-auto">
        <img
          src={getImageURL(book.cover, "cover")}
          alt={book.title}
          className="w-48 h-64 object-cover mx-auto rounded-lg"
        />
        <h3 className="text-xl font-bold mt-4 text-center">{book.title}</h3>
        <p className="text-gray-300 text-center">by {book.author}</p>
        <p className="mt-1 text-sm text-center text-gray-400">{book.genre}</p>
        <p className={`mt-2 text-sm font-medium text-center ${book.status === "Available" ? "text-green-400" : "text-red-400"}`}>
          {book.status}
        </p>

        {book.status === "Available" && currentUserId && (
  <button
    className="mt-6 w-full px-4 py-2 bg-[#64CCC5] text-black font-bold rounded-lg hover:bg-[#52aaa5] transition"
    onClick={() =>
      navigate(`/ownerchat/${owner._id}/${book._id}`, {
        state: { currentUserId, book },
      })
    }
  >
    Chat with {owner.fullName.split(" ")[0]} & Borrow
  </button>
)}

      </div>
    </div>
  );
}
