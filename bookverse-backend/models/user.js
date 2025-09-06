import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    about: { type: String, default: "" },
    uploads: [
      {
        title: String,
        author: String,
        cover: String,
        status: { type: String, default: "Available" },
      },
    ],
    favorites: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Upload" },
        title: String,
        author: String,
        cover: String,
      },
    ],
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
