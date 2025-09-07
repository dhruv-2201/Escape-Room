import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateAccPage.css";

const CreateAccPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Validation checks
  const passwordRequirements = [
    {
      id: "length",
      text: "At least 8 characters",
      test: (pwd) => pwd.length >= 8,
    },
    {
      id: "capital",
      text: "At least 1 uppercase letter",
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      id: "number",
      text: "At least 1 number",
      test: (pwd) => /[0-9]/.test(pwd),
    },
  ];

  const unmetRequirements = passwordRequirements.filter(
    (req) => !req.test(password)
  );
  const passwordValid = unmetRequirements.length === 0;
  const passwordsMatch = passwordValid && retypePassword === password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordValid) {
      setError("Password does not meet requirements.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords don't match!");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/create-account",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.ok) {
        console.log("Account created!");
        navigate("/login");
      } else {
        setError("Could not create account. Try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
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
              type={showPassword ? "text" : "password"}
              id="password"
              className={
                password.length > 0 ? (passwordValid ? "valid" : "invalid") : ""
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {/* Popup with unmet requirements */}
          {password.length > 0 && !passwordValid && (
            <ul className="password-popup">
              {unmetRequirements.map((req) => (
                <li key={req.id}>{req.text}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Retype Password */}
        <div className="form-group">
          <label htmlFor="retypePassword">Retype Password:</label>
          <div className="password-input-container">
            <input
              type={showRetypePassword ? "text" : "password"}
              id="retypePassword"
              className={
                retypePassword.length > 0
                  ? passwordsMatch
                    ? "valid"
                    : "invalid"
                  : ""
              }
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
              required
              disabled={!passwordValid}
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowRetypePassword(!showRetypePassword)}
            >
              {showRetypePassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className="error-text">{error}</p>}

        {/* Submit */}
        <button type="submit" className="signup-btn" disabled={!passwordsMatch}>
          Create Account
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="link-btn">
          Login here
        </button>
      </p>
    </div>
  );
};

export default CreateAccPage;
