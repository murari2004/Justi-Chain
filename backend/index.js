const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

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


// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/justichain")
  .then(() => console.log("MongoDB Connected"));

// Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
