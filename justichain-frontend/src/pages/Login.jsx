import axios from "axios";
import { useState } from "react";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!email || !password) {
      setError("⚠️ Please fill in all fields");
      return false;
    }

    if (!email.includes("@")) {
      setError("⚠️ Please enter a valid email address");
      return false;
    }

    setError("");
    return true;
  };

  const login = async () => {
    if (!validate()) return;

    try {
      await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      window.location.href = "/dashboard";
    } catch {
      setError("⚠️ Invalid email or password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-icon">⚖️</div>

        <h2>Welcome Back</h2>

        <p className="auth-subtext">
          Log in to continue your journey towards
          a transparent digital justice system.
        </p>

        {/* ERROR MESSAGE */}
        {error && <p className="error-text">{error}</p>}

        <input
          placeholder="Email Address"
          className={error && !email ? "error-input" : ""}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className={error && !password ? "error-input" : ""}
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={login}>
          Login
        </button>

        <p className="auth-footer">
          New to JustiChain? <a href="/register">Create an account</a>
        </p>

      </div>
    </div>
  );
}

export default Login;
