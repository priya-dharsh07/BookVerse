import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    avatar: "",
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");

  const avatars = [
    "/avatars/avatar1.jpg",
    "/avatars/avatar2.jpg",
    "/avatars/avatar3.jpg",
    "/avatars/avatar4.jpg",
    "/avatars/avatar5.jpg",
    "/avatars/avatar6.jpg",
  ];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarSelect = (avatar) => {
    setFormData({ ...formData, avatar });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      console.log(res.data); // Success message
      navigate("/login"); // Redirect after successful registration
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data.msg || "Registration failed");
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/register-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 bg-spacePurple/90 shadow-2xl rounded-0xl p-12 w-full max-w-2xl backdrop-blur-md">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-aqua">
          Register &<br />
          Create Your Profile
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <p className="text-gray-300 mb-3">Choose an Avatar</p>
        <div className="grid grid-cols-3 gap-6 mb-6 justify-items-center">
          {avatars.map((avatar, i) => (
            <div
              key={i}
              onClick={() => handleAvatarSelect(avatar)}
              className={`cursor-pointer rounded-full overflow-hidden border-4 w-20 h-20 flex items-center justify-center ${
                formData.avatar === avatar
                  ? "border-aqua scale-110 shadow-lg"
                  : "border-transparent hover:border-gray-500 hover:scale-105"
              } transition transform duration-300`}
            >
              <img
                src={avatar}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aqua"
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aqua"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aqua"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aqua"
            required
          />

          <button
            type="submit"
            className="mt-4 py-3 bg-aqua text-black font-bold rounded-xl hover:bg-white hover:text-black transition duration-300"
          >
            Register & Create Profile
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-aqua hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
