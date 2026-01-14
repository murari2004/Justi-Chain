import axios from "axios";
import { useEffect, useState } from "react";

function JudgeDashboard() {
  const [cases, setCases] = useState([]);
  const [policeList, setPoliceList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCases();
    loadPolice();
  }, []);

  const loadCases = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/judge/cases");
      setCases(res.data);
    } catch {
      setError("Failed to load cases");
    }
  };

  const loadPolice = async () => {
    const res = await axios.get("http://localhost:5000/api/judge/police-list");
    setPoliceList(res.data);
  };

  const assignPolice = async (caseId, policeId) => {
    if (!policeId) return;
    await axios.post("http://localhost:5000/api/judge/assign-police", {
      caseId,
      policeId
    });
    loadCases();
  };

  const addOpponent = async (caseId, name, email) => {
    if (!name || !email) return alert("Enter opponent details");
    await axios.post("http://localhost:5000/api/judge/add-opponent", {
      caseId,
      name,
      email
    });
    loadCases();
  };

  const scheduleHearing = async (caseId, hearingDate) => {
    if (!hearingDate) return;
    await axios.post("http://localhost:5000/api/judge/schedule-hearing", {
      caseId,
      hearingDate
    });
    loadCases();
  };

  const toggleCourtroom = async (caseId, open) => {
    await axios.post("http://localhost:5000/api/judge/courtroom-control", {
      caseId,
      open
    });
    loadCases();
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1100px", margin: "auto" }}>
      <h2>👨‍⚖️ Judge Dashboard</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {cases.map((c) => {
        const canEnterCourtroom =
          c.lawyerId &&
          c.policeId &&
          c.opponent?.email &&
          c.hearingDate &&
          c.courtroomOpen;

        return (
          <div
            key={c.caseId}   // ✅ already correct
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "20px"
            }}
          >
            <b>Case ID:</b> {c.caseId}<br />
            <b>Title:</b> {c.title}<br />
            <b>Status:</b> {c.status}<br />
            <b>Police:</b> {c.policeId?.name || "Not assigned"}<br />
            <b>Opponent:</b> {c.opponent?.email || "Not added"}<br />
            <b>Hearing:</b>{" "}
            {c.hearingDate
              ? new Date(c.hearingDate).toLocaleString()
              : "Not scheduled"}<br />
            <b>Courtroom:</b> {c.courtroomOpen ? "OPEN" : "CLOSED"}

            {c.courtroomOpen && (
              <p style={{ color: "green" }}>
                🔑 Password: <b>{c.courtAccessPassword}</b>
              </p>
            )}

            {/* 👮 Assign Police */}
            {!c.policeId && (
              <select
                onChange={(e) => assignPolice(c.caseId, e.target.value)}
              >
                <option value="">Assign Police</option>
                {policeList.map((p) => (
                  <option
                    key={p._id}          // ✅ FIXED HERE
                    value={p._id}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* 👤 Add Opponent */}
            {!c.opponent?.email && (
              <>
                <input
                  placeholder="Opponent Name"
                  onChange={(e) => (c._name = e.target.value)}
                />
                <input
                  placeholder="Opponent Email"
                  onChange={(e) => (c._email = e.target.value)}
                />
                <button
                  onClick={() =>
                    addOpponent(c.caseId, c._name, c._email)
                  }
                >
                  Add Opponent
                </button>
              </>
            )}

            <br /><br />

            {/* 📅 Schedule Hearing */}
            <input
              type="datetime-local"
              onChange={(e) =>
                scheduleHearing(c.caseId, e.target.value)
              }
            />

            <br /><br />

            {/* 🚪 Courtroom Control */}
            <button onClick={() => toggleCourtroom(c.caseId, true)}>
              Open Courtroom
            </button>
            <button onClick={() => toggleCourtroom(c.caseId, false)}>
              Close Courtroom
            </button>

            <br /><br />

            {/* 🏛️ Enter Courtroom */}
            {canEnterCourtroom ? (
              <button
  onClick={() => {
    sessionStorage.setItem("role", "judge");   // ✅ ADD THIS
    window.location.href = `/courtroom/${c.caseId}`;
  }}
>
  Enter Courtroom
</button>

            ) : (
              <p style={{ color: "orange" }}>
                ⚠️ Complete all assignments before courtroom access
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default JudgeDashboard;
