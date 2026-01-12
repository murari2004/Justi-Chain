import axios from "axios";
import { useState } from "react";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔍 Basic client-side validation
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

  // 🔐 Login + Role-based redirect
  const login = async () => {
    if (!validate()) return;

    try {
      // 1️⃣ Login (JWT cookie set here)
      await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      // 2️⃣ Ask backend who logged in
      const res = await axios.get(
        "http://localhost:5000/api/auth/me",
        { withCredentials: true }
      );

      const role = res.data.role;

      // 3️⃣ Redirect based on role
      if (role === "citizen") {
        window.location.href = "/citizen";
      } else if (role === "lawyer") {
        window.location.href = "/lawyer";
      } else if (role === "police") {
        window.location.href = "/police";
      } else {
        // court / admin
        window.location.href = "/court";
      }

    } catch (err) {
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
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className={error && !password ? "error-input" : ""}
          value={password}
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
