import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { text } from "../constants/text";
import { authAPI } from "../services/api";
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
      setError(text.passwordRequirements);
      return;
    }
    if (!passwordsMatch) {
      setError(text.passwordsDontMatch);
      return;
    }

    try {
      const success = await authAPI.createAccount(email, password);

      if (success) {
        console.log("Account created!");
        navigate("/login");
      } else {
        setError(text.couldNotCreateAccount);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(text.somethingWentWrong);
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
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
              {showPassword ? text.hidePassword : text.showPassword}
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
          <label htmlFor="retypePassword">{text.retypePassword}:</label>
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
              {showRetypePassword ? text.hidePassword : text.showPassword}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className="error-text">{error}</p>}

        {/* Submit */}
        <button type="submit" className="signup-btn" disabled={!passwordsMatch}>
          {text.createAccount}
        </button>
      </form>

      <p>
        {text.alreadyHaveAccount}{" "}
        <button onClick={() => navigate("/login")} className="link-btn">
          {text.loginHere}
        </button>
      </p>
    </div>
  );
};

export default CreateAccPage;
