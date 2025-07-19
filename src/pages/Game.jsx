// Updated Game.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useRef } from "react";
import {
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getRandomWord } from "../utils/getRandomWord";
import { v4 as uuidv4 } from "uuid";

const getTileColor = (letter, correctWord, index) => {
  if (correctWord[index] === letter) return "bg-green-500";
  if (correctWord.includes(letter)) return "bg-yellow-400";
  return "bg-gray-400";
};

const Game = () => {
  const [playerNames, setPlayerNames] = useState({});
  const [rematchRequested, setRematchRequested] = useState(false);
  const [showRematchPrompt, setShowRematchPrompt] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const { gameId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.focus(); // focus on mount
    }

    const handleTouch = () => {
      input?.focus(); // refocus on mobile touch
    };

    window.addEventListener("touchstart", handleTouch);
    return () => {
      window.removeEventListener("touchstart", handleTouch);
    };
  }, []);

  // ✅ Reset state when new gameId comes in (important for rematch)
  useEffect(() => {
    setGame(null);
    setCurrentGuess("");
    setMessage("");
    setGameOver(false);
    setRematchRequested(false);
    setShowRematchPrompt(false);
    setCountdown(10);
  }, [gameId]);

  // ✅ Game snapshot listener
  useEffect(() => {
    if (!user) return;
    const gameRef = doc(db, "games", gameId);
    const unsubscribe = onSnapshot(gameRef, async (docSnap) => {
      if (!docSnap.exists()) {
        setMessage("Game not found.");
        return;
      }

      const data = docSnap.data();
      setGame(data);
      console.log("🎯 Correct word:", data.word); // <-- Already here
      if (data.players?.length === 2) {
        const names = {};
        for (const uid of data.players) {
          const snap = await getDoc(doc(db, "users", uid));
          names[uid] = snap.exists()
            ? snap.data().name || snap.data().displayName || "Player"
            : "Unknown";
        }
        setPlayerNames(names);
      }

      if (data.status === "ended") {
        setGameOver(true);
        if (data.winner === user.uid) {
          setMessage("🎉 You won!");
        } else {
          setMessage(`😞 You lost! Word was "${data.word.toUpperCase()}"`);
        }

        if (data.rematchRequest && data.rematchRequest[user.uid]) {
          setRematchRequested(true);
        }

        const opponentId = data.players.find((id) => id !== user.uid);
        if (
          data.rematchRequest &&
          data.rematchRequest[opponentId] &&
          !rematchRequested
        ) {
          setShowRematchPrompt(true);
          let sec = 10;
          const interval = setInterval(() => {
            sec--;
            setCountdown(sec);
            if (sec === 0) {
              setShowRematchPrompt(false);
              clearInterval(interval);
            }
          }, 1000);
        }
      }
    });

    return () => unsubscribe();
  }, [gameId, user, rematchRequested]);

  // ✅ Keyboard logic
  const handleKeyDown = useCallback(
    async (e) => {
      if (!game || game.status !== "in-progress" || gameOver) return;
      const key = e.key.toLowerCase();
      if (key === "enter" && currentGuess.length === 5) {
        const updatedGuesses = {
          ...(game.guesses || {}),
          [user.uid]: [...(game.guesses?.[user.uid] || []), currentGuess],
        };

        const gameRef = doc(db, "games", gameId);
        if (currentGuess === game.word) {
          await updateDoc(gameRef, {
            guesses: updatedGuesses,
            status: "ended",
            winner: user.uid,
          });
        } else {
          await updateDoc(gameRef, {
            guesses: updatedGuesses,
          });
        }
        setCurrentGuess("");
      } else if (key === "backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[a-z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, game, user, gameId, gameOver]
  );

  useEffect(() => {
    if (!user) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, user]);

  // ✅ Rematch request
  const handleRematch = async () => {
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
      [`rematchRequest.${user.uid}`]: true,
    });
    setRematchRequested(true);
  };

  // ✅ ✅ NEW: If both players accept rematch → create new game
  useEffect(() => {
    if (!game?.rematchRequest || !game.players) return;

    const bothAccepted = game.players.every(
      (uid) => game.rematchRequest[uid] === true
    );

    if (bothAccepted) {
      const createNewGame = async () => {
        const newGameId = uuidv4();
        const newWord = await getRandomWord();
        await setDoc(doc(db, "games", newGameId), {
          id: newGameId,
          word: newWord,
          players: game.players,
          guesses: {},
          status: "in-progress",
          createdAt: Timestamp.now(),
        });

        // ✅ IMPORTANT: Navigate AFTER short delay to avoid state bugs
        setTimeout(() => {
          navigate(`/game/${newGameId}`);
        }, 100);
      };

      createNewGame();
    }
  }, [game]);

  const handleGoToMenu = () => navigate("/dashboard");

  // ✅ UI code remains unchanged
  // (cutting below for brevity, already correct)
  // ...
  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen">
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        onChange={() => {}}
      />
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Multiplayer Wordle
      </h2>
      <h3 className="text-center text-sm text-gray-500 mb-2">
        Game ID: <span className="font-mono">{gameId}</span>
      </h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {game &&
          game.guesses &&
          Object.entries(game.guesses).map(([playerId, guesses]) => (
            <div key={playerId}>
              <h3 className="font-semibold text-lg mb-3 text-center">
                {playerId === user.uid
                  ? `🧑 You (${playerNames[playerId] || "You"})`
                  : `👤 Opponent (${playerNames[playerId] || "Opponent"})`}
              </h3>
              <div className="space-y-2">
                {guesses.map((g, idx) => (
                  <div key={idx} className="flex justify-center gap-1">
                    {g.split("").map((letter, i) => (
                      <div
                        key={i}
                        className={`w-12 h-12 rounded text-white font-bold flex items-center justify-center text-xl ${getTileColor(
                          letter,
                          game.word,
                          i
                        )}`}
                      >
                        {letter.toUpperCase()}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {!gameOver && (
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => {
            const letter = currentGuess[i] || "";
            const isFilled = letter !== "";
            return (
              <div
                key={i}
                className={`w-12 h-12 border-2 text-center flex items-center justify-center text-2xl font-bold uppercase ${
                  isFilled
                    ? "bg-yellow-400 text-white border-yellow-400"
                    : "bg-gray-200 text-gray-700 border-gray-400"
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>
      )}

      {message && (
        <div className="text-center text-xl font-semibold text-red-600 mt-4">
          {message}
        </div>
      )}

      {gameOver && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={handleGoToMenu}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Menu
          </button>
          {!rematchRequested && (
            <button
              onClick={handleRematch}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Play Again
            </button>
          )}
        </div>
      )}

      {showRematchPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm text-center">
            <p className="text-lg mb-4 font-semibold">
              Opponent wants to play again!
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Respond in {countdown} seconds...
            </p>
            <button
              onClick={handleRematch}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
