import axios from "axios";
import { useState } from "react";

function JudgeAccess() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submitCode = async () => {
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/auth/admin-access",
        { code },
        { withCredentials: true }
      );

      // ✅ Correct code → go to judge dashboard
      window.location.href = "/judge";
    } catch {
      setError("❌ Invalid Judge Code");
    }
  };

  return (
    <div
      style={{
        padding: "50px",
        maxWidth: "400px",
        margin: "auto",
        textAlign: "center"
      }}
    >
      <h2>👨‍⚖️ Judge / Admin Access</h2>

      <p>Enter the secure judge code to access the dashboard</p>

      <input
        type="password"
        placeholder="Enter Judge Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ width: "100%", padding: "8px" }}
      />

      <br /><br />

      <button onClick={submitCode}>
        Enter Judge Dashboard
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default JudgeAccess;
