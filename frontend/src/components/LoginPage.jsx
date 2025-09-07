import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
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
      const response = await fetch("http://localhost:8080/api/auth/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const isValid = await response.json();

      if (isValid) {
        console.log("Login successful!");
        navigate("/game"); // ✅ redirect after login
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
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
          <label htmlFor="password">Password:</label>
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
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className="error-text">{error}</p>}

        {/* Submit */}
        <button type="submit" className="login-btn">
          Login
        </button>
      </form>

      <p>
        Don’t have an account?{" "}
        <button
          onClick={() => navigate("/create-account")}
          className="link-btn"
        >
          Create one
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
