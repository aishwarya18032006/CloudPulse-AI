import { Router } from "express";

const router = Router();
const ML_MODEL_URL = process.env.ML_MODEL_URL || "http://localhost:8000";

router.post("/predict", async (req, res) => {
  res.json({ message: "Test response", ml_url: ML_MODEL_URL });
});

export default router;
