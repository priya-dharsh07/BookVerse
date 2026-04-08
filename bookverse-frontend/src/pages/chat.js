import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backendURL = "http://localhost:5000";

export default function ChatList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchChats = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`${backendURL}/api/chat/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(res.data);
      } catch (err) {
        console.error("Fetch chats error:", err.response?.data || err.message);
      }
    };

    fetchChats();
  }, [userId, token]);

  const getImageURL = (avatar) =>
    avatar?.startsWith("http")
      ? avatar
      : `${backendURL}/avatars/${avatar || "default.jpg"}`;

  return (
    <div className="flex flex-col h-screen bg-nightBlack text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-spacePurple">
        <h1 className="text-xl font-bold">Chats</h1>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No chats yet</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.chatId || chat.user._id}
              className="flex items-center gap-4 p-4 border-b border-gray-700 cursor-pointer hover:bg-darkPurple transition"
              onClick={() => navigate(`/owner-chat/${chat.user._id}`)}
            >
              {/* User Avatar */}
              <img
                src={getImageURL(chat.user.avatar)}
                alt={chat.user.fullName}
                className="w-12 h-12 rounded-full border border-gray-600"
              />

              {/* User Info & Last Message */}
              <div className="flex-1 flex flex-col">
                <div className="flex flex-col">
                  <h2 className="font-bold">{chat.user.fullName}</h2>
                  <span className="text-gray-300 text-sm">@{chat.user.username}</span>
                </div>
                <p className="text-sm text-gray-400 truncate mt-1">
                  {chat.lastMessage
                    ? `${chat.lastMessage.sender}: ${chat.lastMessage.text}`
                    : "No messages yet"}
                </p>
              </div>

              {/* Timestamp */}
              {chat.lastMessage && (
                <p className="text-xs text-gray-500">
                  {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
