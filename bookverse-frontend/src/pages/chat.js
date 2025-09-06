import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const chats = [
    { id: 1, name: "Alice", avatar: "/avatars/avatar1.jpg", lastMessage: "Hey, how's BookVerse?" },
    { id: 2, name: "Bob", avatar: "/avatars/avatar2.jpg", lastMessage: "Got a new book to share!" },
    { id: 3, name: "Charlie", avatar: "/avatars/avatar3.jpg", lastMessage: "Let's trade novels!" },
  ];

  const goToOwnerChat = (chatId) => {
    navigate(`/ownerchat/${chatId}`, { state: { ownerId: chatId } });
  };

  return (
    <div className="flex flex-col h-[90vh] bg-nightBlack text-white shadow-2xl border border-gray-700 rounded-xl overflow-hidden">
      {/* Page Heading */}
      <div className="p-5 bg-gray-900 border-b border-gray-700 flex justify-center shadow-md">
        <h2 className="text-3xl font-bold tracking-wide text-[#64CCC5]">Chats</h2>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700 bg-gray-800 flex items-center rounded-b-xl">
        <Search className="text-gray-400 mr-3" size={20} />
        <input
          type="text"
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 text-white flex-1 px-3 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#64CCC5]"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-gray-900">
        {chats
          .filter((chat) => chat.name.toLowerCase().includes(search.toLowerCase()))
          .map((chat) => (
            <div
              key={chat.id}
              onClick={() => goToOwnerChat(chat.id)}
              className="p-4 flex items-center gap-4 cursor-pointer border-b border-gray-700 hover:bg-[#64CCC5]/20 transition-colors"
            >
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-14 h-14 rounded-full border-2 border-[#64CCC5] object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">{chat.name}</span>
                  <span className="text-xs text-gray-400">Online</span>
                </div>
                <p className="text-gray-300 text-sm mt-1 truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
