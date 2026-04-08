import express from "express";
import mongoose from "mongoose";
import User from "../models/user.js";
const backendURL = "http://localhost:5000"; 

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -email");
    if (!user) return res.status(404).json({ error: "User not found" });

    const booksWithOwner = (user.uploads || []).map((book) => ({
      ...book.toObject(),
      owner: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar || "/avatars/default.jpg",
      },
    }));

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar,
        about: user.about || "",
        createdAt: user.createdAt,
      },
      books: booksWithOwner,
      favorites: user.favorites || [],
    });
  } catch (err) {
    console.error("Fetch user by ID error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.get("/:ownerId/book/:bookId", async (req, res) => {
  try {
    const { ownerId, bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ownerId))
      return res.status(400).json({ error: "Invalid owner ID" });
    if (!mongoose.Types.ObjectId.isValid(bookId))
      return res.status(400).json({ error: "Invalid book ID" });

    const user = await User.findById(ownerId).select("-password -email");
    if (!user) return res.status(404).json({ error: "Owner not found" });

    const book = user.uploads.find((b) => b._id.toString() === bookId);
    if (!book) {
      console.log("Available IDs:", user.uploads.map((b) => b._id.toString()));
      console.log("Requested ID:", bookId);
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({
      owner: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar || "/avatars/default.jpg",
        about: user.about || "",
      },
      book: {
        _id: book._id,
        title: book.title,
        author: book.author,
        cover: book.cover || "/uploads/default.jpg",
        genre: book.genre || "General",
        status: book.status || "Available",
      },
    });
  } catch (err) {
    console.error("Fetch book by owner error:", err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

export default router;
