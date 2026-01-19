import axios from "axios";
import { useEffect, useState } from "react";
import "../styles/police.css";

function PoliceDashboard() {
  const [user, setUser] = useState({ name: "" });
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [note, setNote] = useState("");

  // Separate messages for each section
  const [assignMsg, setAssignMsg] = useState("");
  const [noteMsg, setNoteMsg] = useState("");

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

  const assignCase = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/police/assign",
        { caseId },
        { withCredentials: true }
      );

      setAssignMsg(res.data.msg);
      setCaseId("");

      const updated = await axios.get(
        "http://localhost:5000/api/police/my-cases",
        { withCredentials: true }
      );
      setCases(updated.data);
    } catch (err) {
      setAssignMsg(err.response?.data?.msg || "Assignment failed");
    }
  };

  const enterCourtroom = async (id) => {
    try {
      await axios.post(
        "http://localhost:5000/api/police/enter-case",
        { caseId: id },
        { withCredentials: true }
      );

      sessionStorage.setItem("role", "police");
      window.location.href = `/courtroom/${id}`;
    } catch {
      alert("Not authorized or courtroom closed");
    }
  };

  const addNote = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/police/add-note",
        { caseId, note },
        { withCredentials: true }
      );

      setNoteMsg("Investigation note added");
      setNote("");
    } catch {
      setNoteMsg("Failed to add note");
    }
  };

  return (
    <div className="police-dashboard">
      <div className="top-bar">
        <h2>👮 Police Dashboard</h2>

        <button
          className="btn btn-logout"
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

      <div className="section-wrapper">
        <div className="officer-label">
          Officer: {user.name}
        </div>

        {/* ====== ASSIGN CASE BOX ====== */}
        <div className="section-box">
          <h3>Assign Case</h3>

          {/* MESSAGE INSIDE THIS BOX */}
          {assignMsg && <p className="box-message">{assignMsg}</p>}

          <input
            placeholder="Enter Case ID"
            value={caseId}
            onChange={e => setCaseId(e.target.value)}
          />
          <button className="btn btn-assign" onClick={assignCase}>
            Assign Case
          </button>
        </div>

        {/* ====== ADD NOTE BOX ====== */}
        <div className="section-box">
          <h3>Add Investigation Note</h3>

          {/* MESSAGE INSIDE THIS BOX */}
          {noteMsg && <p className="box-message">{noteMsg}</p>}

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <br />
          <button className="btn btn-submit" onClick={addNote}>
            Submit Note
          </button>
        </div>

        {/* ====== CASE LIST BOX ====== */}
        <div className="section-box">
          <h3>My Assigned Cases</h3>

          {cases.length === 0 && <p>No assigned cases yet</p>}

          {cases.map(c => (
            <div key={c.caseId} className="card">
              <b>{c.caseId}</b> — {c.title} ({c.status})
              <br />
              <button className="btn btn-enter" onClick={() => enterCourtroom(c.caseId)}>
                Enter Courtroom
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PoliceDashboard;
