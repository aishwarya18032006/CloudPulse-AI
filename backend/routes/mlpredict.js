import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  const { data } = req.body;
  const ML_MODEL_URL = process.env.ML_MODEL_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${ML_MODEL_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`ML server error: ${response.status}`);
    }

    const prediction = await response.json();
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
