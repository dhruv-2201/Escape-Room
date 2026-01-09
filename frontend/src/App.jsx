import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Homepage from "./components/Homepage";
import LoginPage from "./components/LoginPage";
import CreateAccPage from "./components/CreateAccPage";
import GamePage from "./components/GamePage";
import { text } from "./constants/text";
import "./App.css";

function App() {
  const [isDoorClosing, setIsDoorClosing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem("isAuthenticated") === "true";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUser = window.localStorage.getItem("currentUser");
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (err) {
      console.error("Failed to parse stored user", err);
      return null;
    }
  });
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    setIsDoorClosing(true);
    setTimeout(() => {
      navigate(path);
      setIsDoorClosing(false);
    }, 1000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("isAuthenticated", String(isAuthenticated));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !currentUser) {
      setIsAuthenticated(false);
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (currentUser) {
      window.localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const handleLoginSuccess = (userProfile) => {
    setIsAuthenticated(true);
    setCurrentUser(userProfile ?? null);
    navigate("/game");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <>
      <header className="header">
        <div className="logo">Escape Room</div>
        <nav className="nav-buttons">
          {!isAuthenticated && (
            <>
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
            </>
          )}
          {isAuthenticated && (
            <button className="auth-button" onClick={handleLogout}>
              {text.logout}
            </button>
          )}
        </nav>
      </header>

      <div className={`app ${isDoorClosing ? "door-closing" : ""}`}>
        <Routes>
          <Route
            path="/"
            element={<Homepage onPlay={() => handleNavigation("/login")} />}
          />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/create-account" element={<CreateAccPage />} />
          <Route
            path="/game"
            element={
              <GamePage
                onLogout={handleLogout}
                userId={currentUser?.id}
                userEmail={currentUser?.email}
              />
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
