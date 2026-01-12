const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true, index: true },

  title: String,
  description: String,
  caseType: String,

  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },

  opponent: {
    name: String,
    email: String,
    phone: String
  },

  status: {
    type: String,
    enum: ["registered", "investigation", "hearing", "closed"],
    default: "registered"
  },

  // 👮 Police (one)
  assignedPoliceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true
  },

  policeAssignedAt: Date,
  policeAssignmentMode: {
    type: String,
    enum: ["self-assigned", "court-assigned"]
  },

  // ⚖️ Lawyers (many)
  assignedLawyers: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    default: [],
    index: true
  },

  // 📝 Police investigation notes
  investigationNotes: [
    {
      note: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Case", caseSchema);
