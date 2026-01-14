const express = require("express");
const crypto = require("crypto");
const Case = require("../models/Case");
const User = require("../models/User");

const router = express.Router();

/* Get all cases */
router.get("/cases", async (req, res) => {
  const cases = await Case.find()
    .populate("citizenId", "name email")
    .populate("lawyerId", "name email")
    .populate("policeId", "name email")
    .sort({ createdAt: -1 });

  res.json(cases);
});

/* Get police list */
router.get("/police-list", async (req, res) => {
  const policeUsers = await User.find({ role: "police" }).select("name email");
  res.json(policeUsers);
});

/* Add opponent */
router.post("/add-opponent", async (req, res) => {
  const { caseId, name, email } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  c.opponent = { name, email };
  await c.save();

  console.log(`Opponent invited: ${email}`);
  res.json({ success: true });
});

/* Assign police */
router.post("/assign-police", async (req, res) => {
  const { caseId, policeId } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  c.policeId = policeId;
  await c.save();

  res.json({ success: true });
});

/* Schedule hearing (FIXED) */
router.post("/schedule-hearing", async (req, res) => {
  const { caseId, hearingDate } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  c.hearings.push({
    hearingId: "HEARING_" + Date.now(),
    hearingDate,
    isOpen: false
  });

  // 🔴 THIS LINE WAS MISSING
  c.hearingDate = hearingDate;

  c.status = "HEARING_SCHEDULED";
  await c.save();

  res.json({ success: true });
});

/* Open / Close courtroom */
router.post("/courtroom-control", async (req, res) => {
  const { caseId, open } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  if (open === true) {
    if (!c.hearings || c.hearings.length === 0) {
      return res.status(400).json({
        msg: "Schedule hearing before opening courtroom"
      });
    }

    c.hearings.forEach(h => (h.isOpen = false));

    const hearing = c.hearings[c.hearings.length - 1];
    hearing.isOpen = true;
    hearing.courtRoomId = "COURT_" + Date.now();
    hearing.password = crypto.randomBytes(4).toString("hex");

    c.courtroomOpen = true;
    c.courtRoomId = hearing.courtRoomId;
    c.courtAccessPassword = hearing.password;

    console.log("📢 Courtroom Opened");
    console.log("Case:", caseId);
    console.log("Password:", hearing.password);
  } else {
    c.courtroomOpen = false;
  }

  await c.save();
  res.json({ success: true });
});

module.exports = router;
