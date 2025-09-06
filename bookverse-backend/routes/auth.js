import express from "express"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import authMiddleware from "../middleware/auth_middleware.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, username, email, password, avatar } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, username, email, password: hashedPassword, avatar, about: "", uploads: [], favorites: [], followers: 0, following: 0 });
    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, username: user.username, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ user, uploads: user.uploads, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put("/edit", authMiddleware, async (req, res) => {
  try {
    const { fullName, username, email, avatar, about } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { fullName, username, email, avatar, about }, { new: true, runValidators: true }).select("-password");
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload book
router.post("/upload", authMiddleware, async (req, res) => {
  try {
    const { title, author, cover, status } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    const newBook = { title, author, cover, status };
    user.uploads.push(newBook);
    await user.save();
    res.status(201).json({ uploads: user.uploads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update upload
router.put("/upload/:id", authMiddleware, async (req, res) => {
  try {
    const { title, author, cover, status } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const book = user.uploads.id(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    book.title = title || book.title;
    book.author = author || book.author;
    book.cover = cover || book.cover;
    book.status = status || book.status;

    await user.save();
    res.json({ uploads: user.uploads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete upload
router.delete("/upload/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.uploads = user.uploads.filter((book) => book._id.toString() !== req.params.id);
    user.favorites = user.favorites.filter((fav) => fav.bookId?.toString() !== req.params.id);

    await user.save();
    res.json({ uploads: user.uploads, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle favorite
router.post("/favorite", authMiddleware, async (req, res) => {
  try {
    const { bookId, title, author, cover } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const index = user.favorites.findIndex((fav) => fav.bookId?.toString() === bookId);
    if (index >= 0) user.favorites.splice(index, 1);
    else user.favorites.push({ bookId, title, author, cover });

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfavorite
router.delete("/favorite/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.favorites = user.favorites.filter((fav) => fav.bookId?.toString() !== req.params.id);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
