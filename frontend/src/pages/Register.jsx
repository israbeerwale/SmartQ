import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import API_URL from "../api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const registerHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connectto server.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="register-page">
      <div className="register-card">
        <h1>Create Account</h1>
        <p>Join SmartQ and manage your queues easily.</p>
        <form onSubmit={registerHandler}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creating Account...." : "Create Account"}
          </button>
        </form>
        <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>
              Login
            </span>
        </p>
      </div>
    </main>
  );
}
export default Register;