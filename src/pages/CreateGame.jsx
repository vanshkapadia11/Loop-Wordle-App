import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { setDoc, doc, onSnapshot, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { v4 as uuidv4 } from "uuid";

const CreateGame = () => {
  const [gameId, setGameId] = useState("");
  const [copied, setCopied] = useState(false);
  const [opponentName, setOpponentName] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const createGame = async () => {
      try {
        const wordRes = await fetch(
          "https://random-word-api.herokuapp.com/word?length=5"
        );
        const [randomWord] = await wordRes.json();

        const newGameId = uuidv4();
        setGameId(newGameId);
        const gameRef = doc(db, "games", newGameId);

        await setDoc(gameRef, {
          id: newGameId,
          word: randomWord.toLowerCase(),
          players: [user.uid],
          guesses: {},
          status: "waiting",
          createdAt: new Date(),
        });
        // 🧹 Delete if no one joins in 5 minutes
        setTimeout(async () => {
          const latestSnap = await getDoc(gameRef);
          const gameData = latestSnap.data();
          if (gameData?.players?.length < 2) {
            await deleteDoc(gameRef);
            console.log("Deleted unjoined game:", newGameId);
          }
        }, 300000); // 5 mins = 300,000 ms

        // Listen for opponent joining
        onSnapshot(gameRef, async (docSnap) => {
          const data = docSnap.data();
          if (data?.players?.length === 2) {
            const opponentUid = data.players.find((uid) => uid !== user.uid);

            if (opponentUid) {
              const userDoc = await getDoc(doc(db, "users", opponentUid));
              if (userDoc.exists()) {
                setOpponentName(
                  userDoc.data().name || userDoc.data().displayName
                );
              }
            }

            if (data.status === "in-progress") {
              navigate(`/game/${newGameId}`);
            }
          }
        });
      } catch (err) {
        console.error("Error creating game:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) createGame();
  }, [user, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) return <div className="text-center mt-10">Creating game...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-lg font-semibold mb-4 uppercase">🎮 Game Created</h1>
      <p className="mb-2 text-md font-semibold uppercase">
        Share this Game ID with your opponent:
      </p>

      <div className="flex items-center gap-2 mb-4">
        <div className="shadow-lg backdrop-blur-sm text-gray-700 text-lg px-4 py-2 rounded font-mono break-all">
          {gameId}
        </div>
        <button
          onClick={handleCopy}
          className="shadow-lg backdrop-blur-sm text-blue-600 px-3 py-2 rounded font-semibold text-sm uppercase"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {opponentName ? (
        <p className="text-green-600 font-semibold">
          👤 Opponent joined: {opponentName}
        </p>
      ) : (
        <p className="text-gray-600 mt-2 text-sm font-semibold uppercase">
          Waiting for opponent to join...
        </p>
      )}

      <div className="mt-4 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default CreateGame;
