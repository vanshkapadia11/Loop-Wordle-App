import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

const JoinGame = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");
  const [status, setStatus] = useState("idle"); // idle, joining, waiting, redirecting, notfound, full
  const [error, setError] = useState("");
  const [opponentJoined, setOpponentJoined] = useState(false);

  useEffect(() => {
    if (status === "redirecting") {
      navigate(`/game/${gameId}`);
    }
  }, [status, navigate, gameId]);

  const handleJoin = async () => {
    if (!gameId || !user) return;

    setStatus("joining");
    setError("");

    const gameRef = doc(db, "games", gameId);

    try {
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        setStatus("notfound");
        return;
      }

      const gameData = gameSnap.data();

      if (gameData.players.includes(user.uid)) {
        setStatus(gameData.players.length < 2 ? "waiting" : "redirecting");
      } else if (gameData.players.length === 1) {
        await updateDoc(gameRef, {
          players: [...gameData.players, user.uid],
          status: "in-progress",
        });
        setStatus("redirecting");
      } else {
        setStatus("full");
      }

      // 🔁 Listen for live updates
      onSnapshot(gameRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.players.length === 2 && data.status === "in-progress") {
            setOpponentJoined(true);
            setStatus("redirecting");
          }
        }
      });
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error(err);
      setStatus("idle");
    }
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white backdrop-blur-sm ring-1 ring-inset ring-[#e8e8e8] rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6 uppercase">
            Join a Wordle Game
          </h1>

          <input
            type="text"
            placeholder="Enter Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleJoin}
            disabled={status === "joining" || !gameId}
            className="w-full shadow-lg ring-1 ring-inset ring-[#e8e8e8] text-zinc-800 font-semibold text-sm px-6 py-2 rounded-md disabled:opacity-50 transition"
          >
            {status === "joining" ? "JOINING..." : "JOIN GAME"}
          </button>

          {status === "waiting" && (
            <div className="mt-6">
              <p className="text-gray-600 mb-2">
                Waiting for opponent to join...
              </p>
              <div className="mx-auto w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {status === "notfound" && (
            <p className="text-red-500 mt-4 text-sm font-semibold uppercase">
              ❌ Game not found. Check the ID.
            </p>
          )}
          {status === "full" && (
            <p className="text-yellow-600 mt-4 text-sm font-semibold uppercase">
              ⚠️ Game already has 2 players.
            </p>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JoinGame;
