import axios from "axios";
import { useEffect, useState } from "react";

function PoliceDashboard() {
  const [user, setUser] = useState({ name: "" });
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const me = await axios.get(
          "http://localhost:5000/api/auth/me",
          { withCredentials: true }
        );

        if (me.data.role !== "police") {
          window.location.href = "/";
          return;
        }

        setUser({ name: me.data.name });

        const res = await axios.get(
          "http://localhost:5000/api/police/my-cases",
          { withCredentials: true }
        );

        setCases(res.data);
      } catch {
        window.location.href = "/";
      }
    };

    init();
  }, []);

  // 🟢 Assign Case
  const assignCase = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/police/assign",
        { caseId },
        { withCredentials: true }
      );

      setMessage(res.data.msg);
      setCaseId("");

      const updated = await axios.get(
        "http://localhost:5000/api/police/my-cases",
        { withCredentials: true }
      );
      setCases(updated.data);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Assignment failed");
    }
  };

  // 🏛️ Enter Courtroom
  const enterCourtroom = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/police/enter-case",
        { caseId: id },
        { withCredentials: true }
      );

      // ✅ CRITICAL FIX
      sessionStorage.setItem("role", "police");

      window.location.href = `/courtroom/${id}`;
    } catch {
      alert("Not authorized or courtroom closed");
    }
  };

  // 📝 Add Note
  const addNote = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/police/add-note",
        { caseId, note },
        { withCredentials: true }
      );

      setMessage("Investigation note added");
      setNote("");
    } catch {
      setMessage("Failed to add note");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>👮 Police Dashboard</h2>
      <p><b>Officer:</b> {user.name}</p>

      {message && <p>{message}</p>}

      <hr />

      <h3>Assign Case</h3>
      <input
        placeholder="Enter Case ID"
        value={caseId}
        onChange={e => setCaseId(e.target.value)}
      />
      <button onClick={assignCase}>Assign Case</button>

      <hr />

      <h3>Add Investigation Note</h3>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <br />
      <button onClick={addNote}>Submit Note</button>

      <hr />

      <h3>My Assigned Cases</h3>
      {cases.length === 0 && <p>No assigned cases yet</p>}

      {cases.map(c => (
        <div key={c.caseId} style={{ marginBottom: "10px" }}>
          <b>{c.caseId}</b> — {c.title} ({c.status})
          <br />
          <button onClick={() => enterCourtroom(c.caseId)}>
            Enter Courtroom
          </button>
        </div>
      ))}

      <hr />

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

export default PoliceDashboard;
