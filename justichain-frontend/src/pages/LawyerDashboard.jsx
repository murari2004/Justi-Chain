import axios from "axios";
import { useEffect, useState } from "react";
import "../styles/lawyer.css";

function LawyerDashboard() {
  const [user, setUser] = useState({ name: "" });
  const [requests, setRequests] = useState([]);
  const [cases, setCases] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
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

        await loadRequests();
        await loadCases();
      } catch {
        window.location.href = "/";
      }
    };

    init();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/lawyer/requests",
        { withCredentials: true }
      );
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRequests([]);
    }
  };

  const loadCases = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/lawyer/my-cases",
        { withCredentials: true }
      );
      setCases(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCases([]);
    }
  };

  const acceptRequest = async (requestId) => {
    setMessage("");
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/lawyer/accept-request",
        { requestId },
        { withCredentials: true }
      );

      setMessage("Case accepted successfully");
      await loadRequests();
      await loadCases();
    } catch {
      setError("Failed to accept request");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/lawyer/reject-request",
        { requestId },
        { withCredentials: true }
      );
      await loadRequests();
    } catch {
      alert("Failed to reject request");
    }
  };

  const enterCourt = async (caseId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/lawyer/enter-case",
        { caseId },
        { withCredentials: true }
      );

      sessionStorage.setItem("role", "lawyer");
      window.location.href = `/courtroom/${caseId}`;
    } catch {
      alert("Not authorized");
    }
  };

  return (
    <div className="lawyer-dashboard">

      {/* ===== TOP BAR ===== */}
      <div className="top-bar">
        <h2>⚖️ Lawyer Dashboard</h2>

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

<div className="advocate-info">
  Advocate: <span>{user.name}</span>
</div>


      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      {/* ===== PENDING REQUESTS BOX ===== */}
      <div className="section-box">
        <h3>📩 Pending Requests</h3>
        {requests.length === 0 && <p>No pending requests</p>}

        {requests.map((r) => (
          <div key={r._id} className="card">
            <b>Case ID:</b> {r.caseId}<br />
            <b>Citizen:</b> {r.citizenId?.name}<br />

            <button
              className="btn btn-accept"
              onClick={() => acceptRequest(r._id)}
            >
              Accept
            </button>

            <button
              className="btn btn-reject"
              onClick={() => rejectRequest(r._id)}
            >
              Reject
            </button>
          </div>
        ))}
      </div>

      {/* ===== MY CASES BOX ===== */}
      <div className="section-box">
        <h3>📂 My Cases</h3>
        {cases.length === 0 && <p>No cases assigned yet</p>}

        {cases.map((c) => (
          <div key={c.caseId} className="card">
            <b>{c.caseId}</b> — {c.title} ({c.status})
            <br />
            <button
              className="btn btn-enter"
              onClick={() => enterCourt(c.caseId)}
            >
              Enter Courtroom
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default LawyerDashboard;
