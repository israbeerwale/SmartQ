import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p>Login to manage your SmartQ queue.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email,
                    password,
                  }),
                }
              );
              const data = await response.json();
              if (!response.ok) {
                alert(data.message);
                setLoading(false);
                return;
              }
              alert("Login successful!");
              localStorage.setItem(
                "loggedInUser",
                JSON.stringify(data.user)
              );
              window.location.href = "/services";
             
              setLoading(false);
            } catch(error) {
              console.error("Login error:",error);
              alert("Unable to connect to server.");
              setLoading(false);
            }
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="register-link">
          Don't have an account?{" "}
          <button type="button"
                  className="register-action"
                  onClick={() => navigate("/register")}
          >
             Create an account
          </button>
        </p>
      </div>
    </main>
  );
}
export default Login;
