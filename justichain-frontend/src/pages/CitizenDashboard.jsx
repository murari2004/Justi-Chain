import axios from "axios";
import { useEffect, useState } from "react";

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

    window.location.href = `/courtroom/${caseId}`;
  } catch (err) {
    setError(err.response?.data?.msg || "Unauthorized or courtroom closed");
  }
};

  return (
    <div style={{ padding: "30px", maxWidth: "900px" }}>
      <h2>👤 Citizen Dashboard</h2>
      <p><b>User:</b> {user.name}</p>

      <hr />

      <h3>Enter Courtroom</h3>
      <input
        placeholder="JC-xxxx"
        value={caseId}
        onChange={(e) => setCaseId(e.target.value)}
      />
      <button onClick={enterCourt}>Enter</button>

      <hr />

      <h3>Register New Case</h3>

      <input
        placeholder="Case Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%" }}
      /><br /><br />

      <select
        value={caseType}
        onChange={(e) => setCaseType(e.target.value)}
        style={{ width: "100%" }}
      >
        <option value="">Select Case Type</option>
        <option value="Civil">Civil</option>
        <option value="Crime">Crime</option>
        <option value="Land">Land</option>
        <option value="Discrimination">Discrimination</option>
      </select><br /><br />

      <textarea
        placeholder="Describe your case"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        style={{ width: "100%" }}
      /><br /><br />

      <input
        placeholder="Opponent (optional)"
        value={opponent}
        onChange={(e) => setOpponent(e.target.value)}
        style={{ width: "100%" }}
      /><br /><br />

      <button onClick={registerCase}>Submit Case</button>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />

      <h3>Your Cases</h3>
      {cases.length === 0 && <p>No cases found</p>}

      {cases.map(c => (
        <div
          key={c.caseId}
          style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "12px" }}
        >
          <b>{c.caseId}</b><br />
          {c.title}<br />
          Status: {c.status}<br />

          {c.lawyerId ? (
            <p style={{ color: "green" }}>
              <b>Lawyer Assigned:</b><br />
              {c.lawyerId.name}<br />
              {c.lawyerId.email}
            </p>
          ) : (
            <>
              <p style={{ color: "orange" }}>No lawyer assigned</p>

              <button onClick={() => loadLawyerSuggestions(c.caseId)}>
                Suggest Lawyers
              </button>

              {Array.isArray(lawyerSuggestions[c.caseId]) &&
                lawyerSuggestions[c.caseId].map(l => (
                  <div
                    key={l._id}
                    style={{ border: "1px dashed #aaa", padding: "8px", marginTop: "8px" }}
                  >
                    <b>{l.name}</b><br />
                    <small>{l.email}</small><br />
                    <button
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

export default CitizenDashboard;
