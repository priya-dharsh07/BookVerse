import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("token", res.data.token); // save JWT
      setMessage("Login successful 🎉");
      navigate("/"); // redirect to homepage (or dashboard)
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid credentials ❌");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white">
      {/* Background Image */}
      <img
        src="/images/register-bg.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Form Card */}
      <div className="relative z-10 bg-spacePurple/90 p-10 rounded-3xl shadow-2xl w-96 max-w-full">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-[#64CCC5]">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#64CCC5]"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#64CCC5]"
            required
          />
          <button
            type="submit"
            className="mt-4 py-3 bg-[#64CCC5] text-black font-bold rounded-xl hover:bg-white hover:text-black transition duration-300"
          >
            Login
          </button>
        </form>
        {message && <p className="text-center text-sm mt-4">{message}</p>}

        <p className="text-gray-300 mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#64CCC5] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
