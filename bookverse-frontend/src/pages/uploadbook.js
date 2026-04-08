import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const backendURL = "http://localhost:5000";

export default function UploadBook() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingBook = location.state?.book || null;

  const [bookData, setBookData] = useState({
    title: editingBook?.title || "",
    author: editingBook?.author || "",
    genre: editingBook?.genre || "",
    coverType: editingBook?.cover?.startsWith("http") ? "url" : "upload",
    cover: editingBook?.cover || "",
    coverFile: null,
    status: editingBook?.status || "Available",
    originalCover: editingBook?.cover || "",
  });

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Fantasy", "Science",
    "Romance", "Horror", "Thriller", "Crime Thriller", "Historical Fiction",
    "Biography", "Autobiography", "Comics", "Comedy",
  ];

  // helper to convert backend paths to full URLs
  const getImageURL = (path) => {
    if (!path) return `${backendURL}/uploads/default.jpg`;
    if (path.startsWith("http")) return path;
    return `${backendURL}${path}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookData((prev) => ({
        ...prev,
        cover: URL.createObjectURL(file),
        coverFile: file,
        coverType: "upload",
      }));
    }
  };

  const handleCoverTypeChange = (e) => {
    const type = e.target.value;
    setBookData((prev) => ({
      ...prev,
      coverType: type,
      cover: type === "url" ? prev.cover : prev.originalCover,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const formData = new FormData();
      formData.append("title", bookData.title);
      formData.append("author", bookData.author);
      formData.append("genre", bookData.genre);
      formData.append("status", bookData.status);

      if (bookData.coverType === "upload") {
        if (bookData.coverFile) {
          formData.append("cover", bookData.coverFile);
        } else if (editingBook) {
          formData.append("coverUrl", bookData.originalCover);
        }
      } else {
        formData.append("coverUrl", bookData.cover);
      }

      if (editingBook) {
        await axios.put(
          `${backendURL}/api/auth/upload/${editingBook._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.post(`${backendURL}/api/auth/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      navigate("/profile");
    } catch (err) {
      console.error("Error saving book:", err.response || err);
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

        <select
          name="genre"
          value={bookData.genre}
          onChange={handleChange}
          className="p-3 rounded-lg bg-darkPurple text-white"
          required
        >
          <option value="" disabled>Choose Genre</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <div>
          <p className="mb-2 text-gray-300">Book Cover</p>
          <div className="flex gap-6 mb-4">
            <label>
              <input
                type="radio"
                name="coverType"
                value="url"
                checked={bookData.coverType === "url"}
                onChange={handleCoverTypeChange}
              /> Use Image URL
            </label>
            <label>
              <input
                type="radio"
                name="coverType"
                value="upload"
                checked={bookData.coverType === "upload"}
                onChange={handleCoverTypeChange}
              /> Upload Image
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
      src={
        bookData.coverType === "url" || bookData.coverFile
          ? bookData.cover 
          : getImageURL(bookData.cover) 
      }
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
