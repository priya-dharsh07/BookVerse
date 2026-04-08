import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema({
  title: String,
  author: String,
  cover: { type: String, default: "/uploads/default.jpg" },
  status: { type: String, default: "Available" },
  genre: { type: String, default: "General" },
}, { timestamps: true });

const FavoriteSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId },
  title: String,
  author: String,
  cover: String,
}, { _id: false });

const UserSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  email: String,
  password: String,
  avatar: String,
  about: { type: String, default: "" },
  uploads: [UploadSchema],
  favorites: [FavoriteSchema],
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
