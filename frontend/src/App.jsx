import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Homepage from "./components/Homepage";
import AuthPage from "./components/AuthPage";
import "./App.css";

function App() {
  const [isDoorClosing, setIsDoorClosing] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    setIsDoorClosing(true);
    setTimeout(() => {
      navigate(path);
      setIsDoorClosing(false);
    }, 1000);
  };

  return (
    <>
      <header className="header">
        <div className="logo">Escape Room</div>
        <nav className="nav-buttons">
          <button
            className="auth-button"
            onClick={() => handleNavigation("/auth")}
          >
            Login
          </button>
          <button
            className="auth-button"
            onClick={() => handleNavigation("/auth")}
          >
            Sign Up
          </button>
        </nav>
      </header>
      <div className={`app ${isDoorClosing ? "door-closing" : ""}`}>
        <Routes>
          <Route
            path="/"
            element={<Homepage onPlay={() => handleNavigation("/auth")} />}
          />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
