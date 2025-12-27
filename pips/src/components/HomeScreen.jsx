import React from "react";
// import { PipsLogo } from "./Icons"; // We'll update Icons.jsx to export this if needed, or use inline SVG

// Helper for formatting today's date like "December 26, 2025"
const getTodayString = () => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date().toLocaleDateString("en-US", options);
};

export const HomeScreen = ({ difficulty, setDifficulty, onPlay }) => {
  return (
    <div className="min-h-screen bg-[#dcbcd7] flex flex-col items-center justify-center p-6 text-slate-900 font-sans selection:bg-white/40">
      {/* Logo & Title */}
      <div className="flex flex-col items-center gap-4 mb-8 transform scale-110">
        {/* Using a rotated domino icon similar to the screenshot */}
        <div className="w-20 h-20 bg-white border-4 border-black rounded-xl flex items-center justify-center transform -rotate-12 shadow-xl">
          <div className="flex gap-2 transform rotate-12">
            <div className="w-3 h-3 bg-black rounded-full" />
            <div className="w-3 h-3 bg-black rounded-full" />
          </div>
        </div>

        <h1 className="text-6xl font-black tracking-tighter mt-4 font-serif">
          Pips
        </h1>
      </div>

      {/* Subtitle */}
      <div className="text-center mb-12 space-y-2">
        <p className="text-2xl font-serif leading-tight">
          Place every domino in <br /> the right spot.
        </p>
      </div>

      {/* Difficulty Toggle */}
      <div className="bg-black/10 p-1.5 rounded-lg flex w-full max-w-xs mb-8 backdrop-blur-sm">
        {["easy", "medium", "hard"].map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`flex-1 py-2 text-sm font-bold capitalize rounded-md transition-all duration-200 ${
              difficulty === d
                ? "bg-white text-black shadow-sm"
                : "text-slate-800 hover:bg-white/30"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Play Button */}
      <button
        onClick={onPlay}
        className="w-full max-w-xs bg-slate-900 text-white font-bold text-lg py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 mb-12"
      >
        Play
      </button>

      {/* Footer / Credits */}
      <div className="text-center space-y-1 opacity-70">
        <p className="font-bold text-sm">{getTodayString()}</p>
        <p className="text-xs font-medium">Puzzles by Molly Sandler</p>
        <p className="text-xs font-medium">Idea by NYT</p>
      </div>
    </div>
  );
};
