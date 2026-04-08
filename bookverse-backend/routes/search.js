import express from "express";
import User from "../models/user.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.json({ users: [], books: [] });
    }

    const regex = new RegExp(q, "i");

    const users = await User.find({
      $or: [{ username: regex }, { fullName: regex }],
    })
      .select("_id username fullName avatar")
      .limit(10);

    const books = await User.aggregate([
      { $unwind: "$uploads" },
      {
        $match: {
          $or: [
            { "uploads.title": regex },
            { "uploads.author": regex },
            { "uploads.genre": regex },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          bookId: "$uploads._id",
          title: "$uploads.title",
          author: "$uploads.author",
          genre: "$uploads.genre",
          cover: {
            $cond: [
              { $ifNull: ["$uploads.cover", false] },
              { $concat: ["http://localhost:5000", "$uploads.cover"] },
              "http://localhost:5000/uploads/default.jpg",
            ],
          },
          ownerId: "$_id",             
          ownerName: "$fullName",      
          ownerUsername: "$username",  
          ownerAvatar: {
            $cond: [
              { $ifNull: ["$avatar", false] },
              { $concat: ["http://localhost:5000/avatars/", "$avatar"] },
              "http://localhost:5000/avatars/default.jpg",
            ],
          },
        },
      },
      { $limit: 10 },
    ]);

    res.json({ users, books });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to search" });
  }
});

export default router;
