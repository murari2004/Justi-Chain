const express = require("express");
const auth = require("../middleware/auth");
const Case = require("../models/Case");

const router = express.Router();

// 🔒 Lawyer only middleware
const lawyerOnly = (req, res, next) => {
  if (req.user.role !== "lawyer") {
    return res.status(403).json({ msg: "Lawyer access only" });
  }
  next();
};

// 🔹 Get cases taken by lawyer
router.get("/my-cases", auth, lawyerOnly, async (req, res) => {
  const cases = await Case.find({
    assignedLawyers: req.user.id
  });

  res.json(cases);
});

// 🔹 TAKE CASE (self-assign)
router.post("/take-case", auth, lawyerOnly, async (req, res) => {
  const { caseId } = req.body;

  if (!caseId) {
    return res.status(400).json({ msg: "Case ID required" });
  }

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  // already taken?
  if (c.assignedLawyers.includes(req.user.id)) {
    return res.status(400).json({ msg: "You already took this case" });
  }

  c.assignedLawyers.push(req.user.id);
  await c.save();

  res.json({ msg: "Case successfully taken" });
});

// 🔹 Enter courtroom (only if taken)
router.post("/enter-case", auth, lawyerOnly, async (req, res) => {
  const { caseId } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  if (!c.assignedLawyers.includes(req.user.id)) {
    return res.status(403).json({ msg: "You have not taken this case" });
  }

  res.json({
    ok: true,
    lawyerName: req.user.name
  });
});

module.exports = router;
