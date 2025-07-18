// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(); // Yaha Pe Hum Ek Context Bane Raha Ha Jo Sab Store Karega Aur Usko Kidhar Bhi use Karsakte Hai!!
export const useAuth = () => useContext(AuthContext); //  Bhai Ye Ek Function Hona Chiaye!!

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid)); // Bhai Ye Doc Wali Chiz Important Hai!!! -- Data Leta Hai Aur Phir Approve Karta Hai!!
        if (userDoc.exists()) {
          setUser({ ...currentUser, ...userDoc.data() });
          // console.log(currentUser, userDoc.data());
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //     setLoading(false);
  //   });

  //   return () => unsubscribe(); // Clean up listener
  // }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
