import axios from "axios";
import { useEffect, useState } from "react";

function CitizenDashboard() {
  const [user, setUser] = useState({ name: "" });
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [error, setError] = useState("");

  // 🔐 PROTECT DASHBOARD + FETCH USER NAME
  useEffect(() => {
    const init = async () => {
      try {
        // 1️⃣ Check auth + role
        const me = await axios.get(
          "http://localhost:5000/api/auth/me",
          { withCredentials: true }
        );

        if (me.data.role !== "citizen") {
          window.location.href = "/";
          return;
        }

        // 2️⃣ Save citizen name
        setUser({ name: me.data.name });

        // 3️⃣ Load citizen cases
        const res = await axios.get(
          "http://localhost:5000/api/citizen/my-cases",
          { withCredentials: true }
        );

        setCases(res.data);
      } catch {
        window.location.href = "/";
      }
    };

    init();
  }, []);

  // 🏛️ Enter courtroom
  const enterCourt = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/citizen/enter-case",
        { caseId },
        { withCredentials: true }
      );

      window.location.href = `/courtroom/${caseId}`;
    } catch {
      setError("Invalid or unauthorized case ID");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>👤 Citizen Dashboard</h2>
      <p><b>User:</b> {user.name}</p>

      <hr />

      {/* ENTER CASE */}
      <h3>Enter Case ID</h3>
      <input
        placeholder="JC-xxxx"
        value={caseId}
        onChange={e => setCaseId(e.target.value)}
      />
      <button onClick={enterCourt}>Enter Courtroom</button>
      <p style={{ color: "red" }}>{error}</p>

      <hr />

      {/* MY CASES */}
      <h3>Your Cases</h3>
      {cases.length === 0 && <p>No cases found</p>}

      {cases.map(c => (
        <div key={c.caseId} style={{ marginBottom: "10px" }}>
          <b>{c.caseId}</b> — {c.title} ({c.status})
        </div>
      ))}

      <hr />

      {/* ACTIONS */}
      <button onClick={() => window.location.href = "/register-case"}>
        Register New Case
      </button>

      <br /><br />

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

export default CitizenDashboard;
