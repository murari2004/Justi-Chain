import axios from "axios";
import { useState } from "react";
import "../styles/auth.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen"
  });

  const [error, setError] = useState("");

  const validate = () => {
    if (!form.name || !form.email || !form.password) {
      setError("⚠️ All fields are required");
      return false;
    }

    if (!form.email.includes("@")) {
      setError("⚠️ Please enter a valid email address");
      return false;
    }

    if (form.password.length < 6) {
      setError("⚠️ Password must be at least 6 characters");
      return false;
    }

    setError("");
    return true;
  };

  const register = async () => {
    if (!validate()) return;

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        form,
        { withCredentials: true }
      );

      alert("Welcome to JustiChain ⚖️");
      window.location.href = "/";
    } catch {
      setError("⚠️ User already exists or server error");
    }
  };

  return (
    <div className="register-page">

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1>Justice Should Be Accessible</h1>

          <p className="hero-text">
            JustiChain is a digital justice platform designed to empower
            citizens, lawyers, and authorities through transparency,
            accountability, and technology.
          </p>

          <div className="hero-points">
            <p>✔ File and track cases digitally</p>
            <p>✔ Secure & transparent legal process</p>
            <p>✔ Role-based access for citizens, police & lawyers</p>
            <p>✔ Built for trust, fairness & speed</p>
          </div>

          <p className="scroll-text">⬇ Scroll to create your account</p>

          {/* 👨‍⚖️ JUDGE / ADMIN ACCESS BUTTON */}
          <button
            className="judge-access-btn"
            onClick={() => window.location.href = "/judge-access"}
          >
            👨‍⚖️ Judge / Admin Access
          </button>

        </div>
      </section>

      {/* FORM SECTION */}
      <section className="form-section">
        <div className="auth-container">

          <div className="auth-icon">⚖️</div>
          <h2>Create Your Account</h2>

          <p className="auth-subtext">
            Join thousands moving towards a smarter and
            more transparent justice system.
          </p>

          {error && <p className="error-text">{error}</p>}

          <input
            placeholder="Full Name"
            className={error && !form.name ? "error-input" : ""}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Email Address"
            className={error && !form.email ? "error-input" : ""}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Create Password"
            className={error && !form.password ? "error-input" : ""}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <select
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option value="citizen">Citizen</option>
            <option value="lawyer">Lawyer</option>
            <option value="police">Police</option>
          </select>

          <button onClick={register}>
            Join JustiChain
          </button>

          <p className="auth-footer">
            Already registered? <a href="/">Login here</a>
          </p>

        </div>
      </section>

    </div>
  );
}

export default Register;
