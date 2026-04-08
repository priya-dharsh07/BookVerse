import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server as SocketIO } from "socket.io";

import authRoutes from "./routes/auth.js";
import searchRoutes from "./routes/search.js";
import usersRoutes from "./routes/users.js";
import chatRoutes, { Chat } from "./routes/chat.js";

import fs from "fs";
import path from "path";
import User from "./models/user.js";

dotenv.config();

const uploadPath = path.join(process.cwd(), "public", "uploads");
const avatarPath = path.join(process.cwd(), "public", "avatars");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
if (!fs.existsSync(avatarPath)) fs.mkdirSync(avatarPath, { recursive: true });

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadPath));
app.use("/avatars", express.static(avatarPath));

app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/books/recommendations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId" });

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const otherUsers = await User.find({
      _id: { $ne: currentUser._id },
      "uploads.0": { $exists: true },
    });

    const backendHost = process.env.BACKEND_URL || "http://localhost:5000";
    const allBooks = [];

    otherUsers.forEach((user) => {
      user.uploads.forEach((book) => {
        allBooks.push({
          ...book.toObject(),
          owner: {
            _id: user._id,
            fullName: user.fullName || "Unknown",
            username: user.username || "unknown",
            avatar: user.avatar || "default.jpg",
          },
        });
      });
    });

    const recommended = allBooks
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map((book) => ({
        ...book,
        cover: book.cover?.startsWith("http")
          ? book.cover
          : `${backendHost}${book.cover || "/uploads/default.jpg"}`,
        owner: {
          ...book.owner,
          avatar: book.owner.avatar?.startsWith("http")
            ? book.owner.avatar
            : `${backendHost}/avatars/${book.owner.avatar || "default.jpg"}`,
        },
      }));

    res.json(recommended);
  } catch (err) {
    console.error("Recommendations error:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

app.get("/", (req, res) => res.send("BookVerse Backend Running!"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("joinRoom", ({ userId, ownerId }) => {
    if (!userId || !ownerId) return;
    const roomId = [userId, ownerId].sort().join("_");
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  socket.on("sendMessage", async ({ userId, ownerId, text }) => {
    if (!text?.trim()) return;
    const roomId = [userId, ownerId].sort().join("_");

    try {
      let chat = await Chat.findOne({ participants: { $all: [userId, ownerId] } });
      if (!chat) chat = new Chat({ participants: [userId, ownerId], messages: [] });

      const newMessage = { sender: userId, text: text.trim(), createdAt: new Date() };
      chat.messages.push(newMessage);
      await chat.save();

      const populatedChat = await chat.populate("messages.sender", "_id fullName avatar");
      const lastMessage = populatedChat.messages[populatedChat.messages.length - 1];

      io.to(roomId).emit("receiveMessage", lastMessage);
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

  socket.on("typing", ({ userId, ownerId, isTyping }) => {
    if (!userId || !ownerId) return;
    const roomId = [userId, ownerId].sort().join("_");
    socket.to(roomId).emit("typing", { userId, isTyping });
  });

  socket.on("disconnect", () => console.log("❌ Client disconnected:", socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
