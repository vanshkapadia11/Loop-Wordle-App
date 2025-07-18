import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext"; // ✅
import { useEffect } from "react"; // ✅

const Login = () => {
  const { user } = useAuth(); // ✅ Access auth context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // ✅ Add this line
    } catch (err) {
      setError("Invalid email or password");
    }
  };
  useEffect(() => {
    if (user) {
      navigate("/dashboard"); // ✅ only when user is truly ready
    }
  }, [user, navigate]);

  return (
    <>
      <Navbar />
      <div className="mt-20 justify-self-center container md:w-9/12">
        <form onSubmit={handleLogin} className="flex flex-col rounded-lg">
          <h2 className="text-2xl font-bold text-zinc-800 mb-6 text-center heading1 uppercase">
            login
          </h2>

          {error && (
            <p className="text-red-400 text-sm mb-4 font-semibold uppercase">
              {error}
            </p>
          )}
          <label
            htmlFor="email"
            className="text-xs font-semibold mb-2 uppercase"
          >
            Enter Your email
          </label>
          <input
            type="email"
            placeholder=""
            value={email}
            id="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded outline-none text-sm font-semibold dark:bg-[#242424] dark:ring-[#2a2a2a] ring-1 ring-[#e8e8e8] ring-inset "
            required
          />
          <label
            htmlFor="password"
            className="text-xs font-semibold mb-2 uppercase"
          >
            Enter Your password
          </label>
          <input
            type="password"
            placeholder=""
            value={password}
            id="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 border rounded outline-none text-sm font-semibold dark:bg-[#242424] dark:ring-[#2a2a2a] ring-1 ring-[#e8e8e8] ring-inset "
            required
          />
          <button
            type="submit"
            className="w-1/2 justify-self-center py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all"
          >
            login
          </button>
        </form>
        <div className="mt-10 flex justify-center items-center flex-col">
          <h2 className="font-semibold text-lg uppercase mb-5">OR</h2>
          <button
            type="submit"
            className="w-1/2 justify-self-center py-3 rounded-lg ring-1 ring-inset backdrop-blur-sm shadow-xl font-semibold text-sm ring-[#efefef] uppercase hover:scale-105 duration-500 transition-all"
            onClick={() => navigate("/signup")}
          >
            sign up
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
