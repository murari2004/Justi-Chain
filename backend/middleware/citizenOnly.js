const express = require("express");
const auth = require("../middleware/auth");
const citizenOnly = require("../middleware/citizenOnly");
const Case = require("../models/Case");

const router = express.Router();

// 🔒 Protect ALL citizen routes
router.use(auth, citizenOnly);

/**
 * 🔹 Register new case
 */
router.post("/register-case", async (req, res) => {
  try {
    const { title, description, caseType, opponent } = req.body;

    if (!title || !description || !caseType) {
      return res.status(400).json({ msg: "All fields are required" });
    }

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
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * 🔹 Get citizen's cases
 */
router.get("/my-cases", async (req, res) => {
  try {
    const cases = await Case.find({
      citizenId: req.user.id
    });

    res.json(cases);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * 🔹 Validate caseId for courtroom entry
 */
router.post("/enter-case", async (req, res) => {
  try {
    const { caseId } = req.body;

    if (!caseId) {
      return res.status(400).json({ msg: "Case ID required" });
    }

    const c = await Case.findOne({ caseId });
    if (!c) return res.status(404).json({ msg: "Case not found" });

    if (c.citizenId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not your case" });
    }

    res.json({
      ok: true,
      caseId: c.caseId
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
