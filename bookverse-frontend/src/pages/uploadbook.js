import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UploadBook() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingBook = location.state?.book || null;

  const [bookData, setBookData] = useState({
    title: editingBook?.title || "",
    author: editingBook?.author || "",
    coverType: editingBook?.cover?.startsWith("http") ? "url" : "upload",
    cover: editingBook?.cover || "",
    status: editingBook?.status || "Available",
  });

  const handleChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookData({
        ...bookData,
        cover: URL.createObjectURL(file),
        coverType: "upload",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      if (editingBook) {
        // Update book
        await axios.put(
          `http://localhost:5000/api/auth/upload/${editingBook._id}`,
          bookData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Upload new book
        await axios.post("http://localhost:5000/api/auth/upload", bookData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Just navigate back; Profile will fetch fresh data
      navigate("/profile");
    } catch (err) {
      console.error("Error saving book:", err);
    }
  };

  return (
    <div className="min-h-screen bg-nightBlack text-white px-8 py-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#64CCC5]">
        {editingBook ? "Edit Book" : "Upload a Book"}
      </h2>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex flex-col gap-6">
        <input
          type="text"
          name="title"
          placeholder="Book Title"
          value={bookData.title}
          onChange={handleChange}
          className="p-3 rounded-lg bg-darkPurple text-white"
          required
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={bookData.author}
          onChange={handleChange}
          className="p-3 rounded-lg bg-darkPurple text-white"
          required
        />

        {/* Cover options */}
        <div>
          <p className="mb-2 text-gray-300">Book Cover</p>
          <div className="flex gap-6 mb-4">
            <label>
              <input
                type="radio"
                name="coverType"
                value="url"
                checked={bookData.coverType === "url"}
                onChange={handleChange}
              />{" "}
              Use Image URL
            </label>
            <label>
              <input
                type="radio"
                name="coverType"
                value="upload"
                checked={bookData.coverType === "upload"}
                onChange={handleChange}
              />{" "}
              Upload Image
            </label>
          </div>

          {bookData.coverType === "url" ? (
            <input
              type="text"
              name="cover"
              placeholder="Enter Image URL"
              value={bookData.cover}
              onChange={handleChange}
              className="p-3 rounded-lg bg-darkPurple text-white w-full"
            />
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="p-2 bg-darkPurple text-gray-300 rounded-lg w-full"
            />
          )}

          {bookData.cover && (
            <div className="mt-4">
              <img
                src={bookData.cover}
                alt="Preview"
                className="w-40 h-56 object-cover rounded-lg border-2 border-[#64CCC5]"
              />
            </div>
          )}
        </div>

        <select
          name="status"
          value={bookData.status}
          onChange={handleChange}
          className="p-3 rounded-lg bg-darkPurple text-white"
        >
          <option value="Available">Available</option>
          <option value="Lent Out">Lent Out</option>
        </select>

        <button
          type="submit"
          className="py-3 bg-[#64CCC5] text-black font-bold rounded-lg"
        >
          {editingBook ? "Save Changes" : "Upload Book"}
        </button>
      </form>
    </div>
  );
}
