import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth", {
        // Updated URL
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // Changed content type
        body: email, // Send just the email string
      });

      const exists = await response.json(); // backend returns true/false

      if (exists) {
        navigate("/login");
      } else {
        navigate("/create-account");
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <h2 className="title">Please Enter Your Email</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="email-input"
          disabled={loading} // optional: disable input while loading
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Processing..." : "Continue"}
        </button>
      </form>
      {loading && <p className="loading-text">Checking your email...</p>}
    </div>
  );
}

export default AuthPage;
