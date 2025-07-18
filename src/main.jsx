import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx"; // ✅ import

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {" "}
    <AuthProvider>
      {/* ✅ THIS is the only BrowserRouter */}
      <App />
    </AuthProvider>
  </BrowserRouter>
);
