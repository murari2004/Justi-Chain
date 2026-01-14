import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

/* 🔌 SINGLE SOCKET INSTANCE */
const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"]
});

function Courtroom() {
  const caseId = window.location.pathname.split("/")[2];
  const joinedRef = useRef(false);

  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [opponentEmail, setOpponentEmail] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  /* 🔐 LOAD USER FROM JWT */
  useEffect(() => {
  const roleFromSession = sessionStorage.getItem("role");

  // 🔹 Judge / Opponent → NO JWT
  if (roleFromSession === "judge" || roleFromSession === "opponent") {
    setRole(roleFromSession);
    setUserId("SYSTEM"); // dummy safe value
    setOpponentEmail(sessionStorage.getItem("opponentEmail"));
    return;
  }

  // 🔹 Citizen / Lawyer / Police → JWT REQUIRED
  const loadMe = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/auth/me",
        { withCredentials: true }
      );

      setRole(res.data.role);
      setUserId(res.data.userId || res.data.id || res.data._id);
      setOpponentEmail(res.data.email || null);
    } catch {
      setError("User role not found. Please login again.");
    }
  };

  loadMe();
}, []);



  useEffect(() => {
    if (!role || !userId || joinedRef.current) return;

    joinedRef.current = true;

    socket.emit("join_courtroom", {
      caseId,
      role,
      userId,
      opponentEmail
    });

    socket.on("join_error", setError);

    socket.on("system_message", (msg) =>
      setMessages((prev) => [
        ...prev,
        { sender: "SYSTEM", text: msg.text }
      ])
    );

    socket.on("new_message", (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    return () => {
      socket.off("join_error");
      socket.off("system_message");
      socket.off("new_message");
    };
  }, [role, userId, opponentEmail, caseId]);

  /* 💬 SEND MESSAGE */
  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send_message", { text });
    setText("");
  };

  if (error) return <h3 style={{ color: "red" }}>{error}</h3>;
  if (!role || !userId) return <p>Joining courtroom...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏛️ Courtroom – Case {caseId}</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px"
        }}
      >
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.sender}:</b> {m.text}
          </p>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type statement..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Courtroom;
