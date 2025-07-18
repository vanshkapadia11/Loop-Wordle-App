// src/pages/Matchmaking.jsx
import { useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getRandomWord } from "../utils/getRandomWord";

const Matchmaking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const findGame = async () => {
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("status", "==", "waiting"));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
          const word = await getRandomWord();
          const newGame = await addDoc(gamesRef, {
            players: [user.uid],
            word,
            status: "waiting",
            createdAt: serverTimestamp(),
          });
          console.log("Created game:", newGame.id);
        } else {
          const gameDoc = snapshot.docs[0];
          const existingPlayers = gameDoc.data().players || [];

          await updateDoc(gameDoc.ref, {
            players: [...existingPlayers, user.uid],
            status: "in-progress",
          });

          navigate(`/game/${gameDoc.id}`);
        }
      });

      return () => unsubscribe();
    };

    findGame();
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h2 className="text-2xl font-bold">Looking for a player...</h2>
    </div>
  );
};

export default Matchmaking;
