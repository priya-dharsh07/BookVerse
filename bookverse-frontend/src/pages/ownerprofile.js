import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Book, User } from "lucide-react";

export default function OwnerProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookId, ownerId } = location.state || {};

  const owner = { name: "John Doe", username: "johndoe123", userId: ownerId };
  const book = { title: "Sample Book", isAvailable: true, coverUrl: "" };

  const goToChat = () => {
    navigate(`/ownerchat/${owner.userId}`, { state: { book } });
  };

  return (
    <div className="bg-nightBlack min-h-screen text-white p-6 flex flex-col items-center">
      {/* Owner & Book Info Card */}
      <div className="w-full md:w-2/3 bg-gray-900/50 backdrop-blur-lg border border-[#64CCC5] rounded-2xl p-6 mb-6 shadow-lg hover:shadow-[#64CCC5]/50 transition">
        <div className="flex items-center gap-6 mb-4">
          <User className="text-[#64CCC5] w-16 h-16" />
          <div>
            <h2 className="text-3xl font-bold">{owner.name}</h2>
            <p className="text-gray-400">@{owner.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Book className="text-[#64CCC5]" />
          <div>
            <p className="font-semibold">{book.title}</p>
            <p className={`text-sm ${book.isAvailable ? "text-green-400" : "text-red-400"}`}>
              {book.isAvailable ? "Available to Borrow" : "Currently Lent Out"}
            </p>
          </div>
        </div>

        {book.coverUrl && (
          <img src={book.coverUrl} alt={book.title} className="w-32 h-40 rounded-lg object-cover mt-2" />
        )}
      </div>

      {book.isAvailable && (
        <button
          onClick={goToChat}
          className="px-4 py-1 text-sm bg-[#64CCC5]/80 text-black font-bold rounded-lg hover:bg-white hover:text-black transition"
        >
          Chat with {owner.name} about "{book.title}"
        </button>
      )}
    </div>
  );
}
