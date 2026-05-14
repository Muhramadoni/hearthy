const express = require("express");
const { predictHeartHealth } = require("../controllers/predictController");

const router = express.Router();

// POST /api/predict
router.post("/predict", predictHeartHealth);

module.exports = router;
