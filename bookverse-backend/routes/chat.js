import express from "express";
import mongoose from "mongoose";
import User from "../models/user.js";

const router = express.Router();

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const chats = await Chat.find({ participants: userId })
  .populate("participants", "_id fullName avatar username") 
  .populate("messages.sender", "_id fullName avatar username") 
  .sort({ updatedAt: -1 });


    const chatList = chats.map((chat) => {
      const otherUser = chat.participants.find((p) => p._id.toString() !== userId);
      const lastMessage = chat.messages[chat.messages.length - 1];
      return {
        chatId: chat._id,
        user: otherUser,
        lastMessage: lastMessage
          ? {
              sender: lastMessage.sender.fullName,
              text: lastMessage.text,
              timestamp: lastMessage.createdAt,
            }
          : null,
      };
    });

    res.json(chatList);
  } catch (err) {
    console.error("Fetch chats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId/:ownerId", async (req, res) => {
  const { userId, ownerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(ownerId)) {
    return res.status(400).json({ message: "Invalid userId or ownerId" });
  }

  try {
    const chat = await Chat.findOne({
      participants: { $all: [userId, ownerId] },
    }).populate("messages.sender", "_id fullName avatar");

    if (!chat) return res.json([]); 
    res.json(chat.messages);
  } catch (err) {
    console.error("Fetch chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:userId/:ownerId", async (req, res) => {
  const { userId, ownerId } = req.params;
  const { text } = req.body;
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(ownerId)) {
    return res.status(400).json({ message: "Invalid userId or ownerId" });
  }
  if (!text || !text.trim()) return res.status(400).json({ message: "Message cannot be empty" });

  try {
    let chat = await Chat.findOne({ participants: { $all: [userId, ownerId] } });
    if (!chat) chat = new Chat({ participants: [userId, ownerId], messages: [] });

    const newMessage = { sender: userId, text: text.trim(), createdAt: new Date() };
    chat.messages.push(newMessage);
    await chat.save();

    const populatedChat = await chat.populate("messages.sender", "_id fullName avatar");
    res.json(populatedChat.messages[populatedChat.messages.length - 1]);
  } catch (err) {
    console.error("Send chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export { Chat }; 
export default router;
