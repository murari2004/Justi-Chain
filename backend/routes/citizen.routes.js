const express = require("express");
const auth = require("../middleware/auth");
const Case = require("../models/Case");
const LawyerRequest = require("../models/LawyerRequest");
const User = require("../models/User");

const router = express.Router();

/**
 * Register case
 */
router.post("/register-case", auth, async (req, res) => {
  if (req.user.role !== "citizen")
    return res.status(403).json({ msg: "Access denied" });

  const { title, description, caseType, opponent } = req.body;

  const caseId = "JC-" + Date.now();

  const newCase = await Case.create({
    caseId,
    title,
    description,
    caseType,
    opponent,
    citizenId: req.user.id
  });

  res.json({ case: newCase });
});

/**
 * Get citizen cases WITH lawyer info
 */
router.get("/my-cases", auth, async (req, res) => {
  if (req.user.role !== "citizen")
    return res.status(403).json({ msg: "Access denied" });

  const cases = await Case.find({
    citizenId: req.user.id
  })
    .populate("lawyerId", "name email")
    .sort({ createdAt: -1 });

  res.json(cases);
});
/**
 * Enter courtroom (Citizen)
 */
router.post("/enter-case", auth, async (req, res) => {
  if (req.user.role !== "citizen")
    return res.status(403).json({ msg: "Access denied" });

  const { caseId } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c)
    return res.status(404).json({ msg: "Case not found" });

  // ✅ Ensure citizen owns the case
  if (c.citizenId.toString() !== req.user.id)
    return res.status(403).json({ msg: "Unauthorized case access" });

  // ✅ Ensure courtroom is open
  if (!c.courtroomOpen || !c.courtRoomId)
    return res.status(403).json({ msg: "Courtroom not open" });

  res.json({
    success: true,
    courtRoomId: c.courtRoomId
  });
});

/**
 * Suggest lawyers for a case (only if not assigned)
 */
router.get("/suggest-lawyers/:caseId", auth, async (req, res) => {
  if (req.user.role !== "citizen")
    return res.status(403).json({ msg: "Access denied" });

  const { caseId } = req.params;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json([]);

  if (c.lawyerId) return res.json([]); // already assigned

  const lawyers = await User.find({
    role: "lawyer"
  }).select("name email");

  res.json(lawyers);
});

/**
 * Send lawyer request
 */
router.post("/send-lawyer-request", auth, async (req, res) => {
  if (req.user.role !== "citizen")
    return res.status(403).json({ msg: "Access denied" });

  const { caseId, lawyerId } = req.body;

  const exists = await LawyerRequest.findOne({
    caseId,
    lawyerId,
    citizenId: req.user.id
  });

  if (exists)
    return res.status(400).json({ msg: "Request already sent" });

  await LawyerRequest.create({
    caseId,
    lawyerId,
    citizenId: req.user.id
  });

  await Case.updateOne(
    { caseId },
    { status: "LAWYER_REQUESTED" }
  );

  res.json({ success: true });
});

module.exports = router;
