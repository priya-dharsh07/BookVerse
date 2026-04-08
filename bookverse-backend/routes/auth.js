import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import User from "../models/user.js";
import authMiddleware from "../middleware/auth_middleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});
const upload = multer({ storage });

const validateUserId = (req, res) => {
  if (!req.user || !req.user.id || req.user.id === "null") {
    res.status(400).json({ msg: "Invalid or missing user ID" });
    return false;
  }
  return true;
};


router.post("/register", async (req, res) => {
  try {
    const { fullName, username, email, password, avatar } = req.body;

    if (!fullName || !username || !email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      avatar: avatar || "/avatars/default.jpg",
      about: "",
      uploads: [],
      favorites: [],
    });

    await user.save();
    res.status(201).json({ msg: "User registered successfully", userId: user._id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar || "/avatars/default.jpg",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ user, uploads: user.uploads, favorites: user.favorites });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/edit", authMiddleware, async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;

    const { fullName, username, email, avatar, about } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, username, email, avatar, about },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ user: updatedUser });
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/upload", authMiddleware, upload.single("cover"), async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;

    const { title, author, status, genre } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const coverPath = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.jpg";

    const newBook = { title, author, cover: coverPath, status, genre };
    user.uploads.push(newBook);
    await user.save();

    res.status(201).json({ uploads: user.uploads });
  } catch (err) {
    console.error("Create upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/upload/:id", authMiddleware, upload.single("cover"), async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;

    const { title, author, status, coverUrl, genre } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const book = user.uploads.id(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (status) book.status = status;
    if (req.file) book.cover = `/uploads/${req.file.filename}`;
    else if (coverUrl) book.cover = coverUrl;

    await user.save();
    res.json({ uploads: user.uploads });
  } catch (err) {
    console.error("Update upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/upload/:id", authMiddleware, async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.uploads = user.uploads.filter((book) => book._id.toString() !== req.params.id);
    user.favorites = user.favorites.filter((fav) => fav.bookId?.toString() !== req.params.id);

    await user.save();
    res.json({ uploads: user.uploads, favorites: user.favorites });
  } catch (err) {
    console.error("Delete upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/favorite", authMiddleware, async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;

    const { bookId, title, author, cover } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const index = user.favorites.findIndex((fav) => fav.bookId?.toString() === bookId);
    if (index >= 0) user.favorites.splice(index, 1);
    else user.favorites.push({ bookId, title, author, cover });

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("Toggle favorite error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/favorite/:id", authMiddleware, async (req, res) => {
  try {
    if (!validateUserId(req, res)) return;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.favorites = user.favorites.filter((fav) => fav.bookId?.toString() !== req.params.id);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("Unfavorite error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -email -followers -following");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar || "/avatars/default.jpg",
        about: user.about || "",
        createdAt: user.createdAt,
      },
      books: user.uploads || [],
    });
  } catch (err) {
    console.error("Fetch user by ID error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
