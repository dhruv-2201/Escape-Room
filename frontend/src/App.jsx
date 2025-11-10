import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import Homepage from "./components/Homepage";
import LoginPage from "./components/LoginPage";
import CreateAccPage from "./components/CreateAccPage";
import GamePage from "./components/GamePage";
import { text } from "./constants/text";
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
            onClick={() => handleNavigation("/login")}
          >
            {text.login}
          </button>
          <button
            className="auth-button"
            onClick={() => handleNavigation("/create-account")}
          >
            {text.signUp}
          </button>
        </nav>
      </header>

      <div className={`app ${isDoorClosing ? "door-closing" : ""}`}>
        <Routes>
          <Route
            path="/"
            element={<Homepage onPlay={() => handleNavigation("/login")} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccPage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
