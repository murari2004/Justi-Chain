const express = require("express");
const auth = require("../middleware/auth");
const Case = require("../models/Case");

const router = express.Router();

/**
 * Register new case
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

  res.json(newCase);
});

/**
 * Get citizen's cases
 */
router.get("/my-cases", auth, async (req, res) => {
  if (req.user.role !== "citizen")
    return res.status(403).json({ msg: "Access denied" });

  const cases = await Case.find({ citizenId: req.user.id });
  res.json(cases);
});

/**
 * Validate caseId for courtroom
 */
router.post("/enter-case", auth, async (req, res) => {
  const { caseId } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  if (c.citizenId.toString() !== req.user.id)
    return res.status(403).json({ msg: "Not your case" });

  res.json({ ok: true, caseId });
});

module.exports = router;
