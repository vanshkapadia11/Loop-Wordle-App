import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // NEW
import Game from "./pages/Game";
import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";
import Matchmaking from "./pages/MatchMaking";
import { useAuth } from "./context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    />
    <Route
      path="/game/:gameId"
      element={
        <PrivateRoute>
          <Game />
        </PrivateRoute>
      }
    />
    <Route
      path="/create-game"
      element={
        <PrivateRoute>
          <CreateGame />
        </PrivateRoute>
      }
    />
    <Route
      path="/join"
      element={
        <PrivateRoute>
          <JoinGame />
        </PrivateRoute>
      }
    />
    <Route
      path="/matchmaking"
      element={
        <PrivateRoute>
          <Matchmaking />
        </PrivateRoute>
      }
    />
  </Routes>
);

export default App;
