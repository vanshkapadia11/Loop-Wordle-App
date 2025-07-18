import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 pt-20">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 uppercase">
          🎯 Multiplayer Wordle
        </h1>
        <p className="mb-10 text-gray-600 text-md uppercase font-semibold">
          Play Wordle with your friends in real-time!
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => navigate("/create-game")}
            className="w-full px-6 py-3 ring-1 ring-inset ring-[#e8e8e8] text-green-600 rounded-xl text-sm font-semibold shadow transition uppercase"
          >
            🚀 Create Game
          </button>
          <button
            onClick={() => navigate("/join")}
            className="w-full px-6 py-3 ring-1 ring-inset ring-[#e8e8e8] text-orange-600 rounded-xl text-sm font-semibold shadow transition uppercase"
          >
            🔑 Join Game
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
