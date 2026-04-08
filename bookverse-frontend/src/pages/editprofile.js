import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backendURL = "http://localhost:5000";

export default function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    avatar: "",
    about: "",
  });

  const avatars = [
    `${backendURL}/avatars/avatar1.jpg`,
    `${backendURL}/avatars/avatar2.jpg`,
    `${backendURL}/avatars/avatar3.jpg`,
    `${backendURL}/avatars/avatar4.jpg`,
    `${backendURL}/avatars/avatar5.jpg`,
    `${backendURL}/avatars/avatar6.jpg`,
  ];

  const getImageURL = (path) => {
    if (!path) return "/avatars/default.jpg";
    if (path.startsWith("/avatars")) return `${backendURL}${path}`;
    return path;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const { data } = await axios.get(`${backendURL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = data.user || {};
        setFormData({
          fullName: user.fullName || "",
          username: user.username || "",
          email: user.email || "",
          avatar: user.avatar || "",
          about: user.about || "",
        });
      } catch (err) {
        console.error("Fetch user failed:", err);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarSelect = (avatar) => setFormData({ ...formData, avatar });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendURL}/api/auth/edit`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/profile");
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-nightBlack text-white">
      <div className="bg-spacePurple/90 shadow-2xl rounded-3xl p-10 w-full max-w-2xl">
        <h2 className="text-4xl font-extrabold text-center mb-6 text-[#64CCC5]">
          Edit Profile
        </h2>

        <p className="text-gray-300 mb-3">Choose an Avatar</p>
        <div className="grid grid-cols-3 gap-6 mb-6 justify-items-center">
          {avatars.map((avt, i) => (
            <div
              key={i}
              onClick={() => handleAvatarSelect(avt)}
              className={`cursor-pointer rounded-full overflow-hidden border-4 w-20 h-20 flex items-center justify-center ${
                formData.avatar === avt
                  ? "border-[#64CCC5] scale-110 shadow-lg"
                  : "border-transparent hover:border-gray-500 hover:scale-105"
              } transition transform duration-300`}
            >
              <img
                src={getImageURL(avt)}
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
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#64CCC5]"
            required
          />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#64CCC5]"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#64CCC5]"
            required
          />
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows="4"
            className="p-3 rounded-xl bg-darkPurple text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#64CCC5]"
          />
          <button
            type="submit"
            className="mt-4 py-3 bg-[#64CCC5] text-black font-bold rounded-xl hover:bg-white hover:text-black transition duration-300"
          >
            Save Changes
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-2 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-500 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
