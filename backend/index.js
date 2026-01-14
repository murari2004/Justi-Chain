const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");                 // ✅ ADD
const { Server } = require("socket.io");      // ✅ ADD

const app = express();
const server = http.createServer(app);        // ✅ ADD

// IMPORTANT for cookies
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/protected", require("./routes/protected.routes"));
app.use("/api/citizen", require("./routes/citizen.routes"));
app.use("/api/police", require("./routes/police.routes"));
app.use("/api/lawyer", require("./routes/lawyer.routes"));
app.use("/api/judge", require("./routes/judge.routes"));

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/justichain")
  .then(() => console.log("MongoDB Connected"));

// 🔌 SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true          // ✅ REQUIRED
  }
});


// make io available globally if needed
app.set("io", io);

// 👇 Courtroom socket logic
require("./socket/courtroom.socket")(io);

// Server
server.listen(5000, () => {
  console.log("Server running on port 5000 with Socket.IO");
});
