const mongoose = require("mongoose");

const hearingSchema = new mongoose.Schema({
  hearingId: String,
  hearingDate: Date,
  isOpen: {
    type: Boolean,
    default: false
  },
  courtRoomId: String,
  password: String
});

const caseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true },

  title: String,
  description: String,
  caseType: String,

  opponent: {
    name: String,
    email: String
  },

  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  policeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  status: {
    type: String,
    enum: [
      "CREATED",
      "LAWYER_REQUESTED",
      "LAWYER_ASSIGNED",
      "HEARING_SCHEDULED",
      "CLOSED"
    ],
    default: "CREATED"
  },

  // 🔑 COURTROOM STATE
  courtroomOpen: {
    type: Boolean,
    default: false
  },

  courtRoomId: String,
  courtAccessPassword: String,

  // 📅 CURRENT HEARING (for dashboard)
  hearingDate: Date,

  // 🧾 ALL HEARINGS
  hearings: {
    type: [hearingSchema],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Case", caseSchema);
