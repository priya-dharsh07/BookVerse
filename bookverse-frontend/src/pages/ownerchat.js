import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Send } from "lucide-react";

export default function OwnerChat() {
  const { ownerId } = useParams(); 
  const location = useLocation();
  const [message, setMessage] = useState("");

  const book = location.state?.book || { title: "Unknown Book" };

  // Dummy owner info
  const owner = { id: ownerId, name: "Owner " + ownerId, avatar: "/avatars/avatar1.jpg" };

  // optional: scroll messages when component loads or updates
  useEffect(() => {
    console.log("OwnerChat loaded for ownerId:", ownerId, "with book:", book);
  }, [ownerId, book]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      console.log("Send message to owner:", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-nightBlack text-white shadow-2xl border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-4 bg-spacePurple">
        <img src={owner.avatar} alt="avatar" className="w-12 h-12 rounded-full border border-gray-600" />
        <div>
          <h2 className="font-bold">{owner.name}</h2>
          <p className="text-sm text-gray-400">Chatting about "{book.title}"</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="flex items-start">
          <div className="bg-darkPurple px-4 py-2 max-w-xs border border-gray-600 rounded-lg">
            Hi! Interested in borrowing "{book.title}"?
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700 flex items-center bg-spacePurple">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-nightBlack text-white px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-aqua placeholder-gray-400"
        />
        <button type="submit" className="ml-3 bg-aqua text-black px-4 py-2 border border-gray-600 rounded-md hover:bg-white hover:text-black transition">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
