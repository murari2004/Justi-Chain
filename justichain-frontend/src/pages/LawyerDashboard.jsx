import axios from "axios";
import { useEffect, useState } from "react";

function LawyerDashboard() {
  const [user, setUser] = useState({ name: "" });
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      // 🔐 AUTH + ROLE CHECK (ONLY THIS CAN REDIRECT)
      try {
        const me = await axios.get(
          "http://localhost:5000/api/auth/me",
          { withCredentials: true }
        );

        if (me.data.role !== "lawyer") {
          window.location.href = "/";
          return;
        }

        setUser({ name: me.data.name });
      } catch {
        window.location.href = "/";
        return;
      }

      // 📦 LOAD LAWYER CASES (NO REDIRECT ON FAILURE)
      try {
        const res = await axios.get(
          "http://localhost:5000/api/lawyer/my-cases",
          { withCredentials: true }
        );
        setCases(res.data);
      } catch (err) {
        console.error("Failed to load lawyer cases:", err.response?.data || err);
        setCases([]); // safe fallback
      }
    };

    init();
  }, []);

  // 🟢 TAKE CASE
  const takeCase = async () => {
    setMessage("");
    setError("");

    if (!caseId) {
      setError("Please enter Case ID");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/lawyer/take-case",
        { caseId },
        { withCredentials: true }
      );

      setMessage(res.data.msg);
      setCaseId("");

      // reload cases safely
      const updated = await axios.get(
        "http://localhost:5000/api/lawyer/my-cases",
        { withCredentials: true }
      );
      setCases(updated.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to take case");
    }
  };

  // 🏛️ ENTER COURTROOM
  const enterCourt = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/lawyer/enter-case",
        { caseId: id },
        { withCredentials: true }
      );

      window.location.href = `/courtroom/${id}`;
    } catch {
      alert("Not authorized to enter this case");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>⚖️ Lawyer Dashboard</h2>
      <p><b>Advocate:</b> {user.name}</p>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />

      {/* TAKE CASE */}
      <h3>Take Case</h3>
      <input
        placeholder="JC-xxxx"
        value={caseId}
        onChange={e => setCaseId(e.target.value)}
      />
      <button onClick={takeCase}>Take Case</button>

      <hr />

      {/* MY CASES */}
      <h3>My Cases</h3>
      {cases.length === 0 && <p>No cases taken yet</p>}

      {cases.map(c => (
        <div key={c.caseId} style={{ marginBottom: "10px" }}>
          <b>{c.caseId}</b> — {c.title} ({c.status})
          <br />
          <button onClick={() => enterCourt(c.caseId)}>
            Enter Courtroom
          </button>
        </div>
      ))}

      <hr />

      {/* LOGOUT */}
      <button
        onClick={async () => {
          await axios.post(
            "http://localhost:5000/api/auth/logout",
            {},
            { withCredentials: true }
          );
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default LawyerDashboard;
