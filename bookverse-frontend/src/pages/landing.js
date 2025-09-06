import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Full Background Image with Dark Overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/books.jpg"
          alt="Futuristic books"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" /> {/* dark overlay */}
      </div>

      {/* Hero Section */}
      <div className="relative z-10 text-center max-w-4xl px-6">
        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          <span className="block">Lend.</span>
          <span className="block">Borrow.</span>
          <span className="block text-[#64CCC5]">Connect.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-200 mb-8">
          A platform where books find new homes, friendships spark,
          and stories never stop flowing.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-6">
      

          <Link
            to="/dashboard"
            className="px-6 py-3 border-2 border-[#64CCC5] text-[#64CCC5] font-bold rounded-xl hover:bg-[#64CCC5] hover:text-black transition duration-300"
          >
            Go to VerseBoard
          </Link>
        </div>
      </div>
    </div>
  );
}
