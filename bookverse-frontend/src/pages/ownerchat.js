import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

const backendURL = "http://localhost:5000";

export default function OwnerChat() {
  const { ownerId } = useParams();
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [owner, setOwner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const getImageURL = (path) =>
    path?.startsWith("http") ? path : `${backendURL}${path || "/avatars/default.jpg"}`;

  // Initialize socket.io
  useEffect(() => {
    if (!currentUserId || !token) return;

    const socket = io(backendURL, { auth: { token } });
    socketRef.current = socket;

    socket.emit("joinRoom", { roomId: [currentUserId, ownerId].sort().join("_") });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [currentUserId, ownerId, token]);

  // Fetch owner info & chat history
  useEffect(() => {
    const fetchChat = async () => {
      if (!currentUserId || !ownerId) return;
      setLoading(true);
      try {
        const ownerRes = await axios.get(`${backendURL}/api/users/${ownerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOwner(ownerRes.data.user);

        const chatRes = await axios.get(
          `${backendURL}/api/chat/${currentUserId}/${ownerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(Array.isArray(chatRes.data) ? chatRes.data : []);
      } catch (err) {
        console.error("Fetch chat error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };

    fetchChat();
  }, [ownerId, currentUserId, token]);

  // Auto scroll
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg) return;

    setMessage("");
    try {
      const res = await axios.post(
        `${backendURL}/api/chat/${currentUserId}/${ownerId}`,
        { text: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      socketRef.current.emit("sendMessage", res.data);
    } catch (err) {
      console.error("Send message error:", err.response?.data || err.message);
    }
  };

  if (!currentUserId) return <p className="text-center text-red-400 mt-10">Please login.</p>;
  if (loading) return <p className="text-center text-[#64CCC5] mt-10">Loading chat...</p>;
  if (!owner) return <p className="text-center text-red-400 mt-10">Owner not found</p>;

  return (
    <div className="flex flex-col h-[90vh] bg-nightBlack text-white shadow-2xl border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
<div className="p-4 border-b border-gray-700 flex flex-col gap-1 bg-spacePurple">
  <div className="flex items-center gap-4">
    <img
      src={getImageURL(owner.avatar)}
      alt={owner.fullName}
      className="w-12 h-12 rounded-full border border-gray-600"
    />
    <div className="flex flex-col">
      <h2 className="font-bold">{owner.fullName}</h2>
      <span className="text-gray-300 text-sm">@{owner.username}</span>
    </div>
  </div>
</div>


      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet. Say hi!</p>
        ) : (
          messages.map((msg) => {
            const isMe = String(msg.sender?._id) === String(currentUserId);
            return (
              <div key={msg._id || Math.random()} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-2 max-w-xs border rounded-lg ${isMe ? "bg-aqua text-black border-gray-600" : "bg-darkPurple border-gray-600"}`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
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
