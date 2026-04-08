import { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/landing";
import VerseBoard from "./pages/dashboard"; 
import Chat from "./pages/chat"; 
import OwnerChat from "./pages/ownerchat"; 
import Profile from "./pages/profile";
import OwnerProfile from "./pages/ownerprofile"; 
import Login from "./pages/login";
import Register from "./pages/register";
import EditProfile from "./pages/editprofile";
import UploadBook from "./pages/uploadbook";  
import UserProfile from "./pages/userprofile";
import BehindThePages from "./pages/behindthepages";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userId"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("userId"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/"; 
  };

  return (
    <Router>
      <div className="bg-darkColor min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="bg-nightBlack text-white p-5 flex justify-between items-center shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-purple-300 via-purple-200 to-blue-300 bg-clip-text text-transparent">
            BookVerse
          </h1>

          <div className="flex gap-6 text-lg font-medium">
            <Link to="/" className="hover:text-[#64CCC5] transition">Home</Link>
            <Link to="/dashboard" className="hover:text-[#64CCC5] transition">VerseBoard</Link>
            <Link to="/chat" className="hover:text-[#64CCC5] transition">Chat</Link>
            <Link to="/profile" className="hover:text-[#64CCC5] transition">Profile</Link>
            <Link to="/behindthepages" className="hover:text-[#64CCC5] transition">
            Behind the Pages
            </Link>

            {!isLoggedIn ? (
              <>
                <Link to="/login" className="hover:text-[#64CCC5] transition">Login</Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#64CCC5] text-black font-semibold rounded-lg hover:bg-white hover:text-black transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-400 transition"
              >
                Logout
              </button>
            )}
          </div>
        </nav>

        {/* Page Routes */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<VerseBoard />} />
            <Route path="/chat" element={<Chat />} /> 
            <Route path="/profile" element={<Profile />} />
            <Route path="/ownerprofile/:ownerId/:bookId" element={<OwnerProfile />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/editprofile" element={<EditProfile />} />
            <Route path="/uploadbook" element={<UploadBook />} /> 
            <Route path="/userprofile/:id" element={<UserProfile />} /> 
            <Route path="/ownerchat/:ownerId/:bookId" element={<OwnerChat />} />
            <Route path="/owner-chat/:ownerId" element={<OwnerChat />} />
            <Route path="/behindthepages" element={<BehindThePages />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-nightBlack text-gray-400 text-center p-4 text-sm">
          © {new Date().getFullYear()} BookVerse. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
