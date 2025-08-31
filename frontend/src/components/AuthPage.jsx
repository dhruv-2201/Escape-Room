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
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        navigate("/game"); // Navigate to game page after successful auth
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
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Processing..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

export default AuthPage;
