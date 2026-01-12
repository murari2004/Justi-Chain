const express = require("express");
const auth = require("../middleware/auth");
const Case = require("../models/Case");

const router = express.Router();

/**
 * 🔹 GET: Police Dashboard – My Assigned Cases
 */
router.get("/my-cases", auth, async (req, res) => {
  if (req.user.role !== "police") {
    return res.status(403).json({ msg: "Access denied" });
  }

  const cases = await Case.find({
    assignedPoliceId: req.user.id
  }).populate("assignedPoliceId", "name");

  res.json(cases);
});

/**
 * 🔹 POST: Self-Assign Case using Case ID
 */
router.post("/assign", auth, async (req, res) => {
  if (req.user.role !== "police") {
    return res.status(403).json({ msg: "Access denied" });
  }

  const { caseId } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  if (c.assignedPoliceId) {
    return res.status(400).json({ msg: "Case already assigned" });
  }

  if (c.status !== "registered") {
    return res.status(400).json({ msg: "Case not available for assignment" });
  }

  c.assignedPoliceId = req.user.id;
  c.policeAssignedAt = new Date();
  c.policeAssignmentMode = "self-assigned";
  c.status = "investigation";

  await c.save();

  res.json({
    msg: "Case successfully assigned",
    caseId: c.caseId
  });
});

/**
 * 🔹 POST: Enter Case (Courtroom Access Check)
 */
router.post("/enter-case", auth, async (req, res) => {
  if (req.user.role !== "police") {
    return res.status(403).json({ msg: "Access denied" });
  }

  const { caseId } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  if (c.assignedPoliceId.toString() !== req.user.id) {
    return res.status(403).json({ msg: "You are not assigned to this case" });
  }

  res.json({
    ok: true,
    caseId: c.caseId,
    policeName: req.user.name,
    status: c.status
  });
});

/**
 * 🔹 POST: Add Investigation Note / Evidence Description
 */
router.post("/add-note", auth, async (req, res) => {
  if (req.user.role !== "police") {
    return res.status(403).json({ msg: "Access denied" });
  }

  const { caseId, note } = req.body;

  const c = await Case.findOne({ caseId });
  if (!c) return res.status(404).json({ msg: "Case not found" });

  if (c.assignedPoliceId.toString() !== req.user.id) {
    return res.status(403).json({ msg: "Not authorized" });
  }

  c.investigationNotes.push({ note });
  await c.save();

  res.json({ msg: "Investigation note added" });
});

module.exports = router;
