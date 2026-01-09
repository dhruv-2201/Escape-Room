import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { text } from "../constants/text";
import { authAPI } from "../services/api";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Utility: mask all chars except last
  const maskPassword = (pwd) => {
    if (pwd.length === 0) return "";
    if (pwd.length === 1) return pwd;
    return "*".repeat(pwd.length - 1) + pwd.slice(-1);
  };

  // Handle input with masking
  const handleMaskedInput = (e, value, setValue, showFlag) => {
    const input = e.target.value;

    if (showFlag) {
      // Show mode: store raw input
      setValue(input);
    } else {
      if (input.length < value.length) {
        // User deleted → remove last char
        setValue(value.slice(0, -1));
      } else {
        // User added → append new char
        const newChar = input[input.length - 1];
        setValue(value + newChar);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const isValid = await authAPI.login(email, password);

      if (isValid) {
        const profile = await authAPI.getUserByEmail(email);

        if (!profile) {
          setError(text.userProfileNotFound);
          return;
        }

        if (onLoginSuccess) {
          onLoginSuccess(profile);
          return;
        }

        navigate("/game", { state: { user: profile } });
      } else {
        setError(text.invalidCredentials);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(text.somethingWentWrong);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">{text.email}:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password">{text.password}:</label>
          <div className="password-input-container">
            <input
              type="text"
              id="password"
              value={showPassword ? password : maskPassword(password)}
              onChange={(e) =>
                handleMaskedInput(e, password, setPassword, showPassword)
              }
              required
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? text.hidePassword : text.showPassword}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className="error-text">{error}</p>}

        {/* Submit */}
        <button type="submit" className="login-btn">
          {text.login}
        </button>
      </form>

      <p>
        {text.dontHaveAccount}{" "}
        <button
          onClick={() => navigate("/create-account")}
          className="link-btn"
        >
          {text.createOne}
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
