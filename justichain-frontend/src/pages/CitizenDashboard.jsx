import axios from "axios";
import { useEffect, useState } from "react";
import "../styles/citizen.css";

function CitizenDashboard() {
  const [user, setUser] = useState({ name: "" });
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState("");

  // register case fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caseType, setCaseType] = useState("");
  const [opponent, setOpponent] = useState("");

  // per-case lawyer suggestions
  const [lawyerSuggestions, setLawyerSuggestions] = useState({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔐 AUTH + LOAD CASES
  useEffect(() => {
    const init = async () => {
      try {
        const me = await axios.get(
          "http://localhost:5000/api/auth/me",
          { withCredentials: true }
        );

        if (me.data.role !== "citizen") {
          window.location.href = "/";
          return;
        }

        setUser({ name: me.data.name });

        await loadCases();
      } catch {
        window.location.href = "/";
      }
    };

    init();
  }, []);

  const loadCases = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/citizen/my-cases",
      { withCredentials: true }
    );
    setCases(Array.isArray(res.data) ? res.data : []);
  };

  // 📝 REGISTER CASE
  const registerCase = async () => {
    setError("");
    setSuccess("");

    if (!title || !description || !caseType) {
      setError("Fill all required fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/citizen/register-case",
        { title, description, caseType, opponent },
        { withCredentials: true }
      );

      setSuccess("Case registered successfully");

      setTitle("");
      setDescription("");
      setCaseType("");
      setOpponent("");

      await loadCases();
    } catch {
      setError("Failed to register case");
    }
  };

  // 👨‍⚖️ LOAD LAWYER SUGGESTIONS (PER CASE)
  const loadLawyerSuggestions = async (caseId) => {
    if (lawyerSuggestions[caseId]) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/citizen/suggest-lawyers/${caseId}`,
        { withCredentials: true }
      );

      setLawyerSuggestions(prev => ({
        ...prev,
        [caseId]: Array.isArray(res.data) ? res.data : []
      }));
    } catch {
      setLawyerSuggestions(prev => ({
        ...prev,
        [caseId]: []
      }));
    }
  };

  // 📤 SEND LAWYER REQUEST
  const sendLawyerRequest = async (lawyerId, caseId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/citizen/send-lawyer-request",
        { lawyerId, caseId },
        { withCredentials: true }
      );
      alert("Request sent");
    } catch {
      alert("Request already sent");
    }
  };

  // 🏛️ ENTER COURTROOM
  const enterCourt = async () => {
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/citizen/enter-case",
        { caseId },
        { withCredentials: true }
      );
      sessionStorage.setItem("role", "citizen");
      window.location.href = `/courtroom/${caseId}`;
    } catch (err) {
      setError(err.response?.data?.msg || "Unauthorized or courtroom closed");
    }
  };

  return (
    <div className="dashboard-page">

      {/* TOP BAR */}
      <div className="dashboard-header">
        <h2>👤 Citizen Dashboard</h2>

        <button
          className="logout-btn"
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

      {/* MAIN CARD */}
      <div className="dashboard-card">

        {/* SECTION 1 */}
        <div className="section">
          <p><b>User:</b> {user.name}</p>

          <div className="courtroom-section">
            <h3>Enter Courtroom</h3>
            <input
              placeholder="JC-xxxx"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
            <button className="primary-btn" onClick={enterCourt}>
              Enter
            </button>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="section register-section">
          <h3>Register New Case</h3>

          <div className="form-group">
            <label>Case Title</label>
            <input
              placeholder="Enter case title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Case Type</label>
            <select value={caseType} onChange={(e) => setCaseType(e.target.value)}>
              <option value="">Select Case Type</option>
              <option value="Civil">Civil</option>
              <option value="Crime">Crime</option>
              <option value="Land">Land</option>
              <option value="Discrimination">Discrimination</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe your case"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Opponent (optional)</label>
            <input
              placeholder="Opponent name"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
            />
          </div>

          <button className="primary-btn" onClick={registerCase}>
            Submit Case
          </button>

          {success && <p className="success">{success}</p>}
          {error && <p className="error">{error}</p>}
        </div>

        {/* SECTION 3 */}
        <div className="section">
          <h3>Your Cases</h3>

          {cases.length === 0 && <p>No cases found</p>}

          {cases.map(c => (
            <div className="case-box" key={c.caseId}>
              <b>{c.caseId}</b><br />
              {c.title}<br />
              Status: {c.status}<br />

              {c.lawyerId ? (
                <p className="assigned">
                  <b>Lawyer Assigned:</b><br />
                  {c.lawyerId.name}<br />
                  {c.lawyerId.email}
                </p>
              ) : (
                <>
                  <p className="no-lawyer">No lawyer assigned</p>

                  <button className="primary-btn" onClick={() => loadLawyerSuggestions(c.caseId)}>
                    Suggest Lawyers
                  </button>

                  {Array.isArray(lawyerSuggestions[c.caseId]) &&
                    lawyerSuggestions[c.caseId].map(l => (
                      <div className="lawyer-card" key={l._id}>
                        <b>{l.name}</b><br />
                        <small>{l.email}</small><br />
                        <button
                          className="primary-btn"
                          onClick={() => sendLawyerRequest(l._id, c.caseId)}
                        >
                          Send Request
                        </button>
                      </div>
                    ))
                  }
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default CitizenDashboard;
