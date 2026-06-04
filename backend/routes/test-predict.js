import { Router } from "express";

const router = Router();

router.post("/predict", async (req, res) => {
  res.json({ message: "It works!", test: true });
});

export default router;
